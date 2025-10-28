import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-config";
import CsvAnalyticsClient from "./CsvAnalyticsClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    title: `CSV Analytics | SaaS Dashboard`,
    description: "View comprehensive analytics, sentiment analysis, and AI-powered insights for your uploaded CSV data.",
    openGraph: {
      title: "CSV Analytics | SaaS Dashboard",
      description: "Interactive charts, column statistics, sentiment analysis, and AI summaries for CSV data.",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "CSV Analytics | SaaS Dashboard",
      description: "Comprehensive analytics and AI insights for CSV data.",
    },
  };
}

export default async function CsvAnalyticsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const role = String(session?.user?.role ?? '').toUpperCase();
  if (!session || role !== "ADMIN") {
    redirect("/dashboard");
  }
  return <CsvAnalyticsClient id={params.id} />;
}
