"use server";

import { prisma } from "@/lib/db/prisma";
import { computeContentVersionHash } from "@/lib/crypto";
import { onContentModified } from "@/lib/state-machine/transitions";
import { safeRevalidatePath } from "./utils";

export async function getContentItems(filter?: {
  reviewState?: "DRAFT" | "GENERATING" | "NEEDS_REVIEW" | "APPROVED" | "REJECTED";
}) {
  try {
    const items = await prisma.contentItem.findMany({
      where: filter?.reviewState ? { reviewState: filter.reviewState } : undefined,
      include: {
        currentVersion: true,
        versions: {
          orderBy: { versionNumber: "desc" },
        },
        approvals: {
          where: { status: "ACTIVE" },
          orderBy: { approvedAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    return { success: true, items };
  } catch (error) {
    console.error("Failed to fetch content items:", error);
    return { success: false, error: "Failed to fetch content items." };
  }
}

export async function createContentItem(payload: {
  title: string;
  caption: string;
  mediaUrls: string[];
  destinationPageId: string;
  ctaUrl?: string;
  disclosures?: string;
  scheduledTime?: Date | null;
  adConfig?: any;
  targetPlatform?: string;
  readyForReview?: boolean;
}) {
  try {
    const versionHash = computeContentVersionHash({
      caption: payload.caption,
      mediaHashes: [],
      destinationPageId: payload.destinationPageId,
      ctaUrl: payload.ctaUrl,
      disclosures: payload.disclosures,
      scheduledTime: payload.scheduledTime,
      adConfig: payload.adConfig,
    });

    const item = await prisma.contentItem.create({
      data: {
        title: payload.title,
        reviewState: payload.readyForReview ? "NEEDS_REVIEW" : "DRAFT",
        jobState: "UNSCHEDULED",
        publicationOutcome: "NOT_PUBLISHED",
        targetPlatform: payload.targetPlatform || "FACEBOOK",
        destinationPageId: payload.destinationPageId,
        scheduledAt: payload.scheduledTime,
        versions: {
          create: {
            versionNumber: 1,
            versionHash,
            caption: payload.caption,
            mediaUrls: payload.mediaUrls,
            mediaHashes: [],
            destinationPageId: payload.destinationPageId,
            ctaUrl: payload.ctaUrl,
            disclosures: payload.disclosures,
            scheduledTime: payload.scheduledTime,
            adConfig: payload.adConfig,
          },
        },
      },
      include: { versions: true },
    });

    const currentVersionId = item.versions[0].id;
    await prisma.contentItem.update({
      where: { id: item.id },
      data: { currentVersionId },
    });

    // Audit Log (SEC-007)
    await prisma.auditLog.create({
      data: {
        actorId: "admin_yared",
        action: "CREATE_CONTENT",
        entityType: "ContentItem",
        entityId: item.id,
        metadata: {
          versionHash,
          title: payload.title,
          reviewState: payload.readyForReview ? "NEEDS_REVIEW" : "DRAFT",
        },
      },
    });

    safeRevalidatePath("/content");
    safeRevalidatePath("/approvals");
    safeRevalidatePath("/dashboard");
    return { success: true, item };
  } catch (error) {
    console.error("Failed to create content item:", error);
    return { success: false, error: "Failed to create content item." };
  }
}

/**
 * APR-003: Any modification to a publish-relevant field SHALL immediately:
 * (a) create a new ContentVersion with a new hash
 * (b) mark prior ApprovalRecord INVALIDATED
 * (c) transition review axis back to NEEDS_REVIEW
 * (d) cancel any queued job referencing prior version
 */
export async function updateContentItem(
  contentItemId: string,
  payload: {
    caption: string;
    mediaUrls: string[];
    destinationPageId: string;
    ctaUrl?: string;
    disclosures?: string;
    scheduledTime?: Date | null;
    adConfig?: any;
    title?: string;
  }
) {
  try {
    const existing = await prisma.contentItem.findUnique({
      where: { id: contentItemId },
      include: {
        versions: { orderBy: { versionNumber: "desc" }, take: 1 },
      },
    });

    if (!existing) {
      return { success: false, error: "Content item not found." };
    }

    const nextVersionNumber = (existing.versions[0]?.versionNumber || 0) + 1;
    const newHash = computeContentVersionHash({
      caption: payload.caption,
      mediaHashes: [],
      destinationPageId: payload.destinationPageId,
      ctaUrl: payload.ctaUrl,
      disclosures: payload.disclosures,
      scheduledTime: payload.scheduledTime,
      adConfig: payload.adConfig,
    });

    const nextStates = onContentModified({
      reviewState: existing.reviewState,
      jobState: existing.jobState,
      publicationOutcome: existing.publicationOutcome,
    });

    const result = await prisma.$transaction(async (tx) => {
      // Invalidate existing active approvals (APR-003b)
      await tx.approvalRecord.updateMany({
        where: {
          contentItemId,
          status: "ACTIVE",
        },
        data: {
          status: "INVALIDATED",
          invalidatedAt: new Date(),
        },
      });

      // Create new ContentVersion (APR-003a)
      const newVersion = await tx.contentVersion.create({
        data: {
          contentItemId,
          versionNumber: nextVersionNumber,
          versionHash: newHash,
          caption: payload.caption,
          mediaUrls: payload.mediaUrls,
          mediaHashes: [],
          destinationPageId: payload.destinationPageId,
          ctaUrl: payload.ctaUrl,
          disclosures: payload.disclosures,
          scheduledTime: payload.scheduledTime,
          adConfig: payload.adConfig,
        },
      });

      // Update ContentItem with new version and transitioned states (APR-003c,d)
      const updatedItem = await tx.contentItem.update({
        where: { id: contentItemId },
        data: {
          title: payload.title || existing.title,
          currentVersionId: newVersion.id,
          reviewState: nextStates.reviewState,
          jobState: nextStates.jobState,
          scheduledAt: payload.scheduledTime,
        },
        include: { currentVersion: true },
      });

      await tx.auditLog.create({
        data: {
          actorId: "admin_yared",
          action: "UPDATE_AND_INVALIDATE_APPROVAL",
          entityType: "ContentItem",
          entityId: contentItemId,
          metadata: {
            newVersionNumber: nextVersionNumber,
            newHash,
            reason: "Content edited, prior approval automatically invalidated per APR-003",
          },
        },
      });

      return updatedItem;
    });

    safeRevalidatePath("/content");
    safeRevalidatePath("/approvals");
    safeRevalidatePath("/dashboard");
    safeRevalidatePath("/calendar");
    return { success: true, item: result };
  } catch (error) {
    console.error("Failed to update content item:", error);
    return { success: false, error: "Failed to update content item." };
  }
}
