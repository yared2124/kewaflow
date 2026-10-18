"use server";

import { prisma } from "@/lib/db/prisma";
import { safeRevalidatePath } from "./utils";

export async function getPendingApprovals() {
  try {
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
 * Approve Content Version (APR-002, APR-006, APR-007, APR-009)
 */
export async function approveContentVersion(payload: {
  contentItemId: string;
  contentVersionId: string;
  confirmedExactFinal: boolean;
  reviewedDiff: boolean;
}) {
  try {
    // APR-009: Checkbox mandatory
    if (!payload.confirmedExactFinal) {
      return {
        success: false,
        error: "APR-009 Violation: You must confirm review of the exact final version.",
      };
    }

    const version = await prisma.contentVersion.findUnique({
      where: { id: payload.contentVersionId },
    });

    if (!version) {
      return { success: false, error: "Content version not found." };
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
          adminId: "admin_yared",
          adminSessionId: "sess_admin_verified",
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
          actorId: "admin_yared",
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
  } catch (error) {
    console.error("Failed to approve content version:", error);
    return { success: false, error: "Failed to approve content version." };
  }
}

/**
 * Reject Content Version
 */
export async function rejectContentVersion(payload: {
  contentItemId: string;
  contentVersionId: string;
  reason?: string;
}) {
  try {
    const updated = await prisma.$transaction(async (tx) => {
      const item = await tx.contentItem.update({
        where: { id: payload.contentItemId },
        data: { reviewState: "REJECTED" },
      });

      await tx.auditLog.create({
        data: {
          actorId: "admin_yared",
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
  } catch (error) {
    console.error("Failed to reject content version:", error);
    return { success: false, error: "Failed to reject content version." };
  }
}

/**
 * APR-007: Resolve Flagged Facts
 * Allows Admin to substantiate or acknowledge flagged facts with an audit trail
 */
export async function resolveFlaggedFacts(payload: {
  contentVersionId: string;
  resolutionNotes: string;
}) {
  try {
    const updated = await prisma.$transaction(async (tx) => {
      const version = await tx.contentVersion.update({
        where: { id: payload.contentVersionId },
        data: {
          flaggedFactsResolved: true,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: "admin_yared",
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
