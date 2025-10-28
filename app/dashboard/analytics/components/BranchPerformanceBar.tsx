import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

interface BranchPerformanceBarProps {
  branches: any[];
  sentiment: any[];
}

export default function BranchPerformanceBar({ branches, sentiment }: BranchPerformanceBarProps) {
  const chartData = React.useMemo(() => {
    return branches.map((b: any) => ({
      name: b.name,
      sales: b.sales,
      avgSentiment: (sentiment.find((s: any) => s.branchId === b.id && s.sentimentLabel === 'POSITIVE')?._avg.sentimentScore || 0).toFixed(2),
    }));
  }, [branches, sentiment]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold text-[#0047ab] mb-4">Top Branches by Sales & Sentiment</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="sales" fill="#60a5fa" />
            <Bar dataKey="avgSentiment" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
