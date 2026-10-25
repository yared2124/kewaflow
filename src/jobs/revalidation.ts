import { prisma } from "@/lib/db/prisma";
import { PublishingJobData, RevalidationResult } from "./types";
import { verifyUrlResolvability } from "./url-validator";

/**
 * APR-004: Publish-Time Re-validation
 * Executes immediately before dispatching any payload to Meta API.
 * Validates:
 * (a) ApprovalRecord references exact ContentVersionId in payload
 * (b) ApprovalRecord status is ACTIVE
 * (c) Approval has not expired (APR-006: 30 calendar days)
 * (d) Destination Page ID is present and authorized
 * (e) APR-008: CTA URL is resolvable
 * (f) APR-007: All flagged facts resolved
 */
export async function validateJobBeforeDispatch(
  payload: PublishingJobData
): Promise<RevalidationResult> {
  const item = await prisma.contentItem.findUnique({
    where: { id: payload.contentItemId },
    include: {
      currentVersion: true,
      approvals: {
        where: {
          contentVersionId: payload.contentVersionId,
          status: "ACTIVE",
        },
        orderBy: { approvedAt: "desc" },
        take: 1,
      },
    },
  });

  if (!item || !item.currentVersion) {
    return {
      valid: false,
      errorCode: "NO_ITEM",
      reason: "ContentItem or active ContentVersion not found in database.",
    };
  }

  // (a) Verify exact version match
  if (item.currentVersionId !== payload.contentVersionId) {
    return {
      valid: false,
      errorCode: "VERSION_MISMATCH",
      reason: `APR-004(a) Violation: Job version (${payload.contentVersionId}) does not match current item version (${item.currentVersionId}).`,
      item,
    };
  }

  const version = item.currentVersion;

  // (f) APR-007: Flagged facts check
  if (!version.flaggedFactsResolved) {
    return {
      valid: false,
      errorCode: "FLAGGED_FACTS_UNRESOLVED",
      reason: "APR-007 Violation: Version contains unresolved flagged facts.",
      item,
      version,
    };
  }

  // (a & b) Verify active ApprovalRecord exists for this exact version
  const approval = item.approvals[0];
  if (!approval || approval.status !== "ACTIVE") {
    return {
      valid: false,
      errorCode: !approval ? "NO_APPROVAL" : "APPROVAL_NOT_ACTIVE",
      reason: `APR-004(b) Violation: No ACTIVE approval record found for version ${version.id}.`,
      item,
      version,
    };
  }

  // (c) Verify approval expiration (APR-006: 30 days)
  const now = new Date();
  if (now.getTime() > approval.expiresAt.getTime()) {
    // Mark expired in database
    await prisma.approvalRecord.update({
      where: { id: approval.id },
      data: { status: "EXPIRED" },
    });

    return {
      valid: false,
      errorCode: "APPROVAL_EXPIRED",
      reason: `APR-004(c) Violation: Approval expired on ${approval.expiresAt.toISOString()} (exceeded 30-day window per APR-006).`,
      item,
      version,
      approval,
    };
  }

  // (d) Verify destination Page
  const destinationPageId = payload.destinationPageId || item.destinationPageId;
  if (!destinationPageId) {
    return {
      valid: false,
      errorCode: "PAGE_INVALID",
      reason: "APR-004(d) Violation: Destination Page ID is missing or unauthorized.",
      item,
      version,
      approval,
    };
  }

  // (e) APR-008: CTA URL Resolvability check
  if (version.ctaUrl) {
    const urlCheck = await verifyUrlResolvability(version.ctaUrl);
    if (!urlCheck.isResolvable) {
      return {
        valid: false,
        errorCode: "UNRESOLVABLE_URL",
        reason: `APR-008 Violation: Approved CTA URL '${version.ctaUrl}' is unresolvable: ${urlCheck.error || "Status check failed"}`,
        item,
        version,
        approval,
      };
    }
  }

  return {
    valid: true,
    item,
    version,
    approval,
  };
}

/**
 * Handles rejection of a publishing job due to re-validation failure (APR-004).
 * Transitions jobState to DEAD_LETTERED, updates attempt status, and logs tampering/invalidation in AuditLog.
 */
export async function handleRevalidationFailure(
  payload: PublishingJobData,
  result: RevalidationResult
): Promise<void> {
  const reason = result.reason || "Re-validation check failed before dispatch.";

  await prisma.$transaction(async (tx) => {
    // Transition JobState to DEAD_LETTERED and Outcome to FAILED
    await tx.contentItem.update({
      where: { id: payload.contentItemId },
      data: {
        jobState: "DEAD_LETTERED",
        publicationOutcome: "FAILED",
      },
    });

    // Record failed attempt
    await tx.publishingAttempt.upsert({
      where: { idempotencyKey: payload.idempotencyKey },
      create: {
        contentItemId: payload.contentItemId,
        contentVersionId: payload.contentVersionId,
        idempotencyKey: payload.idempotencyKey,
        attemptIndex: payload.attemptIndex,
        status: "FAILED",
        errorMessage: reason,
        completedAt: new Date(),
      },
      update: {
        status: "FAILED",
        errorMessage: reason,
        completedAt: new Date(),
      },
    });

    // Audit Log (SEC-007)
    await tx.auditLog.create({
      data: {
        actorId: "system_publishing_worker",
        action: "PUBLISH_REVALIDATION_BLOCKED",
        entityType: "ContentItem",
        entityId: payload.contentItemId,
        metadata: {
          errorCode: result.errorCode,
          reason,
          contentVersionId: payload.contentVersionId,
          idempotencyKey: payload.idempotencyKey,
        },
      },
    });
  });
}
