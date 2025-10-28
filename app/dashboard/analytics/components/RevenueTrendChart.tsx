import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

interface RevenueTrendChartProps {
  data: any[];
  type?: 'revenue' | 'payments';
}

export default function RevenueTrendChart({ data, type = 'revenue' }: RevenueTrendChartProps) {
  // Transform data for chart
  const chartData = React.useMemo(() => {
    if (type === 'payments') {
      return data.map((d: any) => ({ name: d.status, value: d._count.id }));
    }
    return data.map((d: any) => ({ name: d.createdAt?.slice(0, 10) || '', value: d._count.id }));
  }, [data, type]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold text-[#0047ab] mb-4">{type === 'payments' ? 'Payments Overview' : 'Revenue Trend'}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
