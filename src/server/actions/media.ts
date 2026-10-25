"use server";

import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { computeContentVersionHash } from "@/lib/crypto";
import { safeRevalidatePath } from "./utils";

export interface MediaAssetRecord {
  id: string;
  name: string;
  sizeStr: string;
  format: "JPG" | "PNG" | "WEBP";
  type: "image" | "brand" | "illustration";
  imageUrl: string;
  dimensions: string;
  uploadedAgo: string;
  aiGenerated: boolean;
  sha256Hash?: string;
}

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB (NFR-007)

/**
 * Validates file magic bytes against content (SEC-008)
 */
function verifyMagicBytes(buffer: Buffer): { valid: boolean; format: "JPG" | "PNG" | "WEBP" | null } {
  if (buffer.length < 12) {
    return { valid: false, format: null };
  }

  // JPEG magic: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, format: "JPG" };
  }

  // PNG magic: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, format: "PNG" };
  }

  // WEBP magic: RIFF....WEBP
  const riff = buffer.toString("ascii", 0, 4);
  const webp = buffer.toString("ascii", 8, 12);
  if (riff === "RIFF" && webp === "WEBP") {
    return { valid: true, format: "WEBP" };
  }

  return { valid: false, format: null };
}

/**
 * Retrieves all registered media assets from PostgreSQL and uploaded files.
 */
export async function getMediaAssets() {
  try {
    const versions = await prisma.contentVersion.findMany({
      select: {
        id: true,
        caption: true,
        mediaUrls: true,
        mediaHashes: true,
        createdAt: true,
        contentItem: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const assets: MediaAssetRecord[] = [];
    const seenUrls = new Set<string>();

    // Add Brand official logo first
    assets.push({
      id: "media-brand-logo",
      name: "kewakibt-official-brand.png",
      sizeStr: "420 KB",
      format: "PNG",
      type: "brand",
      imageUrl: "/brand/kewakibt-icon.png",
      dimensions: "512 × 512",
      uploadedAgo: "Brand Verified",
      aiGenerated: false,
    });
    seenUrls.add("/brand/kewakibt-icon.png");

    // Extract all media URLs from versions in PostgreSQL
    versions.forEach((v) => {
      const urls = Array.isArray(v.mediaUrls) ? (v.mediaUrls as string[]) : [];
      const hashes = Array.isArray(v.mediaHashes) ? (v.mediaHashes as string[]) : [];

      urls.forEach((url, uIdx) => {
        if (!seenUrls.has(url)) {
          seenUrls.add(url);
          const isAi = url.includes("unsplash") || v.caption.toLowerCase().includes("ai");
          const format: "JPG" | "PNG" | "WEBP" = url.endsWith(".png")
            ? "PNG"
            : url.endsWith(".webp")
            ? "WEBP"
            : "JPG";

          assets.push({
            id: `media-ver-${v.id}-${uIdx}`,
            name: `${v.contentItem?.title?.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 24) || "creative"}.${format.toLowerCase()}`,
            sizeStr: "1.4 MB",
            format,
            type: isAi ? "illustration" : "image",
            imageUrl: url,
            dimensions: "1280 × 720",
            uploadedAgo: formatTimeAgo(v.createdAt),
            aiGenerated: isAi,
            sha256Hash: hashes[uIdx] || undefined,
          });
        }
      });
    });

    return { success: true, assets };
  } catch (error) {
    console.error("Failed to fetch media assets:", error);
    return { success: false, error: "Failed to fetch media assets." };
  }
}

/**
 * Handles multipart binary upload with MIME verification (SEC-008) and size caps (NFR-007).
 * Saves to public/uploads, generates SHA-256 hash (APR-001), and logs to AuditLog (SEC-007).
 */
export async function uploadMediaAsset(formData: FormData): Promise<{
  success: boolean;
  asset?: MediaAssetRecord;
  error?: string;
}> {
  try {
    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, error: "No file provided for upload." };
    }

    // NFR-007: Maximum 8 MB image size
    if (file.size > MAX_UPLOAD_BYTES) {
      return {
        success: false,
        error: `NFR-007 Violation: File exceeds 8 MB maximum upload size limit (Current: ${(file.size / 1024 / 1024).toFixed(2)} MB).`,
      };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // SEC-008: Verify MIME type against binary magic bytes (not just extension)
    const { valid, format } = verifyMagicBytes(buffer);
    if (!valid || !format) {
      return {
        success: false,
        error: "SEC-008 Violation: File content does not match allowed image formats (JPEG, PNG, WEBP).",
      };
    }

    // Compute APR-001 deterministic binary hash
    const sha256Hash = crypto.createHash("sha256").update(buffer).digest("hex");

    // Clean filename
    const ext = format.toLowerCase();
    const cleanBase = file.name
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .replace(new RegExp(`\\.${ext}$`, "i"), "");
    const fileName = `${sha256Hash.slice(0, 12)}_${cleanBase}.${ext}`;

    // Target upload directory
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    const filePath = path.join(uploadsDir, fileName);

    await fs.writeFile(filePath, buffer);
    const imageUrl = `/uploads/${fileName}`;

    // Record in PostgreSQL by associating with Media Library Item
    const session = await getSession();
    const adminId = session?.adminId || "admin_yared";

    let mediaLibraryItem = await prisma.contentItem.findFirst({
      where: { title: "Media Library Assets" },
    });

    if (!mediaLibraryItem) {
      mediaLibraryItem = await prisma.contentItem.create({
        data: {
          title: "Media Library Assets",
          targetPlatform: "ALL",
          reviewState: "DRAFT",
          jobState: "UNSCHEDULED",
          publicationOutcome: "NOT_PUBLISHED",
        },
      });
    }

    // Compute ContentVersion hash
    const versionHash = computeContentVersionHash({
      caption: `Uploaded asset: ${file.name}`,
      mediaHashes: [sha256Hash],
      destinationPageId: "media_library",
    });

    const versionCount = await prisma.contentVersion.count({
      where: { contentItemId: mediaLibraryItem.id },
    });

    const newVersion = await prisma.contentVersion.create({
      data: {
        contentItemId: mediaLibraryItem.id,
        versionNumber: versionCount + 1,
        versionHash,
        caption: `Uploaded asset: ${file.name}`,
        mediaUrls: [imageUrl],
        mediaHashes: [sha256Hash],
        destinationPageId: "media_library",
      },
    });

    // Write audit log (SEC-007)
    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: "MEDIA_UPLOAD",
        entityType: "ContentVersion",
        entityId: newVersion.id,
        metadata: {
          fileName: file.name,
          storedName: fileName,
          sizeBytes: file.size,
          sha256Hash,
          format,
        },
      },
    });

    safeRevalidatePath("/media");

    const sizeStr =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    const newAsset: MediaAssetRecord = {
      id: `media-ver-${newVersion.id}-0`,
      name: file.name,
      sizeStr,
      format,
      type: "image",
      imageUrl,
      dimensions: "Uploaded Binary",
      uploadedAgo: "Just now",
      aiGenerated: false,
      sha256Hash,
    };

    return {
      success: true,
      asset: newAsset,
    };
  } catch (error) {
    console.error("Failed to upload media asset:", error);
    return {
      success: false,
      error: "An unexpected error occurred during media binary upload.",
    };
  }
}

function formatTimeAgo(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
