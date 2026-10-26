import {
  AiProviderAdapter,
  AiGenerationRequest,
  AiGenerationResult,
} from "../types";
import { validateServiceGrounding, buildGroundingPrompt } from "../../modules/ai/grounding";

export class GeminiProviderAdapter implements AiProviderAdapter {
  name = "google-gemini";
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = process.env.GEMINI_MODEL || "gemini-3.8-flash") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generatePost(request: AiGenerationRequest): Promise<AiGenerationResult> {
    const { isValid, matchedService, error } = validateServiceGrounding(request);
    if (!isValid || !matchedService) {
      throw new Error(error || "Service grounding failed");
    }

    const { systemPrompt, userPrompt } = buildGroundingPrompt(request, matchedService);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const body = {
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\nTask:\n${userPrompt}` }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3, // Low temperature for high grounding and low hallucination
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API error (${res.status}): ${errText.slice(0, 200)}`);
    }

    const json = await res.json();
    const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    let parsed: any = {};
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = {
        caption: rawText,
        hashtags: "#Kewakibt #EnterpriseSoftware",
        suggestedMediaPrompt: "Modern enterprise technology solution",
        flaggedFacts: [],
      };
    }

    const usageMetadata = json?.usageMetadata || {};
    const promptTokens = usageMetadata.promptTokenCount || 0;
    const completionTokens = usageMetadata.candidatesTokenCount || 0;

    // Approximate cost for gemini-2.0-flash ($0.10 / 1M prompt, $0.40 / 1M completion)
    const costUsd = Number(((promptTokens * 0.0000001) + (completionTokens * 0.0000004)).toFixed(6));

    return {
      caption: parsed.caption || "Transform operations with Kewakibt custom software.",
      hashtags: parsed.hashtags || "#Kewakibt #SoftwareEngineering #Automation",
      suggestedMediaPrompt: parsed.suggestedMediaPrompt || "High reliability software architecture",
      suggestedImageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80",
      flaggedFacts: Array.isArray(parsed.flaggedFacts) ? parsed.flaggedFacts : [],
      groundedFactsUsed: [matchedService.name, ...(matchedService.deliverables || [])],
      usage: {
        promptTokens,
        completionTokens,
        costUsd,
        provider: this.name,
        model: this.model,
      },
      isGrounded: true,
    };
  }
}
