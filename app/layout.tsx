
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import SidebarLayout from "./components/layout/SidebarLayout";
import React from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SaaS Dashboard | Analytics & Review Management",
  description: "Modern SaaS dashboard with advanced analytics, CSV insights, sentiment analysis, and AI-powered summaries. Manage reviews, track performance, and visualize data.",
  keywords: ["dashboard", "analytics", "saas", "reviews", "sentiment analysis", "AI insights", "CSV analytics"],
  authors: [{ name: "SaaS Dashboard Team" }],
  openGraph: {
    title: "SaaS Dashboard | Analytics & Review Management",
    description: "Comprehensive SaaS platform with advanced analytics, AI-powered insights, and review management.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SaaS Dashboard | Analytics & Review Management",
    description: "Modern SaaS dashboard with AI-powered analytics and insights.",
  },
  robots: {
    index: true,
    follow: true,
  },
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <SidebarLayout>{children}</SidebarLayout>
        </Providers>
      </body>
    </html>
  );
}
