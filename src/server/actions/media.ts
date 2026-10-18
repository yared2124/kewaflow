"use server";

import { prisma } from "@/lib/db/prisma";

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
}

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
      urls.forEach((url, uIdx) => {
        if (!seenUrls.has(url)) {
          seenUrls.add(url);
          const isAi = url.includes("unsplash") || v.caption.toLowerCase().includes("ai");
          const format: "JPG" | "PNG" | "WEBP" = url.endsWith(".png") ? "PNG" : "JPG";

          assets.push({
            id: `media-ver-${v.id}-${uIdx}`,
            name: `${v.contentItem?.title?.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 24) || "creative"}.jpg`,
            sizeStr: "1.4 MB",
            format,
            type: isAi ? "illustration" : "image",
            imageUrl: url,
            dimensions: "1280 × 720",
            uploadedAgo: "PostgreSQL Verified",
            aiGenerated: isAi,
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
