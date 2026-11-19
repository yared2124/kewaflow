import "dotenv/config";
import { validateEnv } from "@/lib/env";
import { createPublishingWorker } from "./worker";
import { redisConnection } from "./queue";
import { prisma } from "@/lib/db/prisma";

// Ensure environment invariants are met at boot
validateEnv();

console.log("[WorkerRunner] Starting standalone KewaFlow background publishing worker...");

const worker = createPublishingWorker();

let isShuttingDown = false;

async function handleShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`[WorkerRunner] Received ${signal}. Shutting down worker gracefully...`);

  try {
    await worker.close();
    await redisConnection.quit();
    await prisma.$disconnect();
    console.log("[WorkerRunner] Worker shutdown complete.");
    process.exit(0);
  } catch (err) {
    console.error("[WorkerRunner] Error during worker shutdown:", err);
    process.exit(1);
  }
}

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));
