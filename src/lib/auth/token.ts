// Standard WebCrypto Token Signing & Verification (Universal: works in Edge Runtime & Node.js)

export const SESSION_COOKIE_NAME = "kewaflow_session";
export const MFA_PENDING_COOKIE_NAME = "kewaflow_mfa_pending";

export interface SessionPayload {
  adminId: string;
  email: string;
  sessionId: string;
  mfaVerified: boolean;
  issuedAt: number;
  expiresAt: number;
}

export interface MfaPendingPayload {
  adminId: string;
  email: string;
  rememberMe: boolean;
  issuedAt: number;
  expiresAt: number;
}

function getSecretKey(): string {
  return process.env.SESSION_SECRET || "kewaflow_dev_session_secret_change_in_production";
}

function base64UrlEncode(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str, "utf8").toString("base64url");
  }
  // Fallback for strict browser/edge without Buffer
  const base64 = btoa(unescape(encodeURIComponent(str)));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(base64url: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(base64url, "base64url").toString("utf8");
  }
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return decodeURIComponent(escape(atob(base64)));
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Universal async token signing with HMAC-SHA256 (WebCrypto)
 */
export async function signTokenAsync<T extends Record<string, unknown>>(
  payload: T,
  secret: string = getSecretKey()
): Promise<string> {
  const jsonStr = JSON.stringify(payload);
  const base64Payload = base64UrlEncode(jsonStr);

  const encoder = new TextEncoder();
  const key = await getHmacKey(secret);
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(base64Payload));

  const signatureBytes = new Uint8Array(signatureBuffer);
  let binary = "";
  for (let i = 0; i < signatureBytes.length; i++) {
    binary += String.fromCharCode(signatureBytes[i]);
  }
  const signature = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  return `${base64Payload}.${signature}`;
}

/**
 * Universal async token verification with HMAC-SHA256 (WebCrypto)
 */
export async function verifyTokenAsync<T extends { expiresAt: number }>(
  token: string,
  secret: string = getSecretKey()
): Promise<T | null> {
  if (!token || !token.includes(".")) {
    return null;
  }

  const [base64Payload, signature] = token.split(".");
  if (!base64Payload || !signature) {
    return null;
  }

  try {
    const key = await getHmacKey(secret);
    const encoder = new TextEncoder();

    // Convert signature from base64url to Uint8Array
    let sigBase64 = signature.replace(/-/g, "+").replace(/_/g, "/");
    while (sigBase64.length % 4) {
      sigBase64 += "=";
    }
    const binary = atob(sigBase64);
    const sigBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      sigBytes[i] = binary.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      encoder.encode(base64Payload)
    );

    if (!isValid) {
      return null;
    }

    const jsonStr = base64UrlDecode(base64Payload);
    const payload = JSON.parse(jsonStr) as T;

    if (payload.expiresAt && Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
