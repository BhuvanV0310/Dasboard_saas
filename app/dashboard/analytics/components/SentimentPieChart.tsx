import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface SentimentPieChartProps {
  data: any[];
}

const COLORS = ['#22c55e', '#ef4444', '#94a3b8'];

export default function SentimentPieChart({ data }: SentimentPieChartProps) {
  const chartData = React.useMemo(() => {
    return [
      { name: 'Positive', value: data.find((d: any) => d.sentimentLabel === 'POSITIVE')?._count.id || 0 },
      { name: 'Negative', value: data.find((d: any) => d.sentimentLabel === 'NEGATIVE')?._count.id || 0 },
      { name: 'Neutral', value: data.find((d: any) => d.sentimentLabel === 'NEUTRAL')?._count.id || 0 },
    ];
  }, [data]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold text-[#0047ab] mb-4">Sentiment Overview</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={90} label>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
