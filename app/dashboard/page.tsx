"use client";
import React, { useEffect, useState } from "react";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const DashboardPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [role, setRole] = useState<"admin" | "user" | null>(null);

  // Derive role from NextAuth session
  useEffect(() => {
    if (status === "loading") return; // wait for session
    if (status === "unauthenticated" || !session?.user) {
      router.replace("/auth/login");
      return;
    }
    const r = (session.user as any)?.role === "ADMIN" ? "admin" : "user";
    setRole(r);
  }, [status, session, router]);

  if (status === "loading" || !role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eaf1fb]">
        <div className="w-8 h-8 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eaf1fb]">
      <main className="p-10">
        {role === "admin" ? <AdminDashboard /> : <UserDashboard />}
      </main>
    </div>
  );
};

export default DashboardPage;