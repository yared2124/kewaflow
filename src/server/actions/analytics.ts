"use server";

import { prisma } from "@/lib/db/prisma";

export async function getAnalyticsData() {
  try {
    const [
      leads,
      contentItems,
      approvalsCount,
      brandProfile,
      publishingAttempts,
    ] = await Promise.all([
      prisma.lead.findMany({
        select: {
          id: true,
          stage: true,
          dealValueUsd: true,
          createdAt: true,
        },
      }),
      prisma.contentItem.findMany({
        select: {
          id: true,
          title: true,
          reviewState: true,
          jobState: true,
          publicationOutcome: true,
        },
      }),
      prisma.approvalRecord.count({ where: { status: "ACTIVE" } }),
      prisma.brandProfile.findUnique({ where: { id: "default" } }),
      prisma.publishingAttempt.findMany({
        orderBy: { dispatchedAt: "desc" },
        take: 10,
      }),
    ]);

    const stageCounts: Record<string, number> = {
      INQUIRY: 0,
      QUALIFIED: 0,
      PROPOSAL: 0,
      WON: 0,
      LOST: 0,
    };

    let totalPipelineValue = 0;
    let wonValue = 0;

    leads.forEach((l) => {
      if (stageCounts[l.stage] !== undefined) {
        stageCounts[l.stage]++;
      }
      const val = l.dealValueUsd ? Number(l.dealValueUsd) : 0;
      totalPipelineValue += val;
      if (l.stage === "WON") {
        wonValue += val;
      }
    });

    const totalLeads = leads.length;
    const conversionRate = totalLeads > 0 ? ((stageCounts.WON / totalLeads) * 100).toFixed(1) : "0.0";
    const qualificationRate = totalLeads > 0 ? (((stageCounts.QUALIFIED + stageCounts.PROPOSAL + stageCounts.WON) / totalLeads) * 100).toFixed(1) : "0.0";

    return {
      success: true,
      stats: {
        totalLeads,
        totalPipelineValue,
        wonValue,
        conversionRate,
        qualificationRate,
        totalContentItems: contentItems.length,
        approvedItems: contentItems.filter((c) => c.reviewState === "APPROVED").length,
        scheduledItems: contentItems.filter((c) => c.jobState === "SCHEDULED").length,
        publishedItems: contentItems.filter((c) => c.publicationOutcome === "PUBLISHED").length,
        approvalsCount,
        aiMonthlyBudgetCap: brandProfile?.aiMonthlyBudgetCap ? Number(brandProfile.aiMonthlyBudgetCap) : 0,
      },
      stageCounts,
      publishingAttempts,
    };
  } catch (error) {
    console.error("Failed to fetch analytics data:", error);
    return { success: false, error: "Failed to fetch analytics data." };
  }
}
