import { AiGenerationRequest, VerifiedServiceItem } from "@/providers/types";

/**
 * Validates that the requested service is verified in the brand profile.
 * Enforces BRD-001 & BRD-003.
 */
export function validateServiceGrounding(
  request: AiGenerationRequest
): { isValid: boolean; matchedService?: VerifiedServiceItem; error?: string } {
  const { brandProfile, serviceName } = request;

  if (!brandProfile.verifiedServices || brandProfile.verifiedServices.length === 0) {
    return {
      isValid: false,
      error: "BRD-003 Violation: No verified services found in brand profile. Specify services before generating content.",
    };
  }

  const matched = brandProfile.verifiedServices.find(
    (s) =>
      s.name.toLowerCase() === serviceName.toLowerCase() ||
      serviceName.toLowerCase().includes(s.name.toLowerCase()) ||
      s.name.toLowerCase().includes(serviceName.toLowerCase())
  );

  if (!matched) {
    return {
      isValid: false,
      error: `BRD-001 Violation: Service '${serviceName}' is not in the verified service catalogue. AI generation is grounded exclusively in verified services.`,
    };
  }

  return { isValid: true, matchedService: matched };
}

/**
 * Builds the strict anti-hallucination system prompt for LLMs.
 */
export function buildGroundingPrompt(
  request: AiGenerationRequest,
  matchedService: VerifiedServiceItem
): { systemPrompt: string; userPrompt: string } {
  const { brandProfile, topic, platform, tone } = request;

  const deliverablesStr = matchedService.deliverables && matchedService.deliverables.length > 0
    ? matchedService.deliverables.join(", ")
    : "Custom software engineering and deployment";

  const painPoint = matchedService.targetPainPoint || "Operational inefficiencies and manual bottlenecks";

  const headquarters = brandProfile.verifiedFacts?.headquarters || "Addis Ababa, Ethiopia";
  const website = brandProfile.verifiedFacts?.website || "https://kewakibt.com";

  const systemPrompt = `You are KewaFlow AI Marketing Assistant for ${brandProfile.brandName}.
You write compelling, high-converting social media posts strictly grounded in verified company facts.

STRICT INVARIANTS (Violations will cause system rejection):
1. BRD-001: Ground your copy ONLY in the provided verified service details and facts below.
2. BRD-002: NEVER invent client company names, fictional quotes, non-existent awards, pricing figures, money-back guarantees, or fake delivery promises (e.g. "delivered in 24 hours").
3. APR-007: If you mention any specific statistical improvement (e.g., "reduce latency by 40%"), you MUST list that specific claim in the "flaggedFacts" array for mandatory Admin proof.
4. Voice: ${tone || "professional"}, authoritative, and tailored for B2B decision makers.

Output MUST be a valid JSON object matching this schema:
{
  "caption": "The post caption text (engaging hook, value proposition, client pain point solved, CTA)",
  "hashtags": "3 to 5 relevant hashtags including #Kewakibt",
  "suggestedMediaPrompt": "Description of an ideal visual banner or photo for this post",
  "flaggedFacts": ["Array of any specific statistical, SLA, or technical claims requiring Admin verification"]
}`;

  const userPrompt = `Generate a ${platform} post for:
Brand: ${brandProfile.brandName}
Tagline: ${brandProfile.tagline || "Build • Automate • Grow"}
Verified Service: ${matchedService.name}
Service Description: ${matchedService.description}
Pain Point Solved: ${painPoint}
Key Deliverables: ${deliverablesStr}
Headquarters: ${headquarters}
Website / CTA: ${website}
Post Topic / Angle: ${topic || matchedService.name}

Ensure the post highlights how Kewakibt solves real enterprise challenges in Ethiopia and East Africa. Return JSON only.`;

  return { systemPrompt, userPrompt };
}
