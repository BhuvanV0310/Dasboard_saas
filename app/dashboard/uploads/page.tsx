import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-config";
import UploadCard from "./components/UploadCard";
import UploadHistoryTable from "./components/UploadHistoryTable";
import { Toaster } from "react-hot-toast";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSV Uploads | SaaS Dashboard",
  description: "Upload and manage CSV files for advanced analytics and AI-powered insights. Admin-only access.",
  openGraph: {
    title: "CSV Uploads | SaaS Dashboard",
    description: "Upload CSV files to generate comprehensive analytics, sentiment analysis, and AI-powered insights.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CSV Uploads | SaaS Dashboard",
    description: "Upload CSV files for analytics and AI insights.",
  },
};

export default async function UploadsPage() {
  const session = await getServerSession(authOptions);
  const role = String(session?.user?.role ?? '').toUpperCase();
  if (!session || role !== "ADMIN") {
    redirect("/dashboard");
  }
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">CSV Uploads</h1>
      <UploadCard />
      <UploadHistoryTable userId={session.user.id} />
      <Toaster position="top-right" />
    </div>
  );
}
