"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import UploadProgressBar from "./UploadProgressBar";

export default function UploadCard() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressTimer = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(10);
    // Smooth progress animation while uploading
    if (progressTimer.current) clearInterval(progressTimer.current);
    progressTimer.current = setInterval(() => {
      setProgress((p) => (p < 85 ? p + 1 : p));
    }, 200);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      setProgress(90);
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setProgress(100);
      toast.success("Upload successful!");
      // API returns { uploadId, rowCount, columnCount, columns }
      const uploadId = data.uploadId ?? data.id; // fallback in case of older clients
      if (!uploadId) {
        throw new Error("Upload succeeded but no uploadId was returned");
      }
      router.push(`/dashboard/analytics/csv/${uploadId}`);
    } catch (err: any) {
      if (err?.name === "AbortError") {
        toast.error("Upload timed out. Please try again.");
      } else {
        toast.error(err.message || "Upload failed");
      }
      setLoading(false);
      setProgress(0);
    }
  };

  useEffect(() => {
    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div {...getRootProps()} className={`border-2 border-dashed rounded p-6 text-center cursor-pointer ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}>
        <input {...getInputProps()} aria-label="CSV file input" />
        <p className="mb-2">Drag & drop a CSV file here, or click to select</p>
        <p className="text-xs text-gray-500">Max size: 10MB. Only .csv files allowed.</p>
      </div>
      {file && (
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="font-medium">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
          </div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
            onClick={handleUpload}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      )}
      {loading && <UploadProgressBar progress={progress} />}
    </div>
  );
}
