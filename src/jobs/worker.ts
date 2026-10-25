import { Worker, Job } from "bullmq";
import { prisma } from "@/lib/db/prisma";
import { redisConnection, PUBLISHING_QUEUE_NAME } from "./queue";
import { PublishingJobData } from "./types";
import { validateJobBeforeDispatch, handleRevalidationFailure } from "./revalidation";
import { dispatchToPlatform } from "@/modules/meta/publisher";

/**
 * BullMQ Background Worker for Publishing Pipeline
 * Invariants: APR-004, APR-008, SEC-004, NFR-001, NFR-002
 */
export function createPublishingWorker() {
  const worker = new Worker<PublishingJobData>(
    PUBLISHING_QUEUE_NAME,
    async (job: Job<PublishingJobData>) => {
      const payload = job.data;
      console.log(`[PublishingWorker] Processing job ${job.id} for item ${payload.contentItemId}`);

      // 1. APR-004 Publish-Time Re-validation
      const validation = await validateJobBeforeDispatch(payload);
      if (!validation.valid) {
        console.warn(`[PublishingWorker] Re-validation blocked job ${job.id}: ${validation.reason}`);
        await handleRevalidationFailure(payload, validation);
        throw new Error(`APR-004 Re-validation Failed: ${validation.reason}`);
      }

      const { item, version } = validation;

      // 2. Transition state to PUBLISHING & record IN_FLIGHT attempt
      await prisma.$transaction(async (tx) => {
        await tx.contentItem.update({
          where: { id: item.id },
          data: { jobState: "PUBLISHING" },
        });

        await tx.publishingAttempt.upsert({
          where: { idempotencyKey: payload.idempotencyKey },
          create: {
            contentItemId: item.id,
            contentVersionId: version.id,
            idempotencyKey: payload.idempotencyKey,
            attemptIndex: payload.attemptIndex,
            status: "IN_FLIGHT",
            dispatchedAt: new Date(),
          },
          update: {
            status: "IN_FLIGHT",
            dispatchedAt: new Date(),
          },
        });
      });

      // 3. Dispatch to Meta API adapter
      const mediaList = Array.isArray(version.mediaUrls) ? (version.mediaUrls as string[]) : [];
      const dispatchResult = await dispatchToPlatform(payload, {
        caption: version.caption,
        mediaUrls: mediaList,
        ctaUrl: version.ctaUrl,
        pageId: payload.destinationPageId || item.destinationPageId || "kewakibt_official_page",
      });

      // 4. Handle dispatch outcome
      if (dispatchResult.success) {
        await prisma.$transaction(async (tx) => {
          // Success: Job finished -> UNSCHEDULED, Outcome -> PUBLISHED
          await tx.contentItem.update({
            where: { id: item.id },
            data: {
              jobState: "UNSCHEDULED",
              publicationOutcome: "PUBLISHED",
            },
          });

          await tx.publishingAttempt.update({
            where: { idempotencyKey: payload.idempotencyKey },
            data: {
              status: "SUCCESS",
              platformPostId: dispatchResult.platformPostId,
              platformResponse: dispatchResult.response || {},
              completedAt: new Date(),
            },
          });

          await tx.auditLog.create({
            data: {
              actorId: "system_publishing_worker",
              action: "CONTENT_PUBLISHED_SUCCESS",
              entityType: "ContentItem",
              entityId: item.id,
              metadata: {
                platformPostId: dispatchResult.platformPostId,
                contentVersionId: version.id,
                versionHash: version.versionHash,
              },
            },
          });
        });

        console.log(`[PublishingWorker] Job ${job.id} published successfully: ${dispatchResult.platformPostId}`);
        return { success: true, platformPostId: dispatchResult.platformPostId };
      }

      // 5. Handle failure (Ambiguous vs Confirmed)
      if (dispatchResult.isAmbiguous) {
        // SEC-004: Uncertain response flags UNCERTAIN and stops retries
        await prisma.$transaction(async (tx) => {
          await tx.contentItem.update({
            where: { id: item.id },
            data: {
              jobState: "DEAD_LETTERED",
              publicationOutcome: "UNCERTAIN",
            },
          });

          await tx.publishingAttempt.update({
            where: { idempotencyKey: payload.idempotencyKey },
            data: {
              status: "UNCERTAIN",
              errorMessage: dispatchResult.error,
              completedAt: new Date(),
            },
          });

          await tx.auditLog.create({
            data: {
              actorId: "system_publishing_worker",
              action: "PUBLISH_OUTCOME_UNCERTAIN",
              entityType: "ContentItem",
              entityId: item.id,
              metadata: {
                error: dispatchResult.error,
                contentVersionId: version.id,
              },
            },
          });
        });

        throw new Error(`SEC-004 Uncertain Outcome: ${dispatchResult.error}`);
      }

      // Confirmed failure
      await prisma.$transaction(async (tx) => {
        await tx.contentItem.update({
          where: { id: item.id },
          data: {
            jobState: "DEAD_LETTERED",
            publicationOutcome: "FAILED",
          },
        });

        await tx.publishingAttempt.update({
          where: { idempotencyKey: payload.idempotencyKey },
          data: {
            status: "FAILED",
            errorMessage: dispatchResult.error,
            completedAt: new Date(),
          },
        });

        await tx.auditLog.create({
          data: {
            actorId: "system_publishing_worker",
            action: "CONTENT_PUBLISHED_FAILED",
            entityType: "ContentItem",
            entityId: item.id,
            metadata: {
              error: dispatchResult.error,
              contentVersionId: version.id,
            },
          },
        });
      });

      throw new Error(`Publishing Failed: ${dispatchResult.error}`);
    },
    {
      connection: redisConnection,
      concurrency: 5,
    }
  );

  worker.on("failed", (job, err) => {
    console.error(`[PublishingWorker] Job ${job?.id} failed with error: ${err.message}`);
  });

  return worker;
}
