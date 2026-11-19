import test from "node:test";
import assert from "node:assert/strict";
import "dotenv/config";
import { prisma } from "../../src/lib/db/prisma";

test("SEC-007: AuditLog Database-Level Tamper-Evidence Invariant", async (t) => {
  let testLogId: string = "";

  t.before(async () => {
    // Insert a valid audit log entry
    const entry = await prisma.auditLog.create({
      data: {
        actorId: "test_sec_actor",
        action: "TAMPER_TEST_PROBE",
        entityType: "SecurityAudit",
        entityId: "probe_001",
        metadata: { probe: true },
      },
    });
    testLogId = entry.id;
    assert.ok(testLogId);
  });

  await t.test("SEC-007: Database blocks any UPDATE operation on AuditLog", async () => {
    let threw = false;
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE "AuditLog" SET "action" = 'TAMPERED_ACTION' WHERE "id" = '${testLogId}';`
      );
    } catch (err: any) {
      threw = true;
      assert.match(err.message, /SEC-007 Violation/);
    }
    assert.equal(threw, true, "Database trigger MUST prevent UPDATE on AuditLog");
  });

  await t.test("SEC-007: Database blocks any DELETE operation on AuditLog", async () => {
    let threw = false;
    try {
      await prisma.$executeRawUnsafe(
        `DELETE FROM "AuditLog" WHERE "id" = '${testLogId}';`
      );
    } catch (err: any) {
      threw = true;
      assert.match(err.message, /SEC-007 Violation/);
    }
    assert.equal(threw, true, "Database trigger MUST prevent DELETE on AuditLog");
  });
});
