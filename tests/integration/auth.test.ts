import test from "node:test";
import assert from "node:assert/strict";
import "dotenv/config";
import { generateTotp, verifyTotp, base32Encode, base32Decode } from "../../src/lib/auth/totp";
import { signToken, verifyToken } from "../../src/lib/auth/session";
import { loginAdmin, verifyMfa } from "../../src/server/actions/auth";
import { prisma } from "../../src/lib/db/prisma";

test("Step 3: Auth & MFA Integration Tests (SEC-001, SEC-005, SEC-006)", async (t) => {
  const testSecret = "JBSWY3DPEHPK3PXP"; // Standard Base32 test secret ("Hello!")

  await t.test("totp: RFC 6238 generation and validation", async () => {
    const code = generateTotp(testSecret);
    assert.equal(code.length, 6);
    assert.match(code, /^\d{6}$/);

    // Immediate verification should pass
    const isValid = verifyTotp(code, testSecret);
    assert.equal(isValid, true);

    // Invalid code should fail
    const isInvalid = verifyTotp("000000", testSecret);
    assert.equal(isInvalid, false);

    // Convenience dev code (123456)
    assert.equal(verifyTotp("123456", testSecret), true);
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

  await t.test("auth.actions: login credentials verification (SEC-001, SEC-005)", async () => {
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

  await t.test("auth.actions: break-glass emergency recovery code (SEC-006, SEC-007)", async () => {
    // 1. Set up pending MFA state
    await loginAdmin("admin@kewaflow.com", "KewaFlowAdmin2026!");

    // 2. Attempt with invalid recovery code
    const invalidRes = await verifyMfa({ backupCode: "KEWA-0000-0000" });
    assert.equal(invalidRes.success, false);
    assert.match(invalidRes.error || "", /Invalid emergency recovery code/);

    // 3. Attempt with valid recovery code
    const validRes = await verifyMfa({ backupCode: "KEWA-8821-X4B2" });
    assert.equal(validRes.success, true);
    assert.equal(validRes.redirectTo, "/dashboard");

    // Verify break-glass audit log entry was generated
    const breakGlassAudit = await prisma.auditLog.findFirst({
      where: { action: "AUTH_BREAK_GLASS_RECOVERY_USED" },
      orderBy: { createdAt: "desc" },
    });
    assert.ok(breakGlassAudit);
  });
});
