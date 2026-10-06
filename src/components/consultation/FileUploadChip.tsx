"use client";

import React, { useState } from "react";
import { FileText, Image as ImageIcon, X, Loader2, Eye } from "lucide-react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/config";
import { toast } from "sonner";

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploading?: boolean;
  progress?: number;
  error?: string;
}

interface FileUploadChipProps {
  file: AttachedFile;
  onRemove?: (id: string) => void;
  onUploadSuccess?: (id: string, url: string) => void;
  readOnly?: boolean;
}

export default function FileUploadChip({
  file,
  onRemove,
  onUploadSuccess,
  readOnly = false,
}: FileUploadChipProps) {
  const [previewOpen, setPreviewOpen] = useState(false);

  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-zinc-200 max-w-xs shadow-md">
        {file.uploading ? (
          <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
        ) : isImage ? (
          <ImageIcon className="w-4 h-4 text-indigo-400 shrink-0" />
        ) : (
          <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
        )}

        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-[11px] leading-tight text-white">
            {file.name}
          </span>
          <span className="text-[9px] text-zinc-400">
            {file.uploading ? `Uploading... ${file.progress || 0}%` : formatSize(file.size)}
          </span>
        </div>

        {file.url && (
          <button
            onClick={() => setPreviewOpen(true)}
            className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors"
            title="Preview file"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        )}

        {!readOnly && onRemove && (
          <button
            onClick={() => onRemove(file.id)}
            className="p-1 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 rounded transition-colors"
            title="Remove attachment"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Preview Modal */}
      {previewOpen && file.url && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-3xl max-h-[85vh] bg-zinc-900 border border-white/10 rounded-2xl p-4 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <span className="text-xs font-semibold truncate text-white">{file.name}</span>
              <button
                onClick={() => setPreviewOpen(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto mt-3 flex items-center justify-center">
              {isImage ? (
                <img src={file.url} alt={file.name} className="max-w-full max-h-[70vh] object-contain rounded-lg" />
              ) : (
                <iframe src={file.url} className="w-full h-[70vh] rounded-lg border border-white/10" title={file.name} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Helper function to upload file to Firebase Storage
 */
export async function uploadConsultationFile(
  sessionId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const fileRef = ref(storage, `consultations/${sessionId}/uploads/${Date.now()}_${file.name}`);
  const uploadTask = uploadBytesResumable(fileRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (onProgress) onProgress(progress);
      },
      (error) => {
        toast.error(`File upload failed: ${error.message}`);
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}
