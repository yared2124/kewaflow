/**
 * AI Provider Types & Contract
 * Governed by AGENTS.md §2.B (Anti-Hallucination & Brand Grounding) and §4 (ADR-004)
 */

export interface VerifiedServiceItem {
  id?: string;
  name: string;
  description: string;
  targetPainPoint?: string;
  isVerified?: boolean;
  deliverables?: string[];
}

export interface BrandContext {
  brandName: string;
  tagline?: string | null;
  verifiedServices: VerifiedServiceItem[];
  verifiedFacts: {
    description?: string;
    headquarters?: string;
    primaryEmail?: string;
    primaryPhone?: string;
    website?: string;
    [key: string]: any;
  };
  voiceGuidelines?: {
    tone?: string;
    forbiddenClaims?: string[];
    [key: string]: any;
  } | null;
  aiMonthlyBudgetCap: number;
}

export interface AiGenerationRequest {
  brandProfile: BrandContext;
  serviceName: string;
  topic?: string;
  platform: "FACEBOOK" | "INSTAGRAM" | "LINKEDIN";
  tone?: "professional" | "innovative" | "authoritative" | "conversational";
  targetAudience?: string;
}

export interface AiGenerationResult {
  caption: string;
  hashtags: string;
  suggestedMediaPrompt: string;
  suggestedImageUrl: string;
  flaggedFacts: string[];
  groundedFactsUsed: string[];
  usage: {
    promptTokens: number;
    completionTokens: number;
    costUsd: number;
    provider: string;
    model: string;
  };
  isGrounded: boolean;
}

export interface AiProviderAdapter {
  name: string;
  generatePost(request: AiGenerationRequest): Promise<AiGenerationResult>;
}
