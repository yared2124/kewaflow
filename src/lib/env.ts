/**
 * Environment & Secrets Invariant Enforcer (SEC-001, SEC-003, SEC-005)
 * Crashes startup if critical security keys are missing, too short, or using insecure defaults.
 */

export function assertSecurityEnv(): void {
  const isProd = process.env.NODE_ENV === "production";

  // 1. SESSION_SECRET Validation
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    throw new Error(
      "FATAL SECURITY CONFIGURATION: SESSION_SECRET is not set in environment. Refusing to boot."
    );
  }

  if (sessionSecret.length < 32) {
    throw new Error(
      "FATAL SECURITY CONFIGURATION: SESSION_SECRET must be at least 32 characters long."
    );
  }

  if (
    isProd &&
    (sessionSecret.includes("dev_session_secret") || sessionSecret.includes("change_in_production"))
  ) {
    throw new Error(
      "FATAL SECURITY CONFIGURATION: Insecure default SESSION_SECRET detected in production environment."
    );
  }

  // 2. ENCRYPTION_KEY Validation (SEC-003)
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error(
      "FATAL SECURITY CONFIGURATION: ENCRYPTION_KEY is not set in environment. Refusing to boot."
    );
  }

  if (!/^[0-9a-fA-F]{64}$/.test(encryptionKey)) {
    throw new Error(
      "FATAL SECURITY CONFIGURATION: ENCRYPTION_KEY must be a 64-character hex string (32 bytes)."
    );
  }

  if (
    isProd &&
    encryptionKey === "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
  ) {
    throw new Error(
      "FATAL SECURITY CONFIGURATION: Insecure example ENCRYPTION_KEY detected in production environment."
    );
  }
}

// Public entrypoint used by standalone worker processes.
// Keep the single validation implementation above as the source of truth.
export const validateEnv = assertSecurityEnv;

// Run check on initialization
assertSecurityEnv();
