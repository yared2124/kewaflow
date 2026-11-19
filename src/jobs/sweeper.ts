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
 * APR-006: Approval Expiry Sweeper
 * Marks active approvals older than 30 days as EXPIRED.
 * Resets item review state to NEEDS_REVIEW and cancels any queued jobs.
 */
export async function expireStaleApprovals(): Promise<number> {
  const now = new Date();
  const expiredRecords = await prisma.approvalRecord.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: { lte: now },
    },
    include: { contentItem: true },
  });

  for (const approval of expiredRecords) {
    await prisma.$transaction(async (tx) => {
      await tx.approvalRecord.update({
        where: { id: approval.id },
        data: { status: "EXPIRED" },
      });

      if (approval.contentItem && approval.contentItem.reviewState === "APPROVED") {
        await tx.contentItem.update({
          where: { id: approval.contentItemId },
          data: {
            reviewState: "NEEDS_REVIEW",
            jobState:
              approval.contentItem.jobState === "SCHEDULED"
                ? "CANCELLED"
                : approval.contentItem.jobState,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: "system_outbox_sweeper",
          action: "APPROVAL_EXPIRED_BY_SWEEPER",
          entityType: "ApprovalRecord",
          entityId: approval.id,
          metadata: {
            contentItemId: approval.contentItemId,
            contentVersionId: approval.contentVersionId,
            expiresAt: approval.expiresAt.toISOString(),
            reason: "Exceeded 30-day validity window without dispatch per APR-006",
          },
        },
      });
    });

    // Remove any queued job from BullMQ
    const jobId = `publish_${approval.contentItemId}_${approval.contentVersionId}`;
    try {
      const job = await publishingQueue.getJob(jobId);
      if (job) await job.remove();
    } catch {}
  }

  return expiredRecords.length;
}

/**
 * SEC-004: Reconcile Uncertain Publishing Attempts
 * Identifies attempts with UNCERTAIN outcome to prevent blind retries.
 */
export async function reconcileUncertainPublishingAttempts(): Promise<number> {
  const uncertainAttempts = await prisma.publishingAttempt.findMany({
    where: { status: "UNCERTAIN" },
    include: { contentItem: true },
    take: 20,
  });

  for (const attempt of uncertainAttempts) {
    console.warn(
      `[Reconciliation] SEC-004: Uncertain publish attempt detected for item ${attempt.contentItemId} (idempotencyKey: ${attempt.idempotencyKey}). Awaiting Admin resolution before retry.`
    );
  }

  return uncertainAttempts.length;
}

/**
 * Starts a background heartbeat daemon that sweeps PostgreSQL periodically.
 */
export function startSweeperDaemon(intervalMs: number = 30000) {
  console.log(`[OutboxSweeper] Starting PostgreSQL outbox sweeper daemon (interval: ${intervalMs}ms)`);
  
  const timer = setInterval(async () => {
    try {
      // 1. Sweep scheduled posts
      const res = await sweepScheduledPosts();
      if (res.enqueuedCount > 0) {
        console.log(`[OutboxSweeper] Enqueued ${res.enqueuedCount} posts from PostgreSQL outbox.`);
      }

      // 2. Expire stale approvals (APR-006)
      const expiredCount = await expireStaleApprovals();
      if (expiredCount > 0) {
        console.log(`[OutboxSweeper] Expired ${expiredCount} stale approvals (>30 days).`);
      }

      // 3. Scan for uncertain publication attempts (SEC-004)
      await reconcileUncertainPublishingAttempts();
    } catch (err) {
      console.error("[OutboxSweeper] Error in sweep cycle:", err);
    }
  }, intervalMs);

  return () => clearInterval(timer);
}
