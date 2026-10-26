"use server";

import { prisma } from "@/lib/db/prisma";
import { safeRevalidatePath } from "./utils";

export type ValidLeadStage = "INQUIRY" | "QUALIFIED" | "PROPOSAL" | "WON" | "LOST";

function serializeLead<T extends { dealValueUsd?: any }>(
  lead: T
): Omit<T, "dealValueUsd"> & { dealValueUsd: number | null } {
  return {
    ...lead,
    dealValueUsd: lead.dealValueUsd != null ? Number(lead.dealValueUsd) : null,
  };
}

export async function getLeads(stage?: ValidLeadStage) {
  try {
    const leads = await prisma.lead.findMany({
      where: stage ? { stage } : undefined,
      orderBy: { updatedAt: "desc" },
      include: {
        contentItem: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
    return { success: true, leads: leads.map((l) => serializeLead(l)) };
  } catch (error) {
    console.error("Failed to fetch leads:", error);
    return { success: false, error: "Failed to fetch leads." };
  }
}

/**
 * Update lead stage (CRM-002)
 */
export async function updateLeadStage(leadId: string, newStage: ValidLeadStage) {
  const VALID_STAGES: ValidLeadStage[] = [
    "INQUIRY",
    "QUALIFIED",
    "PROPOSAL",
    "WON",
    "LOST",
  ];

  if (!VALID_STAGES.includes(newStage)) {
    return {
      success: false,
      error: `CRM-002 Violation: Invalid stage '${newStage}'. Only INQUIRY, QUALIFIED, PROPOSAL, WON, LOST are permitted.`,
    };
  }

  try {
    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: { stage: newStage },
    });

    await prisma.auditLog.create({
      data: {
        actorId: "admin_yared",
        action: "UPDATE_LEAD_STAGE",
        entityType: "Lead",
        entityId: leadId,
        metadata: {
          leadName: lead.name,
          newStage,
        },
      },
    });

    safeRevalidatePath("/leads");
    safeRevalidatePath("/dashboard");
    return { success: true, lead: serializeLead(lead) };
  } catch (error) {
    console.error("Failed to update lead stage:", error);
    return { success: false, error: "Failed to update lead stage." };
  }
}

/**
 * Create new lead with explicit attribution (CRM-001, CRM-003)
 */
export async function createLead(payload: {
  name: string;
  contactChannel: string;
  contactIdentifier: string;
  stage?: ValidLeadStage;
  attributionType?: "DIRECT" | "ASSISTED" | "UNKNOWN";
  sourceCampaign?: string;
  notes?: string;
  dealValueUsd?: number;
}) {
  try {
    const lead = await prisma.lead.create({
      data: {
        name: payload.name,
        contactChannel: payload.contactChannel,
        contactIdentifier: payload.contactIdentifier,
        stage: payload.stage || "INQUIRY",
        attributionType: payload.attributionType || "UNKNOWN",
        sourceCampaign: payload.sourceCampaign,
        notes: payload.notes,
        dealValueUsd: payload.dealValueUsd,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: "admin_yared",
        action: "CREATE_LEAD",
        entityType: "Lead",
        entityId: lead.id,
        metadata: {
          leadName: lead.name,
          attributionType: lead.attributionType,
          dealValueUsd: payload.dealValueUsd,
        },
      },
    });

    safeRevalidatePath("/leads");
    safeRevalidatePath("/dashboard");
    return { success: true, lead: serializeLead(lead) };
  } catch (error) {
    console.error("Failed to create lead:", error);
    return { success: false, error: "Failed to create lead." };
  }
}
