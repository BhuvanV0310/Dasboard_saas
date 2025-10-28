"use client";
import React from "react";
import useSWR from "swr";
import { Skeleton } from "@/app/components/ui/Skeleton";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Upload {
  id: string;
  filename: string;
  uploadedAt: string;
  summaryJson?: {
    rowCount: number;
    columnCount: number;
    columns: string[];
  };
}

async function fetchUploads(userId: string) {
  const res = await fetch(`/api/uploads?userId=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch uploads");
  return res.json();
}

export default function UploadHistoryTable({ userId }: { userId: string }) {
  const router = useRouter();
  const { data, error, isLoading, mutate } = useSWR<Upload[]>(userId ? ["uploads", userId] : null, () => fetchUploads(userId), { refreshInterval: 15000 });
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  async function handleDelete(id: string) {
    const confirmed = window.confirm('Delete this upload? This action cannot be undone.');
    if (!confirmed) return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/uploads/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || 'Failed to delete upload');
      }
      toast.success('Upload deleted');
      await mutate();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  }

  if (error) {
    toast.error("Error loading uploads");
    return <div className="mt-8 text-red-500" role="alert">Error loading uploads</div>;
  }
  if (isLoading) {
    return (
      <div className="mt-8" aria-busy="true" aria-live="polite">
        <Skeleton className="h-6 w-40 mb-3" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }
  if (!data || data.length === 0) return <div className="mt-8 text-gray-500">No uploads found.</div>;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Upload History</h2>
        <span className="text-sm text-gray-500">Total CSVs: <span className="font-bold">{data.length}</span></span>
      </div>
      <table className="w-full text-sm border" role="table" aria-label="Upload history">
        <thead>
          <tr className="bg-gray-100" role="row">
            <th className="p-2 text-left" role="columnheader">Filename</th>
            <th className="p-2 text-left" role="columnheader">Rows</th>
            <th className="p-2 text-left" role="columnheader">Columns</th>
            <th className="p-2 text-left" role="columnheader">Uploaded At</th>
            <th className="p-2 text-left" role="columnheader">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((upload) => (
            <tr key={upload.id} className="border-t" role="row">
              <td className="p-2" role="cell">{upload.filename}</td>
              <td className="p-2" role="cell">{upload.summaryJson?.rowCount ?? "-"}</td>
              <td className="p-2" role="cell">{upload.summaryJson?.columnCount ?? "-"}</td>
              <td className="p-2" role="cell">{new Date(upload.uploadedAt).toLocaleString()}</td>
              <td className="p-2" role="cell">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/dashboard/analytics/csv/${upload.id}`)}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  >
                    View Analysis
                  </button>
                  <button
                    onClick={() => handleDelete(upload.id)}
                    disabled={deletingId === upload.id}
                    className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    {deletingId === upload.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
