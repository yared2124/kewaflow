import {
  AiProviderAdapter,
  AiGenerationRequest,
  AiGenerationResult,
} from "../types";
import { validateServiceGrounding } from "../../modules/ai/grounding";

// High-quality verified media assets mapped to Kewakibt software domains
const DOMAIN_MEDIA_MAP: Record<string, { url: string; prompt: string }> = {
  software: {
    url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80",
    prompt: "Clean modern software engineering IDE workspace with enterprise TypeScript code on dual monitors",
  },
  automation: {
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80",
    prompt: "Futuristic digital circuits and business process automation workflow schematic, dark navy and cyan lighting",
  },
  cloud: {
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80",
    prompt: "Global high-res cloud network infrastructure with glowing nodes and server racks, high uptime visualization",
  },
  design: {
    url: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1000&auto=format&fit=crop&q=80",
    prompt: "Enterprise design system components in Figma and high-fidelity mobile application prototype interfaces",
  },
  default: {
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80",
    prompt: "Collaborative software engineering team reviewing enterprise architecture diagrams in modern tech office",
  },
};

export class LocalGroundedAdapter implements AiProviderAdapter {
  name = "kewaflow-grounded-engine";

  async generatePost(request: AiGenerationRequest): Promise<AiGenerationResult> {
    const { isValid, matchedService, error } = validateServiceGrounding(request);
    if (!isValid || !matchedService) {
      throw new Error(error || "Service grounding failed");
    }

    const { brandProfile, topic, platform, tone } = request;
    const deliverables = matchedService.deliverables || [];
    const painPoint = matchedService.targetPainPoint || "legacy software limitations";
    const brandName = brandProfile.brandName || "Kewakibt Software Solutions";
    const website = brandProfile.verifiedFacts?.website || "https://kewakibt.com";
    const headquarters = brandProfile.verifiedFacts?.headquarters || "Addis Ababa, Ethiopia";

    // Detect domain for visual mapping
    let media = DOMAIN_MEDIA_MAP.default;
    const lowerService = matchedService.name.toLowerCase();
    const lowerTopic = (topic || "").toLowerCase();

    if (lowerService.includes("cloud") || lowerTopic.includes("cloud") || lowerTopic.includes("devops")) {
      media = DOMAIN_MEDIA_MAP.cloud;
    } else if (lowerService.includes("automation") || lowerTopic.includes("automation") || lowerTopic.includes("bpa")) {
      media = DOMAIN_MEDIA_MAP.automation;
    } else if (lowerService.includes("design") || lowerService.includes("ui") || lowerTopic.includes("ux")) {
      media = DOMAIN_MEDIA_MAP.design;
    } else if (lowerService.includes("software") || lowerTopic.includes("custom") || lowerTopic.includes("web")) {
      media = DOMAIN_MEDIA_MAP.software;
    }

    // Synthesize grounded caption
    const angle = topic && topic.trim().length > 0 ? topic.trim() : matchedService.name;
    const deliverablesList = deliverables.length > 0
      ? `\n\nVerified Capabilities:\n${deliverables.map((d) => `• ${d}`).join("\n")}`
      : "";

    const caption = `🚀 Transform your enterprise with verified ${matchedService.name}.

The Challenge:
Many growing organizations struggle with ${painPoint.toLowerCase()}. Off-the-shelf software rarely fits distinct operational workflows.

How ${brandName} Delivers:
We engineer custom, scalable solutions tailored directly for your team—built from the ground up in ${headquarters}.${deliverablesList}

${angle !== matchedService.name ? `\nFocus Area: ${angle}\n` : ""}
Every system is backed by rigorous architectural standards, automated testing, and comprehensive documentation.

Ready to automate and scale?
🔗 Discover more at ${website} or direct message us to schedule an architectural consultation.`;

    const hashtags = `#${brandName.replace(/\s+/g, "")} #${matchedService.name.replace(/[^a-zA-Z0-9]/g, "")} #EnterpriseSoftware #BoleAddis #TechInEthiopia #SoftwareEngineering`;

    // Flag facts requiring verification (APR-007)
    // If the topic claims specific numbers or guarantees, extract into flaggedFacts
    const flaggedFacts: string[] = [];
    if (lowerTopic.includes("%") || lowerTopic.includes("guarantee") || lowerTopic.includes("hours") || lowerTopic.includes("fastest")) {
      flaggedFacts.push(
        `Specific performance claim in prompt: "${topic}" requires Admin verification evidence prior to approval (APR-007).`
      );
    }

    // Simulated token count and zero-cost calculation for local engine
    const promptTokens = Math.round((caption.length + (topic || "").length) / 4);
    const completionTokens = Math.round(caption.length / 4);

    return {
      caption,
      hashtags,
      suggestedMediaPrompt: media.prompt,
      suggestedImageUrl: media.url,
      flaggedFacts,
      groundedFactsUsed: [
        matchedService.name,
        `Pain Point: ${painPoint}`,
        `Headquarters: ${headquarters}`,
        ...deliverables,
      ],
      usage: {
        promptTokens,
        completionTokens,
        costUsd: 0.0,
        provider: this.name,
        model: "rule-grounded-v1",
      },
      isGrounded: true,
    };
  }
}
