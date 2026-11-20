import crypto from "crypto";
import { prisma } from "../../src/lib/db/prisma";
import { signToken, setTestSessionCookie } from "../../src/lib/auth/session";

/**
 * Authenticates the integration test environment with a valid, stateful AdminSession in PostgreSQL.
 */
export async function authenticateTestAdmin(): Promise<{ adminId: string; sessionId: string }> {
  let adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: "admin@kewaflow.com",
        name: "Yared Aregayehu",
        passwordHash: "test_hash",
        role: "ADMIN",
        totpEnabled: true,
      },
    });
  }

  const sessionId = `sess_test_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  await prisma.adminSession.create({
    data: {
      id: sessionId,
      userId: adminUser.id,
      sessionTokenHash: crypto.createHash("sha256").update(sessionId).digest("hex"),
      mfaVerified: true,
      expiresAt: new Date(Date.now() + 86400000),
    },
  });

  const token = await signToken({
    adminId: adminUser.id,
    email: adminUser.email,
    sessionId,
    mfaVerified: true,
    issuedAt: Date.now(),
    expiresAt: Date.now() + 86400000,
  });

  setTestSessionCookie(token);

  return { adminId: adminUser.id, sessionId };
}
