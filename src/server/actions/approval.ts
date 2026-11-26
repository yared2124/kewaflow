"use server";

import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { safeRevalidatePath } from "./utils";

export async function getPendingApprovals() {
  try {
    await requireAdmin();
    const items = await prisma.contentItem.findMany({
      where: { reviewState: "NEEDS_REVIEW" },
      include: {
        currentVersion: true,
        versions: {
          orderBy: { versionNumber: "desc" },
        },
        approvals: {
          orderBy: { approvedAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    return { success: true, items };
  } catch (error) {
    console.error("Failed to fetch pending approvals:", error);
    return { success: false, error: "Failed to fetch pending approvals." };
  }
}

/**
 * Approve Content Version (APR-002, APR-006, APR-007, APR-009, SEC-001)
 */
export async function approveContentVersion(payload: {
  contentItemId: string;
  contentVersionId: string;
  confirmedExactFinal: boolean;
  reviewedDiff: boolean;
}) {
  try {
    const { user, session } = await requireAdmin();

    // APR-009: Checkbox mandatory
    if (!payload.confirmedExactFinal) {
      return {
        success: false,
        error: "APR-009 Violation: You must confirm review of the exact final version.",
      };
    }

    if (!payload.reviewedDiff) {
      return {
        success: false,
        error: "APR-009 Violation: You must review the version diff before approval.",
      };
    }

    const item = await prisma.contentItem.findUnique({
      where: { id: payload.contentItemId },
      include: { currentVersion: true },
    });

    if (!item) {
      return { success: false, error: "Content item not found." };
    }

    if (item.currentVersionId !== payload.contentVersionId) {
      return {
        success: false,
        error: "APR-001/002 Violation: Cannot approve a version that is not the item's current version.",
      };
    }

    const version = await prisma.contentVersion.findUnique({
      where: { id: payload.contentVersionId },
    });

    if (!version || version.contentItemId !== payload.contentItemId) {
      return { success: false, error: "Content version not found or mismatched item." };
    }

    // APR-007: Block approval if unverified facts exist and are unresolved
    if (!version.flaggedFactsResolved) {
      return {
        success: false,
        error:
          "APR-007 Violation: Cannot approve version with unresolved unverified facts.",
      };
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days (APR-006)

    const result = await prisma.$transaction(async (tx) => {
      // Create immutable ApprovalRecord (APR-002)
      const approval = await tx.approvalRecord.create({
        data: {
          contentItemId: payload.contentItemId,
          contentVersionId: payload.contentVersionId,
          adminId: user.id,
          adminSessionId: session.id,
          status: "ACTIVE",
          reviewedDiff: payload.reviewedDiff,
          confirmedExactFinal: payload.confirmedExactFinal,
          expiresAt,
        },
      });

      // Update Item Review State
      const updatedItem = await tx.contentItem.update({
        where: { id: payload.contentItemId },
        data: {
          reviewState: "APPROVED",
        },
      });

      // Audit Log (SEC-007)
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: "APPROVE_CONTENT_VERSION",
          entityType: "ContentVersion",
          entityId: payload.contentVersionId,
          metadata: {
            approvalId: approval.id,
            versionHash: version.versionHash,
            expiresAt: expiresAt.toISOString(),
          },
        },
      });

      return { approval, updatedItem };
    });

    safeRevalidatePath("/approvals");
    safeRevalidatePath("/dashboard");
    safeRevalidatePath("/calendar");
    return { success: true, ...result };
  } catch (error: any) {
    console.error("Failed to approve content version:", error);
    return { success: false, error: error.message || "Failed to approve content version." };
  }
}

/**
 * Reject Content Version (SEC-001)
 */
export async function rejectContentVersion(payload: {
  contentItemId: string;
  contentVersionId: string;
  reason?: string;
}) {
  try {
    const { user } = await requireAdmin();

    const updated = await prisma.$transaction(async (tx) => {
      const item = await tx.contentItem.update({
        where: { id: payload.contentItemId },
        data: { reviewState: "REJECTED" },
      });

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: "REJECT_CONTENT_VERSION",
          entityType: "ContentVersion",
          entityId: payload.contentVersionId,
          metadata: {
            reason: payload.reason || "Rejected by Admin",
          },
        },
      });

      return item;
    });

    safeRevalidatePath("/approvals");
    safeRevalidatePath("/dashboard");
    return { success: true, item: updated };
  } catch (error: any) {
    console.error("Failed to reject content version:", error);
    return { success: false, error: error.message || "Failed to reject content version." };
  }
}

/**
 * APR-007: Resolve Flagged Facts (SEC-001)
 * Allows Admin to substantiate or acknowledge flagged facts with an audit trail
 */
