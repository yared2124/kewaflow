"use server";

import { prisma } from "@/lib/db/prisma";
import { computeContentVersionHash } from "@/lib/crypto";
import { onContentModified } from "@/lib/state-machine/transitions";
import { safeRevalidatePath } from "./utils";
import { executeAiGeneration } from "@/providers";
import { BrandContext } from "@/providers/types";

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

/**
 * Real AI Generation Server Action
 * Grounded strictly in PostgreSQL BrandProfile (BRD-001, BRD-002, APR-007, NFR-006)
 */
export async function generateContentWithAI(input: {
  serviceName: string;
  topic?: string;
  platform?: "FACEBOOK" | "INSTAGRAM" | "LINKEDIN";
  tone?: "professional" | "innovative" | "authoritative" | "conversational";
}) {
  try {
    const profile = await prisma.brandProfile.findUnique({
      where: { id: "default" },
    });

    if (!profile) {
      return {
        success: false,
        error: "BRD-003: Brand profile not initialized in database. Set up brand profile first.",
      };
    }

    const brandContext: BrandContext = {
      brandName: profile.brandName,
      tagline: profile.tagline,
      verifiedServices: (profile.verifiedServices as any[]) || [],
      verifiedFacts: (profile.verifiedFacts as any) || {},
      voiceGuidelines: (profile.voiceGuidelines as any) || null,
      aiMonthlyBudgetCap: Number(profile.aiMonthlyBudgetCap || 0),
    };

    const result = await executeAiGeneration({
      brandProfile: brandContext,
      serviceName: input.serviceName,
      topic: input.topic,
      platform: input.platform || "FACEBOOK",
      tone: input.tone || "professional",
    });

    // Audit log (SEC-007)
    await prisma.auditLog.create({
      data: {
        actorId: "admin_yared",
        action: "AI_CONTENT_GENERATED",
        entityType: "BrandProfile",
        entityId: profile.id,
        metadata: {
          serviceName: input.serviceName,
          provider: result.usage.provider,
          model: result.usage.model,
          costUsd: result.usage.costUsd,
          flaggedFactsCount: result.flaggedFacts.length,
        },
      },
    });

    return { success: true, result };
  } catch (error: any) {
    console.error("AI Generation failed:", error);
    return { success: false, error: error.message || "Failed to generate content." };
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
  flaggedFacts?: string[];
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

    const hasFlaggedFacts = Boolean(payload.flaggedFacts && payload.flaggedFacts.length > 0);

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
            flaggedFacts: payload.flaggedFacts || [],
            flaggedFactsResolved: !hasFlaggedFacts, // APR-007: false if unverified facts exist
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
          flaggedFactsCount: payload.flaggedFacts?.length || 0,
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
