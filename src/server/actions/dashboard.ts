"use server";

import { prisma } from "@/lib/db/prisma";

export async function getDashboardData() {
  try {
    const [
      totalLeadsCount,
      pendingApprovalsCount,
      scheduledPostsCount,
      brandProfile,
      recentApprovals,
      recentLeads,
      recentActivity,
      allLeads,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.contentItem.count({ where: { reviewState: "NEEDS_REVIEW" } }),
      prisma.contentItem.count({ where: { jobState: "SCHEDULED" } }),
      prisma.brandProfile.findUnique({ where: { id: "default" } }),
      prisma.contentItem.findMany({
        where: { reviewState: "NEEDS_REVIEW" },
        include: { currentVersion: true },
        take: 5,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.lead.findMany({
        take: 5,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.auditLog.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
      }),
      prisma.lead.findMany({
        select: { dealValueUsd: true, stage: true },
      }),
    ]);

    // Calculate pipeline value
    const totalPipelineValue = allLeads.reduce((acc, curr) => {
      return acc + (curr.dealValueUsd ? Number(curr.dealValueUsd) : 0);
    }, 0);

    return {
      success: true,
      stats: {
        totalLeadsCount,
        pendingApprovalsCount,
        scheduledPostsCount,
        totalPipelineValue,
        aiMonthlyBudgetCap: brandProfile?.aiMonthlyBudgetCap ? Number(brandProfile.aiMonthlyBudgetCap) : 0,
      },
      recentApprovals,
      recentLeads,
      recentActivity,
    };
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    return { success: false, error: "Failed to fetch dashboard data." };
  }
}
