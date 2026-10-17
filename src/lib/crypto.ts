import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // Standard for GCM
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypt sensitive credentials (e.g. Meta tokens) per SEC-003.
 * Uses AES-256-GCM authenticated encryption.
 */
export function encryptCredential(plainText: string): string {
  const hexKey = process.env.ENCRYPTION_KEY;
  if (!hexKey || hexKey.length !== 64) {
    throw new Error(
      "SEC-003 Violation: ENCRYPTION_KEY must be a 64-character hex string (32 bytes)."
    );
  }

  const key = Buffer.from(hexKey, "hex");
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt credentials encrypted with encryptCredential.
 */
export function decryptCredential(cipherPackage: string): string {
  const hexKey = process.env.ENCRYPTION_KEY;
  if (!hexKey || hexKey.length !== 64) {
    throw new Error(
      "SEC-003 Violation: ENCRYPTION_KEY must be a 64-character hex string (32 bytes)."
    );
  }

  const parts = cipherPackage.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid cipher package format");
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const key = Buffer.from(hexKey, "hex");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Computes deterministic version hash per APR-001.
 * Hash input MUST include: caption text, all media binary hashes, destination Page ID,
 * CTA URL, any disclosures, scheduled time, and ad configuration if present.
 */
export function computeContentVersionHash(payload: {
  caption: string;
  mediaHashes: string[];
  destinationPageId: string;
  ctaUrl?: string | null;
  disclosures?: string | null;
  scheduledTime?: string | Date | null;
  adConfig?: Record<string, unknown> | null;
}): string {
  const normalized = {
    caption: payload.caption.trim(),
    mediaHashes: [...(payload.mediaHashes || [])].sort(),
    destinationPageId: payload.destinationPageId,
    ctaUrl: payload.ctaUrl || "",
    disclosures: payload.disclosures || "",
    scheduledTime: payload.scheduledTime
      ? new Date(payload.scheduledTime).toISOString()
      : "",
    adConfig: payload.adConfig || null,
  };

  const serialized = JSON.stringify(normalized);
  return crypto.createHash("sha256").update(serialized).digest("hex");
}
