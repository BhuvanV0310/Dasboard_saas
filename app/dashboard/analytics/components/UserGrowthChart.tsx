import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

interface UserGrowthChartProps {
  data: any[];
}

export default function UserGrowthChart({ data }: UserGrowthChartProps) {
  const chartData = React.useMemo(() => {
    return data.map((d: any) => ({ name: d.role, value: d._count.id }));
  }, [data]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold text-[#0047ab] mb-4">User Role Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