export async function resolveFlaggedFacts(payload: {
  contentVersionId: string;
  resolutionNotes: string;
}) {
  try {
    const { user } = await requireAdmin();

    const updated = await prisma.$transaction(async (tx) => {
      const version = await tx.contentVersion.update({
        where: { id: payload.contentVersionId },
        data: {
          flaggedFactsResolved: true,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: "RESOLVE_FLAGGED_FACTS",
          entityType: "ContentVersion",
          entityId: payload.contentVersionId,
          metadata: {
            resolutionNotes: payload.resolutionNotes,
          },
        },
      });

      return version;
    });

    safeRevalidatePath("/approvals");
    return { success: true, version: updated };
  } catch (error: any) {
    console.error("Failed to resolve flagged facts:", error);
    return { success: false, error: error.message || "Failed to resolve flagged facts." };
  }
}

/**
 * Fast-Track Approval
 * Invariant: APR-009 mandates explicit review confirmation.
 */
export async function fastTrackApprove(payload: {
  contentItemId: string;
  confirmedExactFinal?: boolean;
  scheduledTime?: string | Date;
}) {
  try {
    const { user, session } = await requireAdmin();

    // APR-009: Checkbox mandatory
    if (!payload.confirmedExactFinal) {
      return {
        success: false,
        error: "APR-009 Violation: You must confirm review of the exact final version.",
      };
    }

    const item = await prisma.contentItem.findUnique({
      where: { id: payload.contentItemId },
      include: { currentVersion: true },
    });

    if (!item || !item.currentVersion) {
      return { success: false, error: "Content item or active version not found." };
    }

    const version = item.currentVersion;

    // APR-007 check
    if (!version.flaggedFactsResolved) {
      return {
        success: false,
        error: "APR-007 Violation: Cannot fast-track approve version with unresolved flagged facts.",
      };
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days (APR-006)

    const finalScheduledAt = payload.scheduledTime
      ? new Date(payload.scheduledTime)
      : item.scheduledAt || new Date(Date.now() + 24 * 60 * 60 * 1000);

    const result = await prisma.$transaction(async (tx) => {
      // Create immutable ApprovalRecord (APR-002)
      const approval = await tx.approvalRecord.create({
        data: {
          contentItemId: item.id,
          contentVersionId: version.id,
          adminId: user.id,
          adminSessionId: session.id,
          status: "ACTIVE",
          reviewedDiff: true,
          confirmedExactFinal: true,
          expiresAt,
        },
      });

      // Update Item Review State & Schedule State
      const updatedItem = await tx.contentItem.update({
        where: { id: item.id },
        data: {
          reviewState: "APPROVED",
          jobState: "SCHEDULED",
          scheduledAt: finalScheduledAt,
        },
      });

      // Audit Log (SEC-007)
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: "FAST_TRACK_APPROVAL",
          entityType: "ContentVersion",
          entityId: version.id,
          metadata: {
            approvalId: approval.id,
            versionHash: version.versionHash,
            scheduledAt: finalScheduledAt.toISOString(),
            expiresAt: expiresAt.toISOString(),
          },
        },
      });

      return { approval, updatedItem };
    });

    safeRevalidatePath("/approvals");
    safeRevalidatePath("/dashboard");
    safeRevalidatePath("/calendar");

    return { success: true, ...result };
  } catch (error: any) {
    console.error("Failed to fast-track approve content:", error);
    return { success: false, error: error.message || "Failed to fast-track approve content." };
  }
}

/**
 * Batch Fast-Track Approval
 * Invariant: APR-009 mandates explicit review confirmation.
 */
export async function batchFastTrackApprove(
  payload:
    | {
        contentItemIds: string[];
        confirmedExactFinal?: boolean;
      }
    | string[]
) {
  try {
    await requireAdmin();

    const ids = Array.isArray(payload) ? payload : payload.contentItemIds;
    const confirmed = Array.isArray(payload) ? false : Boolean(payload.confirmedExactFinal);

    if (!confirmed) {
      return {
        success: false,
        error: "APR-009 Violation: Batch approval requires explicit confirmation of exact final review.",
      };
    }

    let approvedCount = 0;
    let failedCount = 0;

    for (const id of ids) {
      const res = await fastTrackApprove({ contentItemId: id, confirmedExactFinal: true });
      if (res.success) {
        approvedCount++;
      } else {
        failedCount++;
      }
    }

    safeRevalidatePath("/approvals");
    safeRevalidatePath("/dashboard");
    safeRevalidatePath("/calendar");

    return {
      success: true,
      approvedCount,
      failedCount,
    };
  } catch (error: any) {
    console.error("Failed to batch approve items:", error);
    return { success: false, error: error.message || "Failed to batch approve content items." };
  }
}
