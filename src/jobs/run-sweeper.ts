import "dotenv/config";
import { validateEnv } from "@/lib/env";
import { startSweeperDaemon } from "./sweeper";
import { redisConnection } from "./queue";
import { prisma } from "@/lib/db/prisma";

// Ensure environment invariants are met at boot
validateEnv();

console.log("[SweeperRunner] Starting standalone KewaFlow PostgreSQL outbox sweeper daemon...");

const intervalMs = process.env.SWEEPER_INTERVAL_MS ? parseInt(process.env.SWEEPER_INTERVAL_MS, 10) : 15000;
const stopSweeper = startSweeperDaemon(intervalMs);

let isShuttingDown = false;

async function handleShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`[SweeperRunner] Received ${signal}. Shutting down sweeper gracefully...`);

  try {
    stopSweeper();
    await redisConnection.quit();
    await prisma.$disconnect();
    console.log("[SweeperRunner] Sweeper shutdown complete.");
    process.exit(0);
  } catch (err) {
    console.error("[SweeperRunner] Error during sweeper shutdown:", err);
    process.exit(1);
  }
}

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));
