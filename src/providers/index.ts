import { prisma } from "../lib/db/prisma";
import {
  AiProviderAdapter,
  AiGenerationRequest,
  AiGenerationResult,
} from "./types";
import { LocalGroundedAdapter } from "./adapters/local-grounded";
import { GeminiProviderAdapter } from "./adapters/gemini";

/**
 * Returns the active AI provider adapter based on environment configuration.
 * ADR-004 & AGENTS.md §4
 */
export function getAiProvider(preferred?: string): AiProviderAdapter {
  const geminiKey = process.env.GEMINI_API_KEY;
  const geminiModel = process.env.GEMINI_MODEL || "gemini-3.8-flash";

  if (preferred === "google-gemini" && geminiKey) {
    return new GeminiProviderAdapter(geminiKey, geminiModel);
  }

  if (geminiKey) {
    return new GeminiProviderAdapter(geminiKey, geminiModel);
  }

  // Fallback to strict local grounded engine (guarantees zero spend and BRD-001/002 compliance)
  return new LocalGroundedAdapter();
}

/**
 * Executes AI generation with mandatory spend cap and guardrail checks.
 * Enforces:
 * - BRD-001 (Brand grounding)
 * - BRD-002 (Anti-hallucination)
 * - NFR-006 (Monthly spend cap ledger check)
 */
export async function executeAiGeneration(
  request: AiGenerationRequest,
  preferredProvider?: string
): Promise<AiGenerationResult> {
  const provider = getAiProvider(preferredProvider);

  // Check Monthly Spend Cap (NFR-006)
  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  currentMonthStart.setHours(0, 0, 0, 0);

  const monthSpendAgg = await prisma.aiSpendLedger.aggregate({
    where: {
      createdAt: { gte: currentMonthStart },
    },
    _sum: {
      costUsd: true,
    },
  });

  const currentMonthTotal = Number(monthSpendAgg._sum.costUsd || 0);
  const budgetCap = Number(request.brandProfile.aiMonthlyBudgetCap || 0);

  // If budget cap is set > 0 and current spend exceeded, block paid generation
  if (budgetCap > 0 && currentMonthTotal >= budgetCap && provider.name !== "kewaflow-grounded-engine") {
    throw new Error(
      `NFR-006 Violation: Monthly AI budget cap ($${budgetCap.toFixed(2)}) reached. Current spend: $${currentMonthTotal.toFixed(2)}. Generation paused.`
    );
  }

  // Execute Generation with graceful fallback to LocalGroundedAdapter if remote API is unavailable
  let result: AiGenerationResult;
  try {
    result = await provider.generatePost(request);
  } catch (err: any) {
    if (provider.name !== "kewaflow-grounded-engine") {
      console.warn(`[AiProvider] ${provider.name} failed (${err.message}). Falling back to local grounded engine.`);
      const fallback = new LocalGroundedAdapter();
      result = await fallback.generatePost(request);
    } else {
      throw err;
    }
  }

  // Record in AiSpendLedger
  await prisma.aiSpendLedger.create({
    data: {
      provider: result.usage.provider,
      model: result.usage.model,
      operationType: "caption_generation",
      promptTokens: result.usage.promptTokens,
      completionTokens: result.usage.completionTokens,
      costUsd: result.usage.costUsd,
    },
  });

  return result;
}
