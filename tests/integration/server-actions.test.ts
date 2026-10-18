import test from "node:test";
import assert from "node:assert/strict";
import "dotenv/config";
import { getBrandProfile, updateBrandProfile } from "../../src/server/actions/brand";
import {
  createContentItem,
  getContentItems,
  updateContentItem,
  generateContentWithAI,
} from "../../src/server/actions/content";
import {
  approveContentVersion,
  getPendingApprovals,
  rejectContentVersion,
  resolveFlaggedFacts,
} from "../../src/server/actions/approval";
import { createLead, getLeads, updateLeadStage } from "../../src/server/actions/leads";
import { getCalendarPosts, schedulePost } from "../../src/server/actions/calendar";
import { getAuditLogs } from "../../src/server/actions/audit";
import { getDashboardData } from "../../src/server/actions/dashboard";

test("Step 2: Server Actions Layer Integration Tests", async (t) => {
  let createdItemId = "";
  let createdVersionId = "";

  await t.test("brand.actions: fetch and update brand profile", async () => {
    const res = await getBrandProfile();
    assert.equal(res.success, true);
    assert.ok(res.profile);

    const updateRes = await updateBrandProfile({
      brandName: "Kewakibt Software Solutions PLC",
      tagline: "Build • Automate • Grow",
      verifiedServices: [
        { name: "Custom Systems", description: "Tailored enterprise code" },
        { name: "Business Process Automation", description: "Workflow automation" },
        { name: "Cloud Architecture", description: "High availability setup" },
      ],
      verifiedFacts: { location: "Addis Ababa" },
      aiMonthlyBudgetCap: 50.0,
    });
    assert.equal(updateRes.success, true);
    assert.equal(updateRes.profile?.brandName, "Kewakibt Software Solutions PLC");
  });

  await t.test("content.actions: create draft with APR-001 hash", async () => {
    const res = await createContentItem({
      title: "Test Social Post",
      caption: "Transform operations with Kewakibt software.",
      mediaUrls: ["https://example.com/banner.jpg"],
      destinationPageId: "page_test_101",
      readyForReview: true,
    });

    assert.equal(res.success, true);
    assert.ok(res.item);
    assert.equal(res.item.reviewState, "NEEDS_REVIEW");
    assert.equal(res.item.versions.length, 1);
    assert.equal(res.item.versions[0].versionHash.length, 64);

    createdItemId = res.item.id;
    createdVersionId = res.item.versions[0].id;
  });

  await t.test("approval.actions: approve version with APR-009 friction checks", async () => {
    // Failing without confirmation checkbox (APR-009)
    const failRes = await approveContentVersion({
      contentItemId: createdItemId,
      contentVersionId: createdVersionId,
      confirmedExactFinal: false,
      reviewedDiff: true,
    });
    assert.equal(failRes.success, false);
    assert.match(failRes.error || "", /APR-009 Violation/);

    // Successful approval
    const okRes = await approveContentVersion({
      contentItemId: createdItemId,
      contentVersionId: createdVersionId,
      confirmedExactFinal: true,
      reviewedDiff: true,
    });
    assert.equal(okRes.success, true);
    if ("approval" in okRes && okRes.approval) {
      assert.ok(okRes.approval);
      assert.equal(okRes.approval.status, "ACTIVE");
    } else {
      assert.fail("okRes should contain approval");
    }
  });

  await t.test("content.actions: update item invalidates prior approval (APR-003)", async () => {
    const updateRes = await updateContentItem(createdItemId, {
      title: "Test Social Post (Edited)",
      caption: "Brand new caption after edit.",
      mediaUrls: ["https://example.com/banner.jpg"],
      destinationPageId: "page_test_101",
    });

    assert.equal(updateRes.success, true);
    assert.equal(updateRes.item?.reviewState, "NEEDS_REVIEW"); // Reset to review

    // Verify approval record was marked INVALIDATED
    const pendingRes = await getPendingApprovals();
    const item = pendingRes.items?.find((i) => i.id === createdItemId);
    assert.ok(item);
    const priorApproval = item.approvals[0];
    assert.equal(priorApproval?.status, "INVALIDATED");
  });

  await t.test("leads.actions: create and transition lead stages (CRM-001, CRM-002)", async () => {
    const leadRes = await createLead({
      name: "Test Inbound Lead",
      contactChannel: "WhatsApp",
      contactIdentifier: "+251 90 000 0000",
      stage: "INQUIRY",
      attributionType: "DIRECT",
      dealValueUsd: 5000.0,
    });
    assert.equal(leadRes.success, true);
    assert.ok(leadRes.lead);

    const updateStageRes = await updateLeadStage(leadRes.lead.id, "QUALIFIED");
    assert.equal(updateStageRes.success, true);
    assert.equal(updateStageRes.lead?.stage, "QUALIFIED");

    // Invalid stage rejection
    const invalidRes = await updateLeadStage(leadRes.lead.id, "CLOSED_UNKNOWN" as any);
    assert.equal(invalidRes.success, false);
    assert.match(invalidRes.error || "", /CRM-002 Violation/);
  });

  await t.test("calendar.actions: schedule post", async () => {
    // Approve item first
    const items = await getContentItems();
    const item = items.items?.find((i) => i.id === createdItemId);
    assert.ok(item);

    await approveContentVersion({
      contentItemId: item.id,
      contentVersionId: item.currentVersionId!,
      confirmedExactFinal: true,
      reviewedDiff: true,
    });

    const schedRes = await schedulePost(
      item.id,
      new Date(Date.now() + 48 * 60 * 60 * 1000)
    );
    assert.equal(schedRes.success, true);
    assert.equal(schedRes.item?.jobState, "SCHEDULED");
  });

  await t.test("dashboard.actions: aggregate real KPIs", async () => {
    const dashRes = await getDashboardData();
    assert.equal(dashRes.success, true);
    assert.ok(dashRes.stats);
    assert.ok(dashRes.stats.totalLeadsCount > 0);
    assert.ok(dashRes.recentActivity.length > 0);
  });

  await t.test("ai.actions: generate grounded content and enforce BRD-001", async () => {
    // 1. Success with verified service
    const aiRes = await generateContentWithAI({
      serviceName: "Custom Systems",
      topic: "Scalable web applications for retail banking",
      platform: "FACEBOOK",
      tone: "professional",
    });
    assert.equal(aiRes.success, true);
    assert.ok(aiRes.result);
    assert.ok(aiRes.result.caption.includes("Kewakibt"));
    assert.ok(aiRes.result.isGrounded);
    assert.ok(aiRes.result.usage);

    // 2. Reject unverified service (BRD-001)
    const invalidServiceRes = await generateContentWithAI({
      serviceName: "Quantum Computing Hardware",
      topic: "Sell quantum computers",
    });
    assert.equal(invalidServiceRes.success, false);
    assert.match(invalidServiceRes.error || "", /BRD-001/);

    // 3. APR-007: Performance claim extraction and blocking
    const claimRes = await generateContentWithAI({
      serviceName: "Business Process Automation",
      topic: "Guaranteed 80% reduction in reporting hours within 24 hours",
    });
    assert.equal(claimRes.success, true);
    assert.ok(claimRes.result?.flaggedFacts.length! > 0);

    // 4. Create content item with flagged facts and verify approval is blocked
    const flaggedItemRes = await createContentItem({
      title: "Automated Report Post",
      caption: claimRes.result!.caption,
      mediaUrls: [claimRes.result!.suggestedImageUrl],
      destinationPageId: "fb_page_test",
      readyForReview: true,
      flaggedFacts: claimRes.result!.flaggedFacts,
    });
    assert.equal(flaggedItemRes.success, true);
    assert.equal(flaggedItemRes.item?.versions[0].flaggedFactsResolved, false);

    // Approval must be BLOCKED per APR-007
    const blockedApproval = await approveContentVersion({
      contentItemId: flaggedItemRes.item!.id,
      contentVersionId: flaggedItemRes.item!.versions[0].id,
      confirmedExactFinal: true,
      reviewedDiff: true,
    });
    assert.equal(blockedApproval.success, false);
    assert.match(blockedApproval.error || "", /APR-007 Violation/);

    // Admin resolves flagged facts
    const resolveRes = await resolveFlaggedFacts({
      contentVersionId: flaggedItemRes.item!.versions[0].id,
      resolutionNotes: "Verified against internal benchmark logs Q3 2026",
    });
    assert.equal(resolveRes.success, true);
    assert.equal(resolveRes.version?.flaggedFactsResolved, true);

    // Now approval succeeds
    const allowedApproval = await approveContentVersion({
      contentItemId: flaggedItemRes.item!.id,
      contentVersionId: flaggedItemRes.item!.versions[0].id,
      confirmedExactFinal: true,
      reviewedDiff: true,
    });
    assert.equal(allowedApproval.success, true);
    assert.equal(allowedApproval.updatedItem?.reviewState, "APPROVED");
  });
});
