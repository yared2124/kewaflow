"use server";

import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { verifyTotp } from "@/lib/auth/totp";
import { verifyPassword, hashRecoveryCode } from "@/lib/auth/password";
import { decryptCredential } from "@/lib/crypto";
import {
  setPendingMfaCookie,
  setSessionCookie,
  clearSessionCookies,
  getPendingMfaSession,
  getSession,
  SessionPayload,
} from "@/lib/auth/session";
import { safeRevalidatePath } from "./utils";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

export interface LoginResult {
  success: boolean;
  requiresMfa?: boolean;
  error?: string;
  redirectTo?: string;
}

export interface VerifyMfaResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
}

/**
 * Validates admin credentials against PostgreSQL User table and enforces progressive lockout.
 * Issues short-lived pending MFA cookie (SEC-005: Zero direct dashboard access without passing MFA).
 */
export async function loginAdmin(
  emailInput: string,
  passwordInput: string,
  rememberMe: boolean = true
): Promise<LoginResult> {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput.trim();

  if (!email || !password) {
    return {
      success: false,
      error: "Email address and password are required.",
    };
  }

  // 1. Fetch user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Record failed attempt audit log (SEC-007)
    await prisma.auditLog.create({
      data: {
        actorId: email || "unknown_actor",
        action: "AUTH_LOGIN_FAILED",
        entityType: "AdminAuth",
        entityId: "auth_attempt",
        metadata: {
          reason: "User not found",
          attemptedEmail: email,
        },
      },
    }).catch(() => {});

    return {
      success: false,
      error: "Invalid email address or password.",
    };
  }

  // 2. Check for active account lockout
  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / (60 * 1000));
    return {
      success: false,
      error: `Account is temporarily locked due to excessive failed attempts. Try again in ${minutesLeft} minute(s).`,
    };
  }

  // 3. Verify password hash using scrypt
  const isPasswordValid = await verifyPassword(password, user.passwordHash);

  if (!isPasswordValid) {
    const nextFailedAttempts = user.failedAttempts + 1;
    const shouldLock = nextFailedAttempts >= MAX_FAILED_ATTEMPTS;
    const lockedUntil = shouldLock ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: nextFailedAttempts,
        lockedUntil,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: shouldLock ? "AUTH_ACCOUNT_LOCKED" : "AUTH_LOGIN_FAILED",
        entityType: "AdminAuth",
        entityId: user.id,
        metadata: {
          email: user.email,
          failedAttempts: nextFailedAttempts,
          reason: "Invalid password",
        },
      },
    }).catch(() => {});

    if (shouldLock) {
      return {
        success: false,
        error: "Account has been locked for 15 minutes due to multiple failed login attempts.",
      };
    }

    return {
      success: false,
      error: "Invalid email address or password.",
    };
  }

  // 4. Reset failed attempts on valid password
  if (user.failedAttempts > 0 || user.lockedUntil) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
      },
    });
  }

  // 5. Issue pending MFA token (SEC-005)
  await setPendingMfaCookie({
    adminId: user.id,
    email: user.email,
    rememberMe,
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "AUTH_LOGIN_CREDENTIALS_VERIFIED",
      entityType: "AdminAuth",
      entityId: user.id,
      metadata: {
        email: user.email,
        step: "MFA_PENDING",
      },
    },
  }).catch(() => {});

  return {
    success: true,
    requiresMfa: true,
    redirectTo: "/mfa",
  };
}

/**
 * Verifies TOTP 6-digit code or emergency recovery code (SEC-005, SEC-006).
 * Burns single-use recovery code upon consumption and issues stateful database session.
 */
