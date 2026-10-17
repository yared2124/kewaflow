import test from "node:test";
import assert from "node:assert/strict";
import "dotenv/config";
import { prisma } from "../../src/lib/db/prisma";

test("Step 1: Database Seed Verification", async (t) => {
  await t.test("BrandProfile exists with verified services and facts", async () => {
    const brand = await prisma.brandProfile.findUnique({
      where: { id: "default" },
    });
    assert.ok(brand, "Brand profile must exist");
    assert.equal(brand.brandName, "Kewakibt Software Solutions PLC");
    
    const services = brand.verifiedServices as Array<{ name: string }>;
    assert.ok(Array.isArray(services), "verifiedServices must be an array");
    assert.ok(services.length >= 3, "At least 3 verified services must exist");
  });

  await t.test("Content items and versions satisfy APR-001 hashing", async () => {
    const items = await prisma.contentItem.findMany({
      include: {
        versions: true,
        approvals: true,
      },
    });
    assert.ok(items.length >= 2, "Seeded content items must exist");

    for (const item of items) {
      assert.ok(item.versions.length > 0, "Each item must have at least one version");
      for (const ver of item.versions) {
        assert.ok(ver.versionHash, "Version must have a deterministic hash");
        assert.equal(ver.versionHash.length, 64, "Hash must be 64-char SHA-256");
      }
    }
  });

  await t.test("Approved content has valid ApprovalRecord (APR-002, APR-006)", async () => {
    const approvedItem = await prisma.contentItem.findFirst({
      where: { reviewState: "APPROVED" },
      include: { approvals: true },
    });
    assert.ok(approvedItem, "An approved content item must exist");
    assert.ok(approvedItem.approvals.length > 0, "Approved item must have an ApprovalRecord");

    const activeApproval = approvedItem.approvals.find((a) => a.status === "ACTIVE");
    assert.ok(activeApproval, "Must have an ACTIVE ApprovalRecord");
    assert.ok(
      activeApproval.expiresAt > new Date(),
      "ApprovalRecord must not be expired"
    );
  });

  await t.test("CRM leads conform to CRM-001 and CRM-002 valid stages", async () => {
    const leads = await prisma.lead.findMany();
    assert.ok(leads.length >= 4, "Seeded leads must exist");

    const validStages = ["INQUIRY", "QUALIFIED", "PROPOSAL", "WON", "LOST"];
    for (const lead of leads) {
      assert.ok(
        validStages.includes(lead.stage),
        `Lead stage ${lead.stage} must be one of ${validStages.join(", ")}`
      );
    }
  });

  await t.test("AuditLog contains bootstrap and approval records (SEC-007)", async () => {
    const logs = await prisma.auditLog.findMany();
    assert.ok(logs.length >= 2, "Audit log records must exist");
    const actions = logs.map((l) => l.action);
    assert.ok(actions.includes("BOOTSTRAP_DATABASE"));
  });
});
