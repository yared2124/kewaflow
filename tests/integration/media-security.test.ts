import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs/promises";
import path from "path";
import "dotenv/config";
import { getSecurityData, generateNewRecoveryCodes } from "../../src/server/actions/security";
import { getMediaAssets, uploadMediaAsset } from "../../src/server/actions/media";
import { prisma } from "../../src/lib/db/prisma";

test("Step 4: Media Upload & Security Settings Live Data (SEC-006, SEC-007, SEC-008, NFR-007)", async (t) => {
  await t.test("security.actions: query live session and audit events", async () => {
    const res = await getSecurityData();
    assert.equal(res.success, true);
    assert.ok(Array.isArray(res.sessions));
    assert.ok(res.sessions.length > 0);
    assert.equal(res.sessions[0].isCurrent, true);
    assert.ok(Array.isArray(res.securityLogs));
  });

  await t.test("security.actions: generate new emergency break-glass recovery codes (SEC-006)", async () => {
    const res = await generateNewRecoveryCodes();
    assert.equal(res.success, true);
    assert.ok(Array.isArray(res.codes));
    assert.equal(res.codes.length, 8);

    for (const code of res.codes) {
      assert.match(code, /^KEWA-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    }

    // Verify audit trail
    const audit = await prisma.auditLog.findFirst({
      where: { action: "AUTH_RECOVERY_CODES_REGENERATED" },
      orderBy: { createdAt: "desc" },
    });
    assert.ok(audit);
    assert.equal(audit.action, "AUTH_RECOVERY_CODES_REGENERATED");
  });

  await t.test("media.actions: reject invalid MIME content / fake extensions (SEC-008)", async () => {
    // Disguised file: text content with a .jpg filename
    const fakeBuffer = Buffer.from("THIS IS NOT A VALID JPEG IMAGE DATA");
    const fakeFile = new File([fakeBuffer], "malicious_script.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("file", fakeFile);

    const res = await uploadMediaAsset(formData);
    assert.equal(res.success, false);
    assert.match(res.error || "", /SEC-008 Violation/);
  });

  await t.test("media.actions: reject file exceeding 8 MB (NFR-007)", async () => {
    // Generate buffer exceeding 8 MB
    const largeBuffer = Buffer.alloc(8 * 1024 * 1024 + 1024);
    // Fake JPEG header
    largeBuffer[0] = 0xff;
    largeBuffer[1] = 0xd8;
    largeBuffer[2] = 0xff;

    const largeFile = new File([largeBuffer], "oversized_creative.jpg", { type: "image/jpeg" });
    const formData = new FormData();
    formData.append("file", largeFile);

    const res = await uploadMediaAsset(formData);
    assert.equal(res.success, false);
    assert.match(res.error || "", /NFR-007 Violation/);
  });

  await t.test("media.actions: successfully upload valid PNG binary and verify hash (APR-001, SEC-008)", async () => {
    // Valid minimal 1x1 PNG binary
    const pngHex =
      "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2d400000000049454e44ae426082";
    const pngBuffer = Buffer.from(pngHex, "hex");
    const pngFile = new File([pngBuffer], "verified_kewaflow_ad.png", { type: "image/png" });

    const formData = new FormData();
    formData.append("file", pngFile);

    const res = await uploadMediaAsset(formData);
    assert.equal(res.success, true);
    assert.ok(res.asset);
    assert.equal(res.asset.format, "PNG");
    assert.ok(res.asset.sha256Hash);

    // Verify file exists on disk in public/uploads
    const storedPath = path.join(process.cwd(), "public", res.asset.imageUrl);
    const stat = await fs.stat(storedPath);
    assert.ok(stat.isFile());

    // Verify AuditLog entry (SEC-007)
    const audit = await prisma.auditLog.findFirst({
      where: { action: "MEDIA_UPLOAD" },
      orderBy: { createdAt: "desc" },
    });
    assert.ok(audit);

    // Verify asset appears in getMediaAssets()
    const mediaRes = await getMediaAssets();
    assert.equal(mediaRes.success, true);
    assert.ok(mediaRes.assets);
    const found = mediaRes.assets.some((a) => a.imageUrl === res.asset?.imageUrl);
    assert.equal(found, true);
  });
});
