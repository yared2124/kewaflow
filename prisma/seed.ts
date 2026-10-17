import "dotenv/config";
import { prisma } from "../src/lib/db/prisma";
import { computeContentVersionHash } from "../src/lib/crypto";

async function main() {
  console.log("🌱 Starting KewaFlow baseline database seed...");

  // 1. Clean existing records for clean idempotent seeding
  await prisma.approvalRecord.deleteMany();
  await prisma.publishingAttempt.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.contentVersion.deleteMany();
  await prisma.contentItem.deleteMany();
  await prisma.brandProfile.deleteMany();
  await prisma.auditLog.deleteMany();

  // 2. Seed Brand Profile (BRD-001, BRD-002, BRD-003)
  console.log("Creating Brand Profile...");
  const brandProfile = await prisma.brandProfile.create({
    data: {
      id: "default",
      brandName: "Kewakibt Software Solutions PLC",
      tagline: "Build • Automate • Grow",
      verifiedServices: [
        {
          id: "srv-1",
          name: "Custom Enterprise Web Systems",
          description:
            "Scalable web applications and ERP/CRM platforms tailored to African business operations.",
          targetPainPoint: "Off-the-shelf software doesn't fit custom local workflows",
          deliverables: [
            "Full-stack web applications",
            "Multi-tenant database architecture",
            "Enterprise API integrations",
            "Automated CI/CD pipelines",
          ],
        },
        {
          id: "srv-2",
          name: "Business Process Automation",
          description:
            "Eliminate manual data re-entry, connect legacy back-offices, and automate billing & reconciliation workflows.",
          targetPainPoint: "Manual operations slowing growth and introducing data errors",
          deliverables: [
            "Document & invoice workflows",
            "ERP-to-accounting bridges",
            "Automated notification pipelines",
          ],
        },
        {
          id: "srv-3",
          name: "Cloud Architecture & Migration",
          description:
            "Resilient cloud infrastructure with cost governance, automated backups, and 99.9% uptime SLAs.",
          targetPainPoint: "Fragile on-premise servers and unbudgeted cloud costs",
          deliverables: [
            "Docker containerization",
            "PostgreSQL high-availability clustering",
            "Automated off-site disaster recovery",
          ],
        },
      ],
      verifiedFacts: {
        headquarters: "Addis Ababa, Ethiopia (Bole Subcity)",
        primaryEmail: "contact@kewakibt.com",
        primaryPhone: "+251 91 123 4567",
        website: "https://kewakibt.com",
        coreTechnologies: ["Next.js", "TypeScript", "PostgreSQL", "Docker", "Python"],
        deliveryPledge: "Zero invented claims; strictly governed code delivery with SLAs.",
      },
      voiceGuidelines: {
        tone: "Authoritative, technically grounded, pragmatic, and outcomes-driven",
        prohibitedClaims: [
          "Do not invent fictitious clients, case studies, or testimonials",
          "Do not promise delivery timelines without engineering review",
          "Do not invent awards or unauthorized certifications",
        ],
      },
      aiMonthlyBudgetCap: 50.0,
    },
  });

  // 3. Seed Content Items & Versions (APR-001 -> APR-003)
  console.log("Creating Content Items & Versions...");

  // Post 1: Needs Review
  const caption1 =
    "Turn manual friction into automated growth. We engineer custom enterprise software built specifically for scaling Ethiopian organizations.";
  const hashes1 = ["e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"];
  const pageId = "fb_page_kewakibt_main";

  const hash1 = computeContentVersionHash({
    caption: caption1,
    mediaHashes: hashes1,
    destinationPageId: pageId,
    ctaUrl: "https://kewakibt.com/consultation",
  });

  const item1 = await prisma.contentItem.create({
    data: {
      title: "Custom Enterprise Software Solutions",
      reviewState: "NEEDS_REVIEW",
      jobState: "UNSCHEDULED",
      publicationOutcome: "NOT_PUBLISHED",
      targetPlatform: "FACEBOOK",
      destinationPageId: pageId,
      versions: {
        create: {
          versionNumber: 1,
          versionHash: hash1,
          caption: caption1,
          mediaUrls: [
            "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
          ],
          mediaHashes: hashes1,
          destinationPageId: pageId,
          ctaUrl: "https://kewakibt.com/consultation",
          disclosures: "Official communication from Kewakibt Software Solutions.",
        },
      },
    },
    include: { versions: true },
  });

  // Link currentVersion
  await prisma.contentItem.update({
    where: { id: item1.id },
    data: { currentVersionId: item1.versions[0].id },
  });

  // Post 2: Approved & Scheduled with valid ApprovalRecord (APR-002, APR-006)
  const caption2 =
    "Eliminate repetitive paperwork and streamline your back-office operations. Discover how our automation bridges legacy systems.";
  const hashes2 = ["f4c8996fb92427ae41e4649b934ca495991b7852b855e3b0c44298fc1c149afb"];
  const scheduledTime2 = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days in future

  const hash2 = computeContentVersionHash({
    caption: caption2,
    mediaHashes: hashes2,
    destinationPageId: pageId,
    ctaUrl: "https://kewakibt.com/automation",
    scheduledTime: scheduledTime2,
  });

  const item2 = await prisma.contentItem.create({
    data: {
      title: "Business Process Automation Workflow",
      reviewState: "APPROVED",
      jobState: "SCHEDULED",
      publicationOutcome: "NOT_PUBLISHED",
      targetPlatform: "FACEBOOK",
      destinationPageId: pageId,
      scheduledAt: scheduledTime2,
      versions: {
        create: {
          versionNumber: 1,
          versionHash: hash2,
          caption: caption2,
          mediaUrls: [
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80",
          ],
          mediaHashes: hashes2,
          destinationPageId: pageId,
          ctaUrl: "https://kewakibt.com/automation",
          scheduledTime: scheduledTime2,
          disclosures: "Official communication from Kewakibt Software Solutions.",
        },
      },
    },
    include: { versions: true },
  });

  const version2 = item2.versions[0];
  await prisma.contentItem.update({
    where: { id: item2.id },
    data: { currentVersionId: version2.id },
  });

  // Create active ApprovalRecord for Post 2 (APR-002)
  await prisma.approvalRecord.create({
    data: {
      contentItemId: item2.id,
      contentVersionId: version2.id,
      adminId: "admin_yared",
      adminSessionId: "sess_initial_seed_101",
      status: "ACTIVE",
      reviewedDiff: true,
      confirmedExactFinal: true,
      approvedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days per APR-006
    },
  });

  // 4. Seed CRM Leads (CRM-001 -> CRM-005)
  console.log("Creating CRM Leads...");
  await prisma.lead.createMany({
    data: [
      {
        name: "Alamayehu T. (TechNova Solutions)",
        contactChannel: "WhatsApp",
        contactIdentifier: "+251 91 123 4567",
        stage: "QUALIFIED",
        attributionType: "DIRECT",
        sourceCampaign: "Enterprise Web Systems Campaign",
        notes: "Inquired about internal logistics ERP modernization. Scheduled call.",
        dealValueUsd: 14500.0,
      },
      {
        name: "Selam G. (Global Trade PLC)",
        contactChannel: "Website Form",
        contactIdentifier: "selam.g@globaltrade.et",
        stage: "INQUIRY",
        attributionType: "ASSISTED",
        sourceCampaign: "Organic Facebook Inbound",
        notes: "Needs automated inventory synchronization between warehouses.",
        dealValueUsd: 8200.0,
      },
      {
        name: "Dawit M. (Addis Logistics)",
        contactChannel: "Direct Inbound",
        contactIdentifier: "+251 91 234 5678",
        stage: "PROPOSAL",
        attributionType: "DIRECT",
        sourceCampaign: "Business Automation Campaign",
        notes: "Technical proposal sent for real-time dispatch tracking system.",
        dealValueUsd: 22000.0,
      },
      {
        name: "Bethlehem K. (Apex Healthcare)",
        contactChannel: "Referral",
        contactIdentifier: "b.k@apexhealth.et",
        stage: "WON",
        attributionType: "DIRECT",
        sourceCampaign: "Client Referral",
        notes: "Patient records management system implementation contract signed.",
        dealValueUsd: 18500.0,
      },
    ],
  });

  // 5. Seed Initial Audit Log (SEC-007)
  console.log("Creating System Audit Logs...");
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: "system",
        action: "BOOTSTRAP_DATABASE",
        entityType: "System",
        entityId: "system_init",
        metadata: { message: "System database initialized and verified" },
        ipAddress: "127.0.0.1",
        userAgent: "KewaFlow Seed Script",
      },
      {
        actorId: "admin_yared",
        action: "APPROVE_CONTENT",
        entityType: "ContentItem",
        entityId: item2.id,
        metadata: {
          contentVersionId: version2.id,
          versionHash: hash2,
          scheduledAt: scheduledTime2.toISOString(),
        },
        ipAddress: "127.0.0.1",
        userAgent: "Admin Web Console (MFA Verified)",
      },
    ],
  });

  console.log("✅ KewaFlow baseline database successfully seeded!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
