import test from "node:test";
import assert from "node:assert/strict";
import "dotenv/config";
import { generateTotp, verifyTotp } from "../../src/lib/auth/totp";
import { signToken, verifyToken, getSession } from "../../src/lib/auth/session";
import { loginAdmin, verifyMfa, logoutAdmin } from "../../src/server/actions/auth";
import { prisma } from "../../src/lib/db/prisma";
import { decryptCredential } from "../../src/lib/crypto";

test("Step 3: Auth & MFA Integration Tests (SEC-001, SEC-005, SEC-006)", async (t) => {
  const testSecret = "JBSWY3DPEHPK3PXP"; // Standard Base32 test secret

  await t.test("totp: RFC 6238 generation, validation, and zero bypasses", async () => {
    const code = generateTotp(testSecret);
    assert.equal(code.length, 6);
    assert.match(code, /^\d{6}$/);

    // Immediate verification should pass
    const isValid = verifyTotp(code, testSecret);
    assert.equal(isValid, true);

    // Invalid code should fail
    const isInvalid = verifyTotp("000000", testSecret);
    assert.equal(isInvalid, false);

    // STOP-SHIP VERIFICATION: 123456 convenience code must be strictly REJECTED
    assert.equal(verifyTotp("123456", testSecret), false, "Backdoor 123456 must return false");
  });

  await t.test("session: cryptographic token signing and tamper protection", async () => {
    const payload = {
      adminId: "admin_test",
      email: "admin@kewaflow.com",
      sessionId: "sess_test_123",
      mfaVerified: true,
      expiresAt: Date.now() + 60000,
    };

    const token = await signToken(payload);
    assert.ok(token.includes("."));

    // Verified token returns identical payload
    const decoded = await verifyToken<typeof payload>(token);
    assert.ok(decoded);
    assert.equal(decoded.adminId, "admin_test");
    assert.equal(decoded.mfaVerified, true);

    // Tampered token must fail signature check
    const tampered = token.slice(0, -4) + "XXXX";
    const tamperedResult = await verifyToken(tampered);
    assert.equal(tamperedResult, null);

    // Expired token must be rejected
    const expiredToken = await signToken({
      ...payload,
      expiresAt: Date.now() - 5000,
    });
    assert.equal(await verifyToken(expiredToken), null);
  });

  await t.test("auth.actions: login credentials verification against database (SEC-001, SEC-005)", async () => {
    // 1. Invalid password
    const failRes = await loginAdmin("admin@kewaflow.com", "wrong_password_123");
    assert.equal(failRes.success, false);
    assert.ok(failRes.error);

    // 2. Valid credentials -> returns requiresMfa: true and redirectTo: /mfa
    const successRes = await loginAdmin("admin@kewaflow.com", "KewaFlowAdmin2026!");
    assert.equal(successRes.success, true);
    assert.equal(successRes.requiresMfa, true);
    assert.equal(successRes.redirectTo, "/mfa");

    // Verify audit log entry was generated
    const audit = await prisma.auditLog.findFirst({
      where: { action: "AUTH_LOGIN_CREDENTIALS_VERIFIED" },
      orderBy: { createdAt: "desc" },
    });
    assert.ok(audit);
  });

  await t.test("auth.actions: real TOTP verification and session creation", async () => {
    // 1. Set up pending MFA state
    await loginAdmin("admin@kewaflow.com", "KewaFlowAdmin2026!");

    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@kewaflow.com" },
    });
    assert.ok(adminUser);
    assert.ok(adminUser.totpSecretEncrypted);

    const decryptedSecret = decryptCredential(adminUser.totpSecretEncrypted);
    const validTotpCode = generateTotp(decryptedSecret);

    // 2. Verify with valid TOTP
    const res = await verifyMfa({ code: validTotpCode });
    assert.equal(res.success, true);
    assert.equal(res.redirectTo, "/dashboard");

    // 3. Verify session was created in PostgreSQL AdminSession table (SEC-001)
    const sessionRecord = await prisma.adminSession.findFirst({
      where: { userId: adminUser.id, revokedAt: null },
      orderBy: { createdAt: "desc" },
    });
    assert.ok(sessionRecord);
    assert.equal(sessionRecord.mfaVerified, true);
  });

  await t.test("auth.actions: single-use emergency recovery code burning (SEC-006, SEC-007)", async () => {
    // 1. Set up pending MFA state
    await loginAdmin("admin@kewaflow.com", "KewaFlowAdmin2026!");

    // 2. Attempt with invalid recovery code
    const invalidRes = await verifyMfa({ backupCode: "KEWA-0000-0000" });
    assert.equal(invalidRes.success, false);
    assert.match(invalidRes.error || "", /Invalid or previously used emergency recovery code/);

    // 3. First attempt with valid unused code: KEWA-7719-M3K9
    const validRes = await verifyMfa({ backupCode: "KEWA-7719-M3K9" });
    assert.equal(validRes.success, true);
    assert.equal(validRes.redirectTo, "/dashboard");

    // 4. Burn invariant: using the exact same recovery code again must FAIL
    await loginAdmin("admin@kewaflow.com", "KewaFlowAdmin2026!");
    const reusedRes = await verifyMfa({ backupCode: "KEWA-7719-M3K9" });
    assert.equal(reusedRes.success, false);
    assert.match(reusedRes.error || "", /Invalid or previously used emergency recovery code/);
  });

  await t.test("auth.actions: session revocation on logout", async () => {
    // Sign in and establish session
    await loginAdmin("admin@kewaflow.com", "KewaFlowAdmin2026!");
    await verifyMfa({ backupCode: "KEWA-9944-Z2A1" });

    const activeSessionBefore = await getSession();
    assert.ok(activeSessionBefore);

    // Logout
    const logoutRes = await logoutAdmin();
    assert.equal(logoutRes.success, true);
    assert.equal(logoutRes.redirectTo, "/login");

    // Session record in database must be marked revoked
    const revokedSession = await prisma.adminSession.findUnique({
      where: { id: activeSessionBefore.sessionId },
    });
    assert.ok(revokedSession?.revokedAt !== null, "Session must be revoked in database");
  });
});