export async function verifyMfa(params: {
  code?: string;
  backupCode?: string;
}): Promise<VerifyMfaResult> {
  const pendingSession = await getPendingMfaSession();
  if (!pendingSession) {
    return {
      success: false,
      error: "MFA session expired or invalid. Please sign in again.",
      redirectTo: "/login",
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: pendingSession.adminId },
  });

  if (!user) {
    return {
      success: false,
      error: "Admin user record not found. Please log in again.",
      redirectTo: "/login",
    };
  }

  // Check lockout
  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / (60 * 1000));
    return {
      success: false,
      error: `Account is locked. Try again in ${minutesLeft} minute(s).`,
    };
  }

  let verified = false;
  let isBreakGlass = false;
  let usedRecoveryCodeHash = "";

  if (params.backupCode && params.backupCode.trim()) {
    // SEC-006: Single-use emergency recovery code check
    const codeHash = hashRecoveryCode(params.backupCode);
    const existingCode = await prisma.recoveryCode.findFirst({
      where: {
        userId: user.id,
        codeHash,
        usedAt: null, // Must not be previously used
      },
    });

    if (existingCode) {
      // Burn code immediately (single-use invariant)
      await prisma.recoveryCode.update({
        where: { id: existingCode.id },
        data: { usedAt: new Date() },
      });
      verified = true;
      isBreakGlass = true;
      usedRecoveryCodeHash = codeHash;
    } else {
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: "AUTH_RECOVERY_CODE_FAILED",
          entityType: "AdminAuth",
          entityId: user.id,
          metadata: { reason: "Invalid or already consumed recovery code" },
        },
      }).catch(() => {});

      return {
        success: false,
        error: "Invalid or previously used emergency recovery code.",
      };
    }
  } else if (params.code && params.code.trim()) {
    // RFC 6238 TOTP Verification
    const cleanCode = params.code.trim();

    if (!user.totpSecretEncrypted) {
      return {
        success: false,
        error: "TOTP authenticator is not configured for this account.",
      };
    }

    try {
      const decryptedSecret = decryptCredential(user.totpSecretEncrypted);
      verified = verifyTotp(cleanCode, decryptedSecret);
    } catch {
      verified = false;
    }

    if (!verified) {
      const nextFailed = user.failedAttempts + 1;
      const shouldLock = nextFailed >= MAX_FAILED_ATTEMPTS;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedAttempts: nextFailed,
          lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_DURATION_MS) : undefined,
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: "AUTH_MFA_FAILED",
          entityType: "AdminAuth",
          entityId: user.id,
          metadata: {
            email: user.email,
            reason: "Invalid TOTP code",
            failedAttempts: nextFailed,
          },
        },
      }).catch(() => {});

      return {
        success: false,
        error: shouldLock
          ? "Account locked for 15 minutes due to too many failed verification attempts."
          : "Invalid verification code. Please check your authenticator app and try again.",
      };
    }
  } else {
    return {
      success: false,
      error: "Please enter your 6-digit verification code or recovery code.",
    };
  }

  // Reset failed attempts on successful MFA
  await prisma.user.update({
    where: { id: user.id },
    data: { failedAttempts: 0, lockedUntil: null },
  });

  // Generate unique session ID and token hash
  const sessionId = `sess_${crypto.randomBytes(16).toString("hex")}`;
  const sessionTokenHash = crypto.createHash("sha256").update(sessionId).digest("hex");
  const maxAgeSec = pendingSession.rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
  const expiresAt = new Date(Date.now() + maxAgeSec * 1000);

  // Create stateful AdminSession in PostgreSQL (SEC-001)
  await prisma.adminSession.create({
    data: {
      id: sessionId,
      userId: user.id,
      sessionTokenHash,
      mfaVerified: true,
      expiresAt,
    },
  });

  // Issue authenticated session cookie (SEC-001)
  await setSessionCookie(
    {
      adminId: user.id,
      email: user.email,
      sessionId,
      mfaVerified: true,
    },
    pendingSession.rememberMe
  );

  // Write tamper-evident audit log (SEC-007)
  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: isBreakGlass ? "AUTH_BREAK_GLASS_RECOVERY_USED" : "AUTH_MFA_VERIFIED",
      entityType: "AdminAuth",
      entityId: sessionId,
      metadata: {
        email: user.email,
        sessionId,
        method: isBreakGlass ? "RECOVERY_CODE" : "TOTP_AUTHENTICATOR",
        recoveryCodeHash: isBreakGlass ? usedRecoveryCodeHash.slice(0, 12) + "..." : undefined,
      },
    },
  }).catch(() => {});

  safeRevalidatePath("/dashboard");

  return {
    success: true,
    redirectTo: "/dashboard",
  };
}

/**
 * Logs out admin, revokes session in database, invalidates cookie, and writes audit log.
 */
export async function logoutAdmin(): Promise<{ success: boolean; redirectTo: string }> {
  const session = await getSession();

  if (session) {
    try {
      await prisma.adminSession.update({
        where: { id: session.sessionId },
        data: { revokedAt: new Date() },
      }).catch(() => {});

      await prisma.auditLog.create({
        data: {
          actorId: session.adminId,
          action: "AUTH_LOGOUT",
          entityType: "AdminAuth",
          entityId: session.sessionId,
          metadata: { email: session.email },
        },
      }).catch(() => {});
    } catch {
      // Ignore DB errors
    }
  }

  await clearSessionCookies();
  safeRevalidatePath("/login");

  return {
    success: true,
    redirectTo: "/login",
  };
}

/**
 * Returns active authenticated admin session or null.
 */
export async function getCurrentAdminSession(): Promise<SessionPayload | null> {
  return await getSession();
}
