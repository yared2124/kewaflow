import { PublishingJobData, PublishDispatchResult } from "@/jobs/types";
import { decryptCredential } from "@/lib/crypto";

export interface MetaPostPayload {
  message: string;
  link?: string;
  mediaUrls?: string[];
  pageId: string;
  idempotencyKey: string;
}

/**
 * Resolves the Meta access token, decrypting if encrypted per SEC-003.
 */
function resolveMetaToken(): string | null {
  const raw = process.env.META_ACCESS_TOKEN;
  if (!raw) return null;

  // If token is encrypted with AES-256-GCM (format: iv:authTag:cipher)
  if (raw.split(":").length === 3 && process.env.ENCRYPTION_KEY) {
    try {
      return decryptCredential(raw);
    } catch (err: any) {
      console.error("[MetaPublisher] Failed to decrypt encrypted META_ACCESS_TOKEN:", err.message);
      return null;
    }
  }

  return raw;
}

/**
 * Dispatches an approved post payload to Meta Graph API.
 * Invariants:
 * - SEC-003: Tokens stored encrypted at rest.
 * - SEC-004: Uncertain responses flagged UNCERTAIN, blind retries prohibited.
 * - Production: Dispatches MUST fail closed if credentials are missing or invalid.
 */
export async function dispatchToPlatform(
  jobData: PublishingJobData,
  post: {
    caption: string;
    mediaUrls: string[];
    ctaUrl?: string | null;
    pageId: string;
  }
): Promise<PublishDispatchResult> {
  const metaToken = resolveMetaToken();

  // Real Meta Graph API dispatch if token is present and valid
  if (metaToken && metaToken.startsWith("EAAB")) {
    try {
      const endpoint = `https://graph.facebook.com/v21.0/${post.pageId}/feed`;
      const bodyParams: Record<string, string> = {
        message: post.caption,
        access_token: metaToken,
      };

      if (post.ctaUrl) {
        bodyParams.link = post.ctaUrl;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyParams),
      });

      const data = await res.json();

      if (!res.ok) {
        // Check if error is ambiguous (e.g. 504 Gateway Timeout or network drop)
        const isAmbiguous = res.status === 504 || res.status === 502 || res.status === 408;
        return {
          success: false,
          isAmbiguous,
          error: data.error?.message || `Meta API returned HTTP ${res.status}`,
          response: data,
        };
      }

      return {
        success: true,
        platformPostId: data.id || `meta_post_${Date.now()}`,
        response: data,
      };
    } catch (err: any) {
      // Network timeout / connection reset is inherently ambiguous per SEC-004
      return {
        success: false,
        isAmbiguous: true,
        error: `Meta dispatch connection failure: ${err.message}`,
      };
    }
  }

  // Production fail-closed check: Never simulate success in production
  const isTestEnvironment = process.env.NODE_ENV === "test";
  if (!isTestEnvironment) {
    return {
      success: false,
      isAmbiguous: false,
      error: "Meta API credentials are not configured or invalid. Autonomous publishing blocked (Fail-Closed).",
    };
  }

  // High-fidelity sandbox / test dispatcher (Guarantees safe test execution strictly in NODE_ENV=test)
  const isSimulatedFailure = post.caption.includes("__SIMULATE_FAILURE__");
  const isSimulatedTimeout = post.caption.includes("__SIMULATE_TIMEOUT__");

  if (isSimulatedTimeout) {
    return {
      success: false,
      isAmbiguous: true,
      error: "SEC-004: Connection timeout while awaiting Meta API acknowledgement.",
    };
  }

  if (isSimulatedFailure) {
    return {
      success: false,
      isAmbiguous: false,
      error: "Simulated Meta API permission or rate-limit error (190).",
    };
  }

  // Simulated successful publication for integration tests only
  const platformPostId = `fb_${post.pageId}_${Date.now()}`;
  return {
    success: true,
    platformPostId,
    response: {
      id: platformPostId,
      created_time: new Date().toISOString(),
      idempotency_key: jobData.idempotencyKey,
    },
  };
}
