import test from "node:test";
import assert from "node:assert/strict";
import "dotenv/config";
import { generateAutomatedDrafts } from "../../src/server/actions/automation";
import { fastTrackApprove, batchFastTrackApprove } from "../../src/server/actions/approval";
import { prisma } from "../../src/lib/db/prisma";

test("Option A: Automated Draft Generation & 1-Click Fast-Track Approval Tests", async (t) => {
  let itemIds: string[] = [];

  await t.test("generateAutomatedDrafts: produces grounded drafts across services", async () => {
    const res = await generateAutomatedDrafts(2);
    assert.equal(res.success, true);
    assert.equal(res.createdCount, 2);
    assert.ok(res.items && res.items.length === 2);

    itemIds = res.items.map((it) => it.id);

    // Verify DB records
    for (const id of itemIds) {
      const item = await prisma.contentItem.findUnique({
        where: { id },
        include: { versions: true, currentVersion: true },
      });
      assert.ok(item);
      assert.equal(item.reviewState, "NEEDS_REVIEW");
      assert.equal(item.jobState, "UNSCHEDULED");
      assert.ok(item.currentVersion);
      assert.equal(item.currentVersion.versionHash.length, 64); // SHA-256 (APR-001)
    }

    // Verify AuditLog
    const audit = await prisma.auditLog.findFirst({
      where: { action: "AUTOMATION_DRAFTS_GENERATED" },
      orderBy: { createdAt: "desc" },
    });
    assert.ok(audit);
    assert.equal(audit.entityType, "ContentItem");
  });

  await t.test("fastTrackApprove: approves clean draft in 1-click & auto-schedules", async () => {
    assert.ok(itemIds.length >= 1);
    const targetId = itemIds[0];

    const approveRes = await fastTrackApprove({ contentItemId: targetId });
    assert.equal(approveRes.success, true);
    assert.ok(approveRes.approval);
    assert.equal(approveRes.approval.status, "ACTIVE");
    assert.equal(approveRes.approval.confirmedExactFinal, true);

    const updatedItem = await prisma.contentItem.findUnique({
      where: { id: targetId },
    });
    assert.ok(updatedItem);
    assert.equal(updatedItem.reviewState, "APPROVED");
    assert.equal(updatedItem.jobState, "SCHEDULED");
    assert.ok(updatedItem.scheduledAt);

    // Verify AuditLog
    const audit = await prisma.auditLog.findFirst({
      where: { action: "FAST_TRACK_1CLICK_APPROVAL" },
      orderBy: { createdAt: "desc" },
    });
    assert.ok(audit);
    assert.equal(audit.entityType, "ContentVersion");
  });

  await t.test("fastTrackApprove: strictly blocks if unverified flagged facts exist (APR-007)", async () => {
    // Create an item with unverified flagged facts
    const unverifiedItem = await prisma.contentItem.create({
      data: {
        title: "Unverified Claim Test",
        reviewState: "NEEDS_REVIEW",
        jobState: "UNSCHEDULED",
        publicationOutcome: "NOT_PUBLISHED",
        targetPlatform: "FACEBOOK",
        destinationPageId: "kewakibt_official_page",
        versions: {
          create: {
            versionNumber: 1,
            versionHash: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
            caption: "Kewakibt won Best Tech Award 2026",
            mediaUrls: [],
            mediaHashes: [],
            destinationPageId: "kewakibt_official_page",
            flaggedFacts: ["Award not verified in Brand Profile"],
            flaggedFactsResolved: false,
          },
        },
      },
      include: { versions: true },
    });

    await prisma.contentItem.update({
      where: { id: unverifiedItem.id },
      data: { currentVersionId: unverifiedItem.versions[0].id },
    });

    const res = await fastTrackApprove({ contentItemId: unverifiedItem.id });
    assert.equal(res.success, false);
    assert.match(res.error || "", /APR-007 Violation/);

    // Clean up
    await prisma.contentVersion.deleteMany({ where: { contentItemId: unverifiedItem.id } });
    await prisma.contentItem.delete({ where: { id: unverifiedItem.id } });
  });

  await t.test("batchFastTrackApprove: approves all clean items in single batch", async () => {
    if (itemIds.length > 1) {
      const remainingIds = [itemIds[1]];
      const batchRes = await batchFastTrackApprove(remainingIds);
      assert.equal(batchRes.success, true);
      assert.equal(batchRes.approvedCount, 1);
      assert.equal(batchRes.failedCount, 0);

      const checkItem = await prisma.contentItem.findUnique({
        where: { id: remainingIds[0] },
      });
      assert.equal(checkItem?.reviewState, "APPROVED");
      assert.equal(checkItem?.jobState, "SCHEDULED");
    }
  });
});
