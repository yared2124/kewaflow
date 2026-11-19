import test from "node:test";
import assert from "node:assert/strict";
import "dotenv/config";
import { clearTestSessionCookie } from "../../src/lib/auth/session";
import { createContentItem, updateContentItem } from "../../src/server/actions/content";
import { approveContentVersion, rejectContentVersion, resolveFlaggedFacts, fastTrackApprove } from "../../src/server/actions/approval";
import { updateBrandProfile } from "../../src/server/actions/brand";
import { createLead, updateLeadStage } from "../../src/server/actions/leads";
import { schedulePost } from "../../src/server/actions/calendar";
import { uploadMediaAsset } from "../../src/server/actions/media";
import { generateMotionVideo } from "../../src/server/actions/video";
import { generateAutomatedDrafts } from "../../src/server/actions/automation";
import { revokeAdminSession, generateNewRecoveryCodes } from "../../src/server/actions/security";

test("SEC-001 & SEC-002: Universal Server Action Authentication Enforcement", async (t) => {
  // Ensure no active session in test context
  clearTestSessionCookie();

  await t.test("rejects unauthenticated content creation", async () => {
    const res = await createContentItem({
      title: "Hacked Post",
      caption: "Unauthorized content creation attempt",
      mediaUrls: [],
      destinationPageId: "fake_page",
    });
    assert.equal(res.success, false);
    assert.match(res.error || "", /SEC-001 Unauthorized/);
  });

  await t.test("rejects unauthenticated content update", async () => {
    const res = await updateContentItem("fake_item_id", {
      caption: "Unauthorized update",
      mediaUrls: [],
      destinationPageId: "fake_page",
    });
    assert.equal(res.success, false);
    assert.match(res.error || "", /SEC-001 Unauthorized/);
  });

  await t.test("rejects unauthenticated content approval", async () => {
    const res = await approveContentVersion({
      contentItemId: "fake_item_id",
      contentVersionId: "fake_ver_id",
      confirmedExactFinal: true,
      reviewedDiff: true,
    });
    assert.equal(res.success, false);
    assert.match(res.error || "", /SEC-001 Unauthorized/);
  });

  await t.test("rejects unauthenticated content rejection", async () => {
    const res = await rejectContentVersion({
      contentItemId: "fake_item_id",
      contentVersionId: "fake_ver_id",
    });
    assert.equal(res.success, false);
    assert.match(res.error || "", /SEC-001 Unauthorized/);
  });

  await t.test("rejects unauthenticated fast-track approval", async () => {
    const res = await fastTrackApprove({
      contentItemId: "fake_item_id",
    });
    assert.equal(res.success, false);
    assert.match(res.error || "", /SEC-001 Unauthorized/);
  });

  await t.test("rejects unauthenticated fact resolution", async () => {
    const res = await resolveFlaggedFacts({
      contentVersionId: "fake_ver_id",
      resolutionNotes: "Bypassing facts",
    });
    assert.equal(res.success, false);
    assert.match(res.error || "", /SEC-001 Unauthorized/);
  });

  await t.test("rejects unauthenticated brand profile updates", async () => {
    const res = await updateBrandProfile({
      brandName: "Attacker Software PLC",
      verifiedServices: [],
      verifiedFacts: {},
    });
    assert.equal(res.success, false);
    assert.match(res.error || "", /SEC-001 Unauthorized/);
  });

  await t.test("rejects unauthenticated lead creation", async () => {
    const res = await createLead({
      name: "Fake Lead",
      contactChannel: "WhatsApp",
      contactIdentifier: "+123456789",
    });
    assert.equal(res.success, false);
    assert.match(res.error || "", /SEC-001 Unauthorized/);
  });

  await t.test("rejects unauthenticated lead stage update", async () => {
    const res = await updateLeadStage("fake_lead_id", "WON");
    assert.equal(res.success, false);
    assert.match(res.error || "", /SEC-001 Unauthorized/);
  });

  await t.test("rejects unauthenticated post scheduling", async () => {
    const res = await schedulePost("fake_item_id", new Date());
    assert.equal(res.success, false);
    assert.match(res.error || "", /SEC-001 Unauthorized/);
  });

  await t.test("rejects unauthenticated video generation", async () => {
    const res = await generateMotionVideo({
      serviceName: "Custom Enterprise Web Systems",
    });
    assert.equal(res.success, false);
    assert.match(res.error || "", /SEC-001 Unauthorized/);
  });

  await t.test("rejects unauthenticated automated draft generation", async () => {
    const res = await generateAutomatedDrafts(3);
    assert.equal(res.success, false);
    assert.match(res.error || "", /SEC-001 Unauthorized/);
  });

  await t.test("rejects unauthenticated recovery code regeneration", async () => {
    const res = await generateNewRecoveryCodes();
    assert.equal(res.success, false);
    assert.match(res.error || "", /SEC-001 Unauthorized/);
  });

  await t.test("rejects unauthenticated session revocation", async () => {
    const res = await revokeAdminSession("fake_session_id");
    assert.equal(res.success, false);
    assert.match(res.error || "", /SEC-001 Unauthorized/);
  });

  t.after(async () => {
    try {
      const { redisConnection, publishingQueue, aiGenerationQueue } = await import("../../src/jobs/queue");
      await publishingQueue.close();
      await aiGenerationQueue.close();
      await redisConnection.quit();
    } catch {}
    try {
      const { prisma } = await import("../../src/lib/db/prisma");
      await prisma.$disconnect();
    } catch {}
  });
});
