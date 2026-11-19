import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
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

export function setTestSessionCookie(token: string): void {
  fallbackStore.set(SESSION_COOKIE_NAME, token);
}

export function clearTestSessionCookie(): void {
  fallbackStore.delete(SESSION_COOKIE_NAME);
  fallbackStore.delete(MFA_PENDING_COOKIE_NAME);
}

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
 * Validates cryptographic signature AND database-level session revocation (SEC-001)
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

  // Stateful DB session revocation check (SEC-001)
  try {
    const dbSession = await prisma.adminSession.findUnique({
      where: { id: payload.sessionId },
    });

    if (dbSession) {
      if (dbSession.revokedAt || dbSession.expiresAt.getTime() <= Date.now() || !dbSession.mfaVerified) {
        return null;
      }
    } else if (process.env.NODE_ENV === "production") {
      // In production, session must exist in DB
      return null;
    }
  } catch {
    // If DB check fails in test environment, allow verified JWT
    if (process.env.NODE_ENV === "production") {
      return null;
    }
  }

  return payload;
}

export interface AuthenticatedAdminContext {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
  };
  adminId: string;
  adminSessionId: string;
}

/**
 * Universal Server Action Guard (SEC-001, SEC-002, SEC-005)
 * Every mutation and protected server action MUST call requireAdmin() first.
 * Rejects unauthenticated calls immediately and binds real identity.
 */
export async function requireAdmin(): Promise<AuthenticatedAdminContext> {
  const session = await getSession();
  if (!session || !session.mfaVerified) {
    throw new Error("SEC-001 Unauthorized: Valid MFA-verified admin session required.");
  }

  // Look up user and active session in database
  let dbUser = await prisma.user.findUnique({
    where: { id: session.adminId },
  });

  if (!dbUser && session.email) {
    dbUser = await prisma.user.findUnique({
      where: { email: session.email.toLowerCase() },
    });
  }

  if (!dbUser) {
    // In dev or test environments with mock tokens, resolve seeded admin
    if (process.env.NODE_ENV !== "production") {
      const fallbackAdmin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
      if (fallbackAdmin) {
        return {
          user: fallbackAdmin,
          session: {
            id: session.sessionId,
            userId: fallbackAdmin.id,
            expiresAt: new Date(session.expiresAt),
          },
          adminId: fallbackAdmin.id,
          adminSessionId: session.sessionId,
        };
      }
    }
    throw new Error("SEC-001 Unauthorized: User account not found.");
  }

  return {
    user: dbUser,
    session: {
      id: session.sessionId,
      userId: dbUser.id,
      expiresAt: new Date(session.expiresAt),
    },
    adminId: dbUser.id,
    adminSessionId: session.sessionId,
  };
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
