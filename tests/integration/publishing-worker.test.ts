import test from "node:test";
import assert from "node:assert/strict";
import "dotenv/config";
import crypto from "crypto";
import { prisma } from "../../src/lib/db/prisma";
import {
  validateJobBeforeDispatch,
  handleRevalidationFailure,
} from "../../src/jobs/revalidation";
import { sweepScheduledPosts } from "../../src/jobs/sweeper";
import { createPublishingWorker } from "../../src/jobs/worker";
import { publishingQueue, redisConnection } from "../../src/jobs/queue";
import { verifyUrlResolvability } from "../../src/jobs/url-validator";

test("Background Publishing Worker & PostgreSQL Outbox Sweeper Integration Tests", async (t) => {
  let createdItemId = "";
  let createdVersionId = "";
  let approvalId = "";
  const versionHash = crypto.createHash("sha256").update("Test Publishing Post").digest("hex");

  // Setup test content item & approval
  await t.test("setup: create an approved content item ready for scheduling", async () => {
    const item = await prisma.contentItem.create({
      data: {
        title: "Durable Publishing Worker Test Post",
        reviewState: "APPROVED",
        jobState: "SCHEDULED",
        publicationOutcome: "NOT_PUBLISHED",
        targetPlatform: "FACEBOOK",
        destinationPageId: "kewakibt_official_page",
        scheduledAt: new Date(Date.now() - 1000), // Due immediately
        versions: {
          create: {
            versionNumber: 1,
            versionHash,
            caption: "Transforming African businesses with custom software by Kewakibt.",
            mediaUrls: ["https://example.com/banner.jpg"],
            mediaHashes: [crypto.createHash("sha256").update("img").digest("hex")],
            destinationPageId: "kewakibt_official_page",
            ctaUrl: "https://kewakibt.com/contact",
            flaggedFacts: [],
            flaggedFactsResolved: true,
          },
        },
      },
      include: { versions: true },
    });

    createdItemId = item.id;
    createdVersionId = item.versions[0].id;

    await prisma.contentItem.update({
      where: { id: createdItemId },
      data: { currentVersionId: createdVersionId },
    });

    // Create active ApprovalRecord (APR-002)
    const approval = await prisma.approvalRecord.create({
      data: {
        contentItemId: createdItemId,
        contentVersionId: createdVersionId,
        adminId: "admin_yared",
        adminSessionId: "sess_worker_test",
        status: "ACTIVE",
        reviewedDiff: true,
        confirmedExactFinal: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Valid for 30 days
      },
    });
    approvalId = approval.id;

    assert.ok(createdItemId);
    assert.ok(createdVersionId);
    assert.ok(approvalId);
  });

  await t.test("APR-008: verifyUrlResolvability checks protocols, SSRF, and domain resolution", async () => {
    // Valid domain
    const validRes = await verifyUrlResolvability("https://kewakibt.com/contact");
    assert.equal(validRes.isResolvable, true);

    // Blocked SSRF loopback
    const ssrfRes = await verifyUrlResolvability("http://localhost:8080/internal");
    assert.equal(ssrfRes.isResolvable, false);
    assert.match(ssrfRes.error || "", /SSRF guard/);

    // Non-HTTP protocol
    const protoRes = await verifyUrlResolvability("ftp://ftp.example.com/file");
    assert.equal(protoRes.isResolvable, false);
    assert.match(protoRes.error || "", /protocol/);
  });

  await t.test("APR-004: validateJobBeforeDispatch passes for fully valid approved post", async () => {
    const res = await validateJobBeforeDispatch({
      contentItemId: createdItemId,
      contentVersionId: createdVersionId,
      destinationPageId: "kewakibt_official_page",
      idempotencyKey: `${createdVersionId}:kewakibt_official_page:1`,
      attemptIndex: 1,
    });

    assert.equal(res.valid, true);
    assert.ok(res.item);
    assert.ok(res.version);
    assert.ok(res.approval);
  });

  await t.test("APR-004(a): blocks dispatch on version mismatch and records DEAD_LETTERED", async () => {
    const fakeVersionId = "ver_mismatched_999";
    const res = await validateJobBeforeDispatch({
      contentItemId: createdItemId,
      contentVersionId: fakeVersionId,
      destinationPageId: "kewakibt_official_page",
      idempotencyKey: `${fakeVersionId}:page:1`,
      attemptIndex: 1,
    });

    assert.equal(res.valid, false);
    assert.equal(res.errorCode, "VERSION_MISMATCH");

    // Execute failure handler
    await handleRevalidationFailure(
      {
        contentItemId: createdItemId,
        contentVersionId: fakeVersionId,
        destinationPageId: "kewakibt_official_page",
        idempotencyKey: `${fakeVersionId}:page:1`,
        attemptIndex: 1,
      },
      res
    );

    const updatedItem = await prisma.contentItem.findUnique({ where: { id: createdItemId } });
    assert.equal(updatedItem?.jobState, "DEAD_LETTERED");
    assert.equal(updatedItem?.publicationOutcome, "FAILED");

    // Restore jobState to SCHEDULED for subsequent tests
    await prisma.contentItem.update({
      where: { id: createdItemId },
      data: { jobState: "SCHEDULED", publicationOutcome: "NOT_PUBLISHED" },
    });
  });

  await t.test("APR-004(c): blocks dispatch on expired approval (>30 days)", async () => {
    // Set approval expiresAt to yesterday
    await prisma.approvalRecord.update({
      where: { id: approvalId },
      data: { expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    const res = await validateJobBeforeDispatch({
      contentItemId: createdItemId,
      contentVersionId: createdVersionId,
      destinationPageId: "kewakibt_official_page",
      idempotencyKey: `${createdVersionId}:kewakibt_official_page:1`,
      attemptIndex: 1,
    });

    assert.equal(res.valid, false);
    assert.equal(res.errorCode, "APPROVAL_EXPIRED");

    // Restore active approval
    await prisma.approvalRecord.update({
      where: { id: approvalId },
      data: {
        status: "ACTIVE",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  });

  await t.test("PostgreSQL Outbox Sweeper: detects scheduled post and enqueues to Redis", async () => {
    const sweepRes = await sweepScheduledPosts();
    assert.ok(sweepRes.sweptCount >= 1);
    assert.ok(sweepRes.enqueuedCount >= 1);

    const sweptItem = sweepRes.items.find((it) => it.id === createdItemId);
    assert.ok(sweptItem);

    // Verify AuditLog
    const audit = await prisma.auditLog.findFirst({
      where: {
        action: "OUTBOX_SWEEPER_ENQUEUED",
        entityId: createdItemId,
      },
    });
    assert.ok(audit);
  });

  await t.test("Publishing Worker: processes job and transitions to PUBLISHED", async () => {
    const worker = createPublishingWorker();

    // Wait briefly for worker to pick up and process job
    let itemAfter = await prisma.contentItem.findUnique({ where: { id: createdItemId } });
    let attempts = 0;
    while (itemAfter?.publicationOutcome !== "PUBLISHED" && attempts < 20) {
      await new Promise((r) => setTimeout(r, 300));
      itemAfter = await prisma.contentItem.findUnique({ where: { id: createdItemId } });
      attempts++;
    }

    // Verify outcome
    assert.equal(itemAfter?.publicationOutcome, "PUBLISHED");
    assert.equal(itemAfter?.jobState, "UNSCHEDULED");

    // Verify PublishingAttempt record
    const attempt = await prisma.publishingAttempt.findFirst({
      where: { contentItemId: createdItemId },
    });
    assert.ok(attempt);
    assert.equal(attempt.status, "SUCCESS");
    assert.ok(attempt.platformPostId);

    // Clean up worker
    await worker.close();
  });

  // Teardown
  await t.after(async () => {
    try {
      await prisma.publishingAttempt.deleteMany({ where: { contentItemId: createdItemId } });
      await prisma.approvalRecord.deleteMany({ where: { contentItemId: createdItemId } });
      await prisma.contentVersion.deleteMany({ where: { contentItemId: createdItemId } });
      await prisma.contentItem.delete({ where: { id: createdItemId } }).catch(() => {});
    } catch {}
  });
});
