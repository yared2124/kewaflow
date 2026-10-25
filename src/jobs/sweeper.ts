import { prisma } from "@/lib/db/prisma";
import { publishingQueue } from "./queue";
import { PublishingJobData } from "./types";

export interface SweeperResult {
  sweptCount: number;
  enqueuedCount: number;
  skippedCount: number;
  items: Array<{ id: string; title: string; delayMs: number }>;
}

/**
 * PostgreSQL Outbox Sweeper
 * Invariant: Scheduling Source of Truth is PostgreSQL (NOT Redis).
 * A sweeper process SHALL re-enqueue any SCHEDULED jobs absent from the queue
 * after a heartbeat interval. Redis is a queue transport only.
 */
export async function sweepScheduledPosts(): Promise<SweeperResult> {
  const now = new Date();
  // Find posts scheduled for now or within the next 10 minutes (or overdue)
  const windowEnd = new Date(now.getTime() + 10 * 60 * 1000);

  const eligiblePosts = await prisma.contentItem.findMany({
    where: {
      jobState: "SCHEDULED",
      reviewState: "APPROVED",
      publicationOutcome: { in: ["NOT_PUBLISHED", "FAILED"] },
      scheduledAt: { lte: windowEnd },
    },
    include: {
      currentVersion: true,
      approvals: {
        where: { status: "ACTIVE" },
        take: 1,
      },
    },
  });

  let enqueuedCount = 0;
  let skippedCount = 0;
  const itemsEnqueued: Array<{ id: string; title: string; delayMs: number }> = [];

  for (const post of eligiblePosts) {
    if (!post.currentVersionId || !post.currentVersion) {
      skippedCount++;
      continue;
    }

    const scheduledTime = post.scheduledAt || now;
    const delayMs = Math.max(0, scheduledTime.getTime() - now.getTime());
    const jobId = `publish_${post.id}_${post.currentVersionId}`;

    // Inspect Redis queue to ensure job is not already present / active
    const existingJob = await publishingQueue.getJob(jobId);

    if (existingJob) {
      const state = await existingJob.getState();
      // If already waiting, active, or delayed, skip to prevent duplicate dispatch
      if (state === "waiting" || state === "delayed" || state === "active") {
        skippedCount++;
        continue;
      }
    }

    const destinationPageId =
      post.destinationPageId || post.currentVersion.destinationPageId || "kewakibt_official_page";

    // Deterministic idempotency key: contentVersionId:pageId:attemptIndex (ADR-004)
    const idempotencyKey = `${post.currentVersionId}:${destinationPageId}:1`;

    const jobData: PublishingJobData = {
      contentItemId: post.id,
      contentVersionId: post.currentVersionId,
      destinationPageId,
      idempotencyKey,
      attemptIndex: 1,
    };

    await publishingQueue.add("publish-post", jobData, {
      jobId,
      delay: delayMs,
      removeOnComplete: 100,
      removeOnFail: 500,
    });

    enqueuedCount++;
    itemsEnqueued.push({
      id: post.id,
      title: post.title,
      delayMs,
    });

    // Record sweeper event in AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: "system_outbox_sweeper",
        action: "OUTBOX_SWEEPER_ENQUEUED",
        entityType: "ContentItem",
        entityId: post.id,
        metadata: {
          jobId,
          delayMs,
          scheduledAt: scheduledTime.toISOString(),
          versionId: post.currentVersionId,
        },
      },
    });
  }

  return {
    sweptCount: eligiblePosts.length,
    enqueuedCount,
    skippedCount,
    items: itemsEnqueued,
  };
}

/**
 * Starts a background heartbeat daemon that sweeps PostgreSQL periodically.
 */
export function startSweeperDaemon(intervalMs: number = 30000) {
  console.log(`[OutboxSweeper] Starting PostgreSQL outbox sweeper daemon (interval: ${intervalMs}ms)`);
  
  const timer = setInterval(async () => {
    try {
      const res = await sweepScheduledPosts();
      if (res.enqueuedCount > 0) {
        console.log(`[OutboxSweeper] Enqueued ${res.enqueuedCount} posts from PostgreSQL outbox.`);
      }
    } catch (err) {
      console.error("[OutboxSweeper] Error in sweep cycle:", err);
    }
  }, intervalMs);

  return () => clearInterval(timer);
}
