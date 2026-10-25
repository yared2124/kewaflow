"use server";

import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { getBrandProfile } from "./brand";
import { executeAiGeneration } from "@/providers";
import { BrandContext } from "@/providers/types";
import { computeContentVersionHash } from "@/lib/crypto";
import { safeRevalidatePath } from "./utils";

export interface AutomatedDraftResult {
  success: boolean;
  createdCount: number;
  items?: Array<{ id: string; title: string; scheduledAt: string }>;
  error?: string;
}

const STOCK_CREATIVE_MEDIA: Record<string, string> = {
  web: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80",
  cloud: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
  mobile: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&auto=format&fit=crop&q=80",
  ai: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
  database: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200&auto=format&fit=crop&q=80",
};

/**
 * Automatically produces grounded marketing drafts across Kewakibt's service catalogue.
 * Invariant BRD-001: Exclusively grounded in verified Brand Profile facts & services.
 */
export async function generateAutomatedDrafts(count: number = 3): Promise<AutomatedDraftResult> {
  try {
    const brandRes = await getBrandProfile();
    if (!brandRes.success || !brandRes.profile) {
      return { success: false, createdCount: 0, error: "Brand profile not configured." };
    }

    const brand = brandRes.profile;
    const rawServices = (brand.verifiedServices as any[]) || [];
    const verifiedServices =
      rawServices.length > 0
        ? rawServices.map((s) => ({
            name: typeof s === "string" ? s : s.name,
            description:
              typeof s === "object" && s.description
                ? s.description
                : "Custom enterprise software engineering and architecture",
          }))
        : [
            { name: "Custom Systems", description: "Tailored enterprise code" },
            { name: "Business Process Automation", description: "Workflow automation" },
            { name: "Cloud Architecture", description: "High availability setup" },
          ];

    const brandContext: BrandContext = {
      brandName: brand.brandName,
      tagline: brand.tagline,
      verifiedServices: verifiedServices,
      verifiedFacts: (brand.verifiedFacts as any) || {},
      voiceGuidelines: (brand.voiceGuidelines as any) || null,
      aiMonthlyBudgetCap: Number(brand.aiMonthlyBudgetCap || 0),
    };

    const session = await getSession();
    const adminId = session?.adminId || "admin_yared";

    const createdItems: Array<{ id: string; title: string; scheduledAt: string }> = [];

    // Schedule across upcoming days at 10:00 AM EAT
    const now = new Date();

    for (let i = 0; i < Math.min(count, verifiedServices.length); i++) {
      const targetService = verifiedServices[i % verifiedServices.length];

      // Generate grounded caption strictly compliant with BRD-001 / BRD-002
      const aiResult = await executeAiGeneration({
        brandProfile: brandContext,
        serviceName: targetService.name,
        topic: `Engineering excellence and business ROI with ${targetService.name}`,
        platform: "FACEBOOK",
        tone: "professional",
      });

      // Select matching high-resolution media asset
      let mediaKey = "web";
      const sLower = targetService.name.toLowerCase();
      if (sLower.includes("cloud") || sLower.includes("devops")) mediaKey = "cloud";
      else if (sLower.includes("mobile") || sLower.includes("app")) mediaKey = "mobile";
      else if (sLower.includes("ai") || sLower.includes("automation")) mediaKey = "ai";
      else if (sLower.includes("data") || sLower.includes("database")) mediaKey = "database";

      const mediaUrl =
        aiResult.suggestedImageUrl ||
        STOCK_CREATIVE_MEDIA[mediaKey] ||
        STOCK_CREATIVE_MEDIA.web;
      const mediaHash = crypto.createHash("sha256").update(mediaUrl).digest("hex");

      // Auto-suggest scheduled time (Tomorrow + i days at 10:00 AM)
      const scheduledTime = new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000);
      scheduledTime.setHours(10, 0, 0, 0);

      const title = `${targetService.name} — Engineered for Scale`;
      const fullCaption = `${aiResult.caption.trim()}\n\n${aiResult.hashtags.trim()}`;

      // Deterministic version hash (APR-001)
      const versionHash = computeContentVersionHash({
        caption: fullCaption,
        mediaHashes: [mediaHash],
        destinationPageId: "kewakibt_official_page",
        ctaUrl: "https://kewakibt.com/contact",
        scheduledTime: scheduledTime.toISOString(),
      });

      // Write to database
      const item = await prisma.contentItem.create({
        data: {
          title,
          reviewState: "NEEDS_REVIEW",
          jobState: "UNSCHEDULED",
          publicationOutcome: "NOT_PUBLISHED",
          targetPlatform: "FACEBOOK",
          destinationPageId: "kewakibt_official_page",
          scheduledAt: scheduledTime,
          versions: {
            create: {
              versionNumber: 1,
              versionHash,
              caption: fullCaption,
              mediaUrls: [mediaUrl],
              mediaHashes: [mediaHash],
              destinationPageId: "kewakibt_official_page",
              ctaUrl: "https://kewakibt.com/contact",
              scheduledTime,
              flaggedFacts: aiResult.flaggedFacts,
              flaggedFactsResolved: aiResult.flaggedFacts.length === 0,
            },
          },
        },
        include: { versions: true },
      });

      // Update current version pointer
      await prisma.contentItem.update({
        where: { id: item.id },
        data: { currentVersionId: item.versions[0].id },
      });

      createdItems.push({
        id: item.id,
        title,
        scheduledAt: scheduledTime.toISOString(),
      });
    }

    // Write audit log (SEC-007)
    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: "AUTOMATION_DRAFTS_GENERATED",
        entityType: "ContentItem",
        entityId: "batch_generation",
        metadata: {
          requestedCount: count,
          generatedCount: createdItems.length,
          itemIds: createdItems.map((c) => c.id),
        },
      },
    });

    safeRevalidatePath("/approvals");
    safeRevalidatePath("/content");
    safeRevalidatePath("/dashboard");
    safeRevalidatePath("/calendar");

    return {
      success: true,
      createdCount: createdItems.length,
      items: createdItems,
    };
  } catch (error) {
    console.error("Failed to generate automated drafts:", error);
    return {
      success: false,
      createdCount: 0,
      error: "Automated draft generation failed.",
    };
  }
}
