"use server";

import { prisma } from "@/lib/db/prisma";
import { canSchedule } from "@/lib/state-machine/transitions";
import { safeRevalidatePath } from "./utils";

export async function getCalendarPosts(month?: number, year?: number) {
  try {
    const posts = await prisma.contentItem.findMany({
      where: {
        scheduledAt: { not: null },
      },
      include: {
        currentVersion: true,
        approvals: {
          where: { status: "ACTIVE" },
          take: 1,
        },
      },
      orderBy: { scheduledAt: "asc" },
    });
    return { success: true, posts };
  } catch (error) {
    console.error("Failed to fetch calendar posts:", error);
    return { success: false, error: "Failed to fetch calendar posts." };
  }
}

export async function schedulePost(contentItemId: string, scheduledAt: Date) {
  try {
    const item = await prisma.contentItem.findUnique({
      where: { id: contentItemId },
    });

    if (!item) {
      return { success: false, error: "Content item not found." };
    }

    const check = canSchedule({
      reviewState: item.reviewState,
      jobState: item.jobState,
      publicationOutcome: item.publicationOutcome,
    });

    if (!check.allowed) {
      return { success: false, error: check.reason };
    }

    const updated = await prisma.contentItem.update({
      where: { id: contentItemId },
      data: {
        jobState: "SCHEDULED",
        scheduledAt,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: "admin_yared",
        action: "SCHEDULE_CONTENT",
        entityType: "ContentItem",
        entityId: contentItemId,
        metadata: {
          scheduledAt: scheduledAt.toISOString(),
        },
      },
    });

    safeRevalidatePath("/calendar");
    safeRevalidatePath("/dashboard");
    return { success: true, item: updated };
  } catch (error) {
    console.error("Failed to schedule post:", error);
    return { success: false, error: "Failed to schedule post." };
  }
}
