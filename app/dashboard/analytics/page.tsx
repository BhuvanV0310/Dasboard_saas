"use client";

import React from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import KPIStatCard from './components/KPIStatCard';
import RevenueTrendChart from './components/RevenueTrendChart';
import UserGrowthChart from './components/UserGrowthChart';
import SentimentPieChart from './components/SentimentPieChart';
import BranchPerformanceBar from './components/BranchPerformanceBar';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AnalyticsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { data, error, isLoading } = useSWR('/api/analytics', fetcher, { refreshInterval: 10000 });

  React.useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user || session.user.role !== 'ADMIN') {
      router.replace('/dashboard');
    }
  }, [session, status, router]);

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f8fa]">
        <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading analytics...</p>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f8fa]">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          Error loading analytics. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#f6f8fa] p-8"
    >
      <h1 className="text-4xl font-bold text-[#0047ab] mb-8">Analytics Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KPIStatCard label="Plans Sold" value={data.plansSold} icon="plan" />
        <KPIStatCard label="Total Revenue" value={`$${data.totalRevenue.toLocaleString()}`} icon="revenue" />
        <KPIStatCard label="Active Subscriptions" value={data.activeSubscriptions} icon="subscription" />
        <KPIStatCard label="Total Users" value={data.totalUsers} icon="user" />
        <KPIStatCard label="MRR" value={`$${data.mrr.toLocaleString()}`} icon="mrr" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <RevenueTrendChart data={data.signupsByWeek} />
        <UserGrowthChart data={data.roleCounts} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <SentimentPieChart data={data.sentimentCounts} />
        <BranchPerformanceBar branches={data.topBranches} sentiment={data.branchSentiment} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Payments Overview */}
        <RevenueTrendChart data={data.paymentStatusCounts} type="payments" />
      </div>
    </motion.div>
  );
}
