import crypto from "crypto";

const SCRYPT_KEY_LENGTH = 64;

/**
 * Strong password hashing using Node.js crypto.scrypt (OWASP recommended)
 * Returns formatted salt:hash string
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, SCRYPT_KEY_LENGTH, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

/**
 * Timing-safe verification of password against salt:hash string
 */
export async function verifyPassword(password: string, combinedHash: string): Promise<boolean> {
  const [salt, key] = combinedHash.split(":");
  if (!salt || !key) {
    return false;
  }

  return new Promise((resolve) => {
    crypto.scrypt(password, salt, SCRYPT_KEY_LENGTH, (err, derivedKey) => {
      if (err) return resolve(false);
      try {
        const storedKey = Buffer.from(key, "hex");
        if (storedKey.length !== derivedKey.length) {
          return resolve(false);
        }
        resolve(crypto.timingSafeEqual(storedKey, derivedKey));
      } catch {
        resolve(false);
      }
    });
  });
}

/**
 * Computes deterministic SHA-256 hash for emergency recovery codes (SEC-006)
 */
export function hashRecoveryCode(code: string): string {
  const normalized = code.trim().toUpperCase().replace(/[\s-]/g, "");
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Generates an array of cryptographically secure emergency recovery codes
 * Example format: KEWA-A1B2-C3D4
 */
export function generateEmergencyRecoveryCodes(count: number = 8): string[] {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // Base32 unambiguous set
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    const bytes = crypto.randomBytes(8);
    let part1 = "";
    let part2 = "";
    for (let j = 0; j < 4; j++) {
      part1 += alphabet[bytes[j] % alphabet.length];
      part2 += alphabet[bytes[j + 4] % alphabet.length];
    }
    codes.push(`KEWA-${part1}-${part2}`);
  }

  return codes;
}
