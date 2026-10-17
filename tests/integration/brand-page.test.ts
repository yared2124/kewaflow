import test from "node:test";
import assert from "node:assert/strict";
import "dotenv/config";
import { prisma } from "../../src/lib/db/prisma";
import { getBrandProfile, updateBrandProfile } from "../../src/server/actions/brand";

test("Step 3: Brand Profile Page Integration", async (t) => {
  await t.test("getBrandProfile returns active database record", async () => {
    const res = await getBrandProfile();
    assert.equal(res.success, true);
    assert.ok(res.profile);
    assert.equal(res.profile?.brandName, "Kewakibt Software Solutions PLC");
  });

  await t.test("updateBrandProfile persists changes and writes AuditLog (SEC-007)", async () => {
    const res = await updateBrandProfile({
      brandName: "Kewakibt Software Solutions PLC",
      tagline: "Build • Automate • Grow",
      verifiedServices: [
        {
          id: "srv-1",
          name: "Custom Enterprise Web Systems",
          description: "High reliability web apps",
          isVerified: true,
          deliverables: ["Next.js", "PostgreSQL"],
        },
        {
          id: "srv-2",
          name: "Business Process Automation",
          description: "Automated back-office workflows",
          isVerified: true,
          deliverables: ["Invoices", "Sync"],
        },
        {
          id: "srv-3",
          name: "Cloud Architecture & Migration",
          description: "Scalable cloud setups",
          isVerified: true,
          deliverables: ["Docker", "High Availability"],
        },
      ],
      verifiedFacts: {
        headquarters: "Addis Ababa, Ethiopia (Bole Subcity)",
        primaryEmail: "contact@kewakibt.com",
        primaryPhone: "+251 91 123 4567",
        website: "https://kewakibt.com",
      },
      aiMonthlyBudgetCap: 50.0,
    });

    assert.equal(res.success, true);
    assert.ok(res.profile);

    // Verify AuditLog entry exists
    const log = await prisma.auditLog.findFirst({
      where: {
        action: "UPDATE_BRAND_PROFILE",
        entityType: "BrandProfile",
      },
      orderBy: { createdAt: "desc" },
    });
    assert.ok(log, "AuditLog entry must be created on brand profile update");
    assert.equal(log.actorId, "admin_yared");
  });
});
