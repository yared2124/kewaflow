"use server";

import { prisma } from "@/lib/db/prisma";

export async function getAuditLogs(filter?: {
  actorId?: string;
  entityType?: string;
  take?: number;
}) {
  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        actorId: filter?.actorId,
        entityType: filter?.entityType,
      },
      orderBy: { createdAt: "desc" },
      take: filter?.take || 50,
    });
    return { success: true, logs };
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    return { success: false, error: "Failed to fetch audit logs." };
  }
}
