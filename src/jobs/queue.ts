import { Queue } from "bullmq";
import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

// Redis client with reconnect configuration suitable for BullMQ
export const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

export const PUBLISHING_QUEUE_NAME = "kewaflow-publishing";
export const AI_GENERATION_QUEUE_NAME = "kewaflow-ai-generation";

export const publishingQueue = new Queue(PUBLISHING_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 1, // APR-004: Blind retries prohibited; requires Admin action on failure
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

export const aiGenerationQueue = new Queue(AI_GENERATION_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: 50,
  },
});
