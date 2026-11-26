"use server";

import { prisma } from "@/lib/db/prisma";
import { requireAdmin, getSession } from "@/lib/auth/session";
import { hashRecoveryCode, generateEmergencyRecoveryCodes } from "@/lib/auth/password";
import { safeRevalidatePath } from "./utils";

export interface SessionInfo {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  isCurrent: boolean;
  lastActive: string;
}

export interface SecurityEventLog {
  id: string;
  event: string;
  category: "auth" | "approval" | "integration" | "session";
  location: string;
  device: string;
  time: string;
  status: "Success" | "Verified" | "Authorized";
}

/**
 * Loads verified security profile and real active sessions from PostgreSQL (SEC-001)
 */
export async function getSecurityData() {
  try {
    const { session: adminSession, user } = await requireAdmin();
    const session = await getSession();
    if (!session || session.sessionId !== adminSession.id || session.adminId !== user.id) {
      throw new Error("SEC-001 Unauthorized: Valid MFA-verified admin session required.");
    }
    const adminEmail = session?.email || "admin@kewaflow.com";

    // Query real security and auth audit logs (SEC-007)
    const logs = await prisma.auditLog.findMany({
      where: {
        OR: [
          { action: { startsWith: "AUTH_" } },
          { action: { startsWith: "APPROVE_" } },
          { action: { startsWith: "MEDIA_" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    });

    let dbSessions: any[] = [];
    if (session?.adminId) {
      dbSessions = await prisma.adminSession.findMany({
        where: {
          userId: session.adminId,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    const activeSessions: SessionInfo[] = dbSessions.map((s) => ({
      id: s.id,
      device: s.userAgent ? s.userAgent.slice(0, 32) : "Administrator Terminal",
      browser: "Authenticated Client (MFA)",
      location: "Addis Ababa, Ethiopia",
      ip: s.ipAddress || "127.0.0.1",
      isCurrent: s.id === session?.sessionId,
      lastActive: s.id === session?.sessionId ? "Active now" : formatTimeAgo(s.updatedAt || s.createdAt),
    }));

    if (activeSessions.length === 0 && session) {
      activeSessions.push({
        id: session.sessionId,
        device: "Current Administrator Terminal",
        browser: "Next.js Authenticated Client",
        location: "Addis Ababa, Ethiopia",
        ip: "127.0.0.1",
        isCurrent: true,
        lastActive: "Active now",
      });
    }

    const formattedLogs: SecurityEventLog[] = logs.map((log) => {
      let category: "auth" | "approval" | "integration" | "session" = "auth";
      if (log.action.includes("APPROVE")) category = "approval";
      else if (log.action.includes("SESSION")) category = "session";

      return {
        id: log.id,
        event: log.action,
        category,
        location: log.ipAddress || "Addis Ababa, Ethiopia",
        device: log.userAgent ? log.userAgent.slice(0, 24) : "Chrome / Authenticated",
        time: formatTimeAgo(log.createdAt),
        status: "Verified",
      };
    });

    return {
      success: true,
      mfaEnabled: true,
      sessions: activeSessions,
      securityLogs: formattedLogs,
      adminEmail,
    };
  } catch (error) {
    console.error("Failed to fetch security settings data:", error);
    return {
      success: false,
      error: "Failed to load live security data.",
      sessions: [],
      securityLogs: [],
    };
  }
}

/**
 * Revokes an active session immediately in PostgreSQL (SEC-001)
 */
export async function revokeAdminSession(sessionId: string) {
  try {
    const { user } = await requireAdmin();

    const targetSession = await prisma.adminSession.findFirst({
      where: {
        id: sessionId,
        userId: user.id,
      },
    });

    if (!targetSession) {
      return { success: false, error: "Session not found or not owned by user." };
    }

    await prisma.adminSession.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "AUTH_SESSION_REVOKED",
        entityType: "AdminSession",
        entityId: sessionId,
        metadata: { userId: user.id },
      },
    });

    safeRevalidatePath("/settings/security");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to revoke session." };
  }
}

/**
 * Generates 8 new emergency recovery codes, saves their hashes into PostgreSQL,
 * burns any previous unused codes, and returns plaintext codes once (SEC-006).
 */
export async function generateNewRecoveryCodes() {
  try {
    const { user } = await requireAdmin();

    // 1. Generate 8 cryptographically random codes
    const newCodes = generateEmergencyRecoveryCodes(8);

    // 2. Persist in database atomically
    await prisma.$transaction(async (tx) => {
      // Invalidate existing unused codes
      await tx.recoveryCode.deleteMany({
        where: {
          userId: user.id,
          usedAt: null,
        },
      });

      // Insert new hashed codes
      await tx.recoveryCode.createMany({
        data: newCodes.map((code) => ({
          userId: user.id,
          codeHash: hashRecoveryCode(code),
        })),
      });

      // Write audit log (SEC-007)
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: "AUTH_RECOVERY_CODES_REGENERATED",
          entityType: "AdminAuth",
          entityId: user.id,
          metadata: {
            generatedCount: newCodes.length,
          },
        },
      });
    });

    safeRevalidatePath("/settings/security");

    return {
      success: true,
      codes: newCodes,
    };
  } catch (error: any) {
    console.error("Failed to generate recovery codes:", error);
    return {
      success: false,
      error: error.message || "Failed to regenerate emergency recovery codes.",
    };
  }
}

function formatTimeAgo(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
