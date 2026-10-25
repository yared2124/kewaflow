import { cookies } from "next/headers";
import {
  SESSION_COOKIE_NAME,
  MFA_PENDING_COOKIE_NAME,
  signTokenAsync,
  verifyTokenAsync,
  type SessionPayload,
  type MfaPendingPayload,
} from "./token";

export {
  SESSION_COOKIE_NAME,
  MFA_PENDING_COOKIE_NAME,
  signTokenAsync,
  verifyTokenAsync,
  type SessionPayload,
  type MfaPendingPayload,
};

// In-memory fallback map for test runners / scripts outside Next.js request context
const fallbackStore = new Map<string, string>();

/**
 * Synchronous wrapper around signTokenAsync for convenience in synchronous contexts/tests
 */
export async function signToken<T extends Record<string, unknown>>(payload: T): Promise<string> {
  return await signTokenAsync(payload);
}

/**
 * Synchronous wrapper around verifyTokenAsync for convenience in tests
 */
export async function verifyToken<T extends { expiresAt: number }>(token: string): Promise<T | null> {
  return await verifyTokenAsync<T>(token);
}

/**
 * Get current authenticated session from cookies (Server Action / Server Component context)
 */
export async function getSession(): Promise<SessionPayload | null> {
  let token: string | undefined;

  try {
    const cookieStore = await cookies();
    token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  } catch {
    token = fallbackStore.get(SESSION_COOKIE_NAME);
  }

  if (!token) {
    return null;
  }

  const payload = await verifyTokenAsync<SessionPayload>(token);
  if (!payload || !payload.mfaVerified) {
    return null;
  }

  return payload;
}

/**
 * Get pending MFA session from cookies
 */
export async function getPendingMfaSession(): Promise<MfaPendingPayload | null> {
  let token: string | undefined;

  try {
    const cookieStore = await cookies();
    token = cookieStore.get(MFA_PENDING_COOKIE_NAME)?.value;
  } catch {
    token = fallbackStore.get(MFA_PENDING_COOKIE_NAME);
  }

  if (!token) {
    return null;
  }

  return await verifyTokenAsync<MfaPendingPayload>(token);
}

/**
 * Set the pending MFA cookie (short-lived: 10 minutes)
 */
export async function setPendingMfaCookie(payload: Omit<MfaPendingPayload, "issuedAt" | "expiresAt">): Promise<void> {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + 10 * 60 * 1000; // 10 minutes

  const token = await signTokenAsync({
    ...payload,
    issuedAt,
    expiresAt,
  });

  try {
    const cookieStore = await cookies();
    cookieStore.set(MFA_PENDING_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 10 * 60, // 10 minutes
    });
  } catch {
    fallbackStore.set(MFA_PENDING_COOKIE_NAME, token);
  }
}

/**
 * Set the authenticated session cookie
 */
export async function setSessionCookie(
  payload: Omit<SessionPayload, "issuedAt" | "expiresAt">,
  rememberMe: boolean = true
): Promise<void> {
  const issuedAt = Date.now();
  // 30 days if rememberMe, otherwise 24 hours
  const maxAgeSec = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
  const expiresAt = issuedAt + maxAgeSec * 1000;

  const token = await signTokenAsync({
    ...payload,
    issuedAt,
    expiresAt,
  });

  try {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: maxAgeSec,
    });

    // Clear pending MFA cookie once full session is established
    cookieStore.delete(MFA_PENDING_COOKIE_NAME);
  } catch {
    fallbackStore.set(SESSION_COOKIE_NAME, token);
    fallbackStore.delete(MFA_PENDING_COOKIE_NAME);
  }
}

/**
 * Clear all authentication cookies
 */
export async function clearSessionCookies(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
    cookieStore.delete(MFA_PENDING_COOKIE_NAME);
  } catch {
    fallbackStore.delete(SESSION_COOKIE_NAME);
    fallbackStore.delete(MFA_PENDING_COOKIE_NAME);
  }
}
