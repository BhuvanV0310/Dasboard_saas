"use client";
import React from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} aria-busy="true" aria-label="Loading" />;
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Loading text">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-3 ${i === lines - 1 ? "w-2/3" : "w-full"} bg-gray-200 dark:bg-gray-700 rounded`} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="h-4 w-1/3 bg-gray-200 rounded mb-4" />
      <div className="h-8 w-1/4 bg-gray-200 rounded" />
    </div>
  );
}
