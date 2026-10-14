"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Upload,
  Search,
  Filter,
  ArrowUpDown,
  ImageIcon,
  Trash2,
  Download,
  Info,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface MediaAsset {
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

const INITIAL_MEDIA_ASSETS: MediaAsset[] = [
  {
    id: "media-1",
    name: "hero-banner.jpg",
    sizeStr: "2.4 MB",
    format: "JPG",
    type: "image",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80",
    dimensions: "1920 × 1080",
    uploadedAgo: "1 day ago",
    aiGenerated: false,
  },
  {
    id: "media-2",
    name: "office-setup.jpg",
    sizeStr: "1.2 MB",
    format: "JPG",
    type: "image",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=80",
    dimensions: "1280 × 720",
    uploadedAgo: "2 days ago",
    aiGenerated: false,
  },
  {
    id: "media-3",
    name: "logo.png",
    sizeStr: "320 KB",
    format: "PNG",
    type: "brand",
    imageUrl: "/brand/kewakibt-icon.png",
    dimensions: "512 × 512",
    uploadedAgo: "3 days ago",
    aiGenerated: false,
  },
  {
    id: "media-4",
    name: "team-working.jpg",
    sizeStr: "1.8 MB",
    format: "JPG",
    type: "image",
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&auto=format&fit=crop&q=80",
    dimensions: "1920 × 1280",
    uploadedAgo: "3 days ago",
    aiGenerated: false,
  },
  {
    id: "media-5",
    name: "cloud-illustration.png",
    sizeStr: "980 KB",
    format: "PNG",
    type: "illustration",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80",
    dimensions: "1080 × 1080",
    uploadedAgo: "4 days ago",
    aiGenerated: true,
  },
  {
    id: "media-6",
    name: "business-graph.jpg",
    sizeStr: "1.1 MB",
    format: "JPG",
    type: "image",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=80",
    dimensions: "1280 × 850",
    uploadedAgo: "5 days ago",
    aiGenerated: false,
  },
  {
    id: "media-7",
    name: "software-dev.jpg",
    sizeStr: "2.7 MB",
    format: "JPG",
    type: "image",
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=80",
    dimensions: "1920 × 1080",
    uploadedAgo: "6 days ago",
    aiGenerated: false,
  },
  {
    id: "media-8",
    name: "technology.jpg",
    sizeStr: "2.1 MB",
    format: "JPG",
    type: "image",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80",
    dimensions: "1920 × 1080",
    uploadedAgo: "1 week ago",
    aiGenerated: true,
  },
];

export default function MediaLibraryPage() {
  const [assets, setAssets] = useState<MediaAsset[]>(INITIAL_MEDIA_ASSETS);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || asset.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleSimulateUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      const newAsset: MediaAsset = {
        id: `media-${Date.now()}`,
        name: `upload-${Date.now().toString().slice(-4)}.jpg`,
        sizeStr: "1.4 MB",
        format: "JPG",
        type: "image",
        imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&auto=format&fit=crop&q=80",
        dimensions: "1920 × 1080",
        uploadedAgo: "Just now",
        aiGenerated: false,
      };
      setAssets([newAsset, ...assets]);
      setIsUploading(false);
      setShowUploadModal(false);
    }, 800);
  };

  const handleDelete = (id: string) => {
    setAssets(assets.filter((a) => a.id !== id));
    if (selectedAsset?.id === id) setSelectedAsset(null);
  };

  return (
    <div className="space-y-4 max-w-[1320px] mx-auto pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">
            Media Library
          </h1>
          <p className="text-[11px] text-slate-500">
            Manage your images, videos and brand assets. Stored in S3-compatible storage.
          </p>
        </div>

        {/* Action Button: Upload */}
        <button
          onClick={() => setShowUploadModal(true)}
          className="py-1.5 px-3.5 rounded-lg bg-kewa-teal hover:bg-kewa-teal-hover text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Upload className="w-3.5 h-3.5 text-cyan-300" />
          <span>Upload Asset</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-kewa-teal text-slate-800 placeholder-slate-400 font-medium"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Type Filter */}
          <div className="flex items-center gap-1 text-xs">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="all">All types</option>
              <option value="image">Photos</option>
              <option value="brand">Brand Logos</option>
              <option value="illustration">Illustrations</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1 text-xs">
            <select className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden">
              <option>Sort by: Newest</option>
              <option>Sort by: Oldest</option>
              <option>Sort by: Size</option>
            </select>
          </div>
        </div>
      </div>

      {/* Responsive Media Cards Grid (4 cols on lg) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            onClick={() => setSelectedAsset(asset)}
            className="bg-white border border-slate-200/90 hover:border-kewa-teal/50 rounded-xl overflow-hidden shadow-2xs hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
          >
            {/* Thumbnail */}
            <div className="relative h-32 w-full bg-slate-100 overflow-hidden">
              <Image
                src={asset.imageUrl}
                alt={asset.name}
                fill
                className="object-cover group-hover:scale-102 transition-transform duration-300"
              />
              {asset.aiGenerated && (
                <span className="absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-slate-900/70 text-cyan-200 backdrop-blur-xs flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> AI
                </span>
              )}
            </div>

            {/* File Meta */}
            <div className="p-2.5 space-y-0.5">
              <p className="text-xs font-bold text-slate-900 truncate">
                {asset.name}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                {asset.sizeStr} • {asset.format}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Asset Detail Inspection Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  {selectedAsset.name}
                </h3>
                <p className="text-[10px] text-slate-400">
                  {selectedAsset.dimensions} • {selectedAsset.sizeStr}
                </p>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="relative h-48 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <Image
                  src={selectedAsset.imageUrl}
                  alt={selectedAsset.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Asset Meta Details */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">
                    Format & MIME
                  </span>
                  <span className="font-bold text-slate-800">
                    image/{selectedAsset.format.toLowerCase()}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">
                    Dimensions
                  </span>
                  <span className="font-bold text-slate-800">
                    {selectedAsset.dimensions} px
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">
                    Storage
                  </span>
                  <span className="font-bold text-slate-800">
                    S3 Bucket (ADR-005)
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">
                    Retention Rule
                  </span>
                  <span className="font-bold text-emerald-600">
                    Active Attached
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <button
                onClick={() => handleDelete(selectedAsset.id)}
                className="py-1 px-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>

              <button
                onClick={() => setSelectedAsset(null)}
                className="py-1 px-3.5 rounded-lg bg-kewa-teal text-white text-[11px] font-bold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal (SEC-008: 8 MB limit, MIME verification simulation) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900">
                Upload Media Asset
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onClick={handleSimulateUpload}
              className="border-2 border-dashed border-slate-200 hover:border-kewa-teal rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50 space-y-2"
            >
              <div className="w-10 h-10 rounded-full bg-cyan-50 text-kewa-cyan-dark flex items-center justify-center mx-auto">
                <Upload className="w-5 h-5 text-kewa-cyan-dark" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Click to upload or drag & drop
              </p>
              <p className="text-[10px] text-slate-400">
                JPEG, PNG, or WebP up to 8 MB (NFR-007)
              </p>
            </div>

            <div className="text-[10px] text-slate-500 bg-slate-50 p-2.5 rounded-lg space-y-1">
              <span className="font-bold text-slate-700 block">Security Invariant (SEC-008):</span>
              <span>MIME type verified by magic bytes, EXIF metadata stripped on upload.</span>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setShowUploadModal(false)}
                className="py-1 px-3 rounded-lg border border-slate-200 text-slate-600 text-[11px] font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSimulateUpload}
                disabled={isUploading}
                className="py-1 px-3.5 rounded-lg bg-kewa-teal text-white text-[11px] font-bold shadow-xs flex items-center gap-1.5"
              >
                {isUploading ? "Uploading..." : "Upload File"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
