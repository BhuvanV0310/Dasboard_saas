"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "../layout/sidebar";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [role, setRole] = useState<"admin" | "user">("user");
  
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const userRole = (session.user as any)?.role === "ADMIN" ? "admin" : "user";
      setRole(userRole);
    }
  }, [session, status]);
  
  // Hide sidebar on login page
  const showSidebar = pathname !== "/auth/login";
  
  return (
    <div className="flex min-h-screen">
      {showSidebar && <Sidebar role={role} />}
      {showSidebar && <div className="w-72 flex-shrink-0" />}
      <main className="flex-1">{children}</main>
    </div>
  );
}
