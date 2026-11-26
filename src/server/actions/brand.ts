"use server";

import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { safeRevalidatePath } from "./utils";

function serializeBrandProfile<T extends { aiMonthlyBudgetCap?: any }>(
  profile: T
): Omit<T, "aiMonthlyBudgetCap"> & { aiMonthlyBudgetCap: number } {
  return {
    ...profile,
    aiMonthlyBudgetCap: profile.aiMonthlyBudgetCap != null ? Number(profile.aiMonthlyBudgetCap) : 0,
  };
}

export async function getBrandProfile() {
  try {
    await requireAdmin();
    const profile = await prisma.brandProfile.findUnique({
      where: { id: "default" },
    });
    return { success: true, profile: profile ? serializeBrandProfile(profile) : null };
  } catch (error) {
    console.error("Failed to fetch brand profile:", error);
    return { success: false, error: "Failed to fetch brand profile." };
  }
}

export async function updateBrandProfile(data: {
  brandName: string;
  tagline?: string;
  verifiedServices: any[];
  verifiedFacts: any;
  voiceGuidelines?: any;
  aiMonthlyBudgetCap?: number;
}) {
  try {
    const { user } = await requireAdmin();

    const updated = await prisma.brandProfile.upsert({
      where: { id: "default" },
      update: {
        brandName: data.brandName,
        tagline: data.tagline,
        verifiedServices: data.verifiedServices,
        verifiedFacts: data.verifiedFacts,
        voiceGuidelines: data.voiceGuidelines,
        aiMonthlyBudgetCap: data.aiMonthlyBudgetCap ?? 0.0,
      },
      create: {
        id: "default",
        brandName: data.brandName,
        tagline: data.tagline,
        verifiedServices: data.verifiedServices,
        verifiedFacts: data.verifiedFacts,
        voiceGuidelines: data.voiceGuidelines,
        aiMonthlyBudgetCap: data.aiMonthlyBudgetCap ?? 0.0,
      },
    });

    // SEC-007: Append-only audit log
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "UPDATE_BRAND_PROFILE",
        entityType: "BrandProfile",
        entityId: "default",
        metadata: {
          brandName: data.brandName,
          verifiedServicesCount: data.verifiedServices.length,
          aiMonthlyBudgetCap: data.aiMonthlyBudgetCap,
        },
        userAgent: "Admin Console",
      },
    });

    safeRevalidatePath("/brand");
    safeRevalidatePath("/dashboard");
    return { success: true, profile: serializeBrandProfile(updated) };
  } catch (error: any) {
    console.error("Failed to update brand profile:", error);
    return { success: false, error: error.message || "Failed to update brand profile." };
  }
}
