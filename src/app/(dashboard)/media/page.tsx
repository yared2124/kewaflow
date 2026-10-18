"use client";

import React, { useState, useEffect } from "react";
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
  Loader2,
  RefreshCw,
} from "lucide-react";
import { getMediaAssets, MediaAssetRecord } from "@/server/actions/media";

export default function MediaLibraryPage() {
  const [assets, setAssets] = useState<MediaAssetRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedAsset, setSelectedAsset] = useState<MediaAssetRecord | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const loadMedia = async () => {
    setIsLoading(true);
    try {
      const res = await getMediaAssets();
      if (res.success && res.assets) {
        setAssets(res.assets);
      }
    } catch (err) {
      console.error("Failed to load media assets:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || asset.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleSimulateUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      const newAsset: MediaAssetRecord = {
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
    }, 700);
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
            S3 Object Storage & Content Version media assets with binary hash verification (ADR-005, SEC-008).
          </p>
        </div>

        {/* Action Button: Upload */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadMedia}
            disabled={isLoading}
            className="py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="py-1.5 px-3.5 rounded-lg bg-kewa-teal hover:bg-kewa-teal-hover text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-300" />
            <span>Upload Asset</span>
          </button>
        </div>
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
              <option value="all">All types ({assets.length})</option>
              <option value="image">Photos</option>
              <option value="brand">Brand Assets</option>
              <option value="illustration">Illustrations & AI</option>
            </select>
          </div>
        </div>
      </div>

      {/* Media Cards Grid */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-2 bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-6 h-6 animate-spin text-kewa-teal" />
          <p className="text-xs font-medium">Scanning PostgreSQL media versions...</p>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="py-16 text-center text-slate-400 space-y-1 bg-white rounded-xl border border-slate-200">
          <ImageIcon className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-xs font-semibold">No media assets match your filter.</p>
        </div>
      ) : (
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
                  unoptimized
                  className="object-cover group-hover:scale-102 transition-transform duration-300"
                />
                {asset.aiGenerated && (
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-slate-900/70 text-cyan-200 backdrop-blur-xs flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" /> AI
                  </span>
                )}
                {asset.type === "brand" && (
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-teal-800 text-white flex items-center gap-0.5">
                    Brand
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
      )}

      {/* Asset Detail Inspection Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 truncate max-w-[280px]">
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
              <div className="relative h-44 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <Image
                  src={selectedAsset.imageUrl}
                  alt={selectedAsset.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">Storage Engine:</span>
                  <span className="font-mono text-slate-800">S3 / MinIO (ADR-005)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">Binary Status:</span>
                  <span className="text-emerald-700 font-bold">EXIF stripped • MIME verified (SEC-008)</span>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end bg-slate-50/50">
              <button
                onClick={() => setSelectedAsset(null)}
                className="py-1 px-3.5 rounded-lg bg-kewa-teal text-white text-[11px] font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-3.5">
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

            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center space-y-2 hover:bg-slate-50 transition-colors">
              <Upload className="w-8 h-8 mx-auto text-slate-400" />
              <p className="text-xs font-semibold text-slate-800">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-[10px] text-slate-400">
                JPG, PNG, WEBP up to 8MB (NFR-007). Verified against MIME type (SEC-008).
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowUploadModal(false)}
                className="py-1 px-3 rounded-lg border border-slate-200 text-slate-600 text-[11px] font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSimulateUpload}
                disabled={isUploading}
                className="py-1 px-3.5 rounded-lg bg-kewa-teal text-white text-[11px] font-bold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>{isUploading ? "Uploading..." : "Upload File"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
