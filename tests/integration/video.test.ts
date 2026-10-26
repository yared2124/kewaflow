import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import "dotenv/config";
import { prisma } from "../../src/lib/db/prisma";
import { generateMotionVideo } from "../../src/server/actions/video";

test("Free Video Generator Integration (ADR-005, BRD-001, APR-001)", async (t) => {
  await t.test("generates motion video with local FFmpeg, zero fees, and valid SHA-256 hash", async () => {
    const res = await generateMotionVideo({
      serviceName: "Custom Enterprise Web Systems",
      headline: "Scalable Enterprise Web Architecture",
      subtitle: "High Availability & Cloud Engineering",
      aspect: "1:1",
      durationSeconds: 9,
    });

    assert.equal(res.success, true, `Video generation failed: ${res.error}`);
    assert.ok(res.videoUrl, "Should return a videoUrl");
    assert.ok(res.videoUrl.startsWith("/uploads/videos/"), "Video URL should be in uploads folder");
    assert.ok(res.sha256Hash, "Must compute binary SHA-256 hash for APR-001");
    assert.equal(res.sha256Hash?.length, 64, "SHA-256 hash must be 64 hex characters");
    assert.equal(res.resolution, "1080x1080", "1:1 aspect must render 1080x1080");

    // Verify file exists on local filesystem
    const relativePath = res.videoUrl.replace(/^\//, "");
    const fullDiskPath = path.join(process.cwd(), "public", relativePath.replace(/^uploads\//, "uploads/"));
    assert.ok(fs.existsSync(fullDiskPath), `Rendered video file must exist at ${fullDiskPath}`);
    const stats = fs.statSync(fullDiskPath);
    assert.ok(stats.size > 1000, `Rendered video file must not be empty (size: ${stats.size} bytes)`);

    // Verify append-only AuditLog record was logged (SEC-007)
    const log = await prisma.auditLog.findFirst({
      where: {
        action: "GENERATE_MOTION_VIDEO",
        entityType: "MediaAsset",
      },
      orderBy: { createdAt: "desc" },
    });
    assert.ok(log, "AuditLog must record GENERATE_MOTION_VIDEO");
    assert.ok(log?.actorId, "AuditLog actorId must be present");
  });

  await t.test("rejects video generation for unverified service (BRD-001)", async () => {
    const res = await generateMotionVideo({
      serviceName: "Unverified Space Mining Technology",
      headline: "Mining asteroids for profit",
      aspect: "1:1",
    });

    assert.equal(res.success, false);
    assert.match(res.error || "", /BRD-001/);
  });
});
