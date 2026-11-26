"use server";

import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";

export async function getAuditLogs(filter?: {
  actorId?: string;
  entityType?: string;
  take?: number;
}) {
  try {
    await requireAdmin();

    const logs = await prisma.auditLog.findMany({
      where: {
        actorId: filter?.actorId,
        entityType: filter?.entityType,
      },
      orderBy: { createdAt: "desc" },
      take: filter?.take || 50,
    });
    return { success: true, logs };
  } catch (error: any) {
    console.error("Failed to fetch audit logs:", error);
    return { success: false, error: error.message || "Failed to fetch audit logs." };
  }
}
