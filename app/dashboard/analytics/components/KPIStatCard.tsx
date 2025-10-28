import React from 'react';
import { motion } from 'framer-motion';

interface KPIStatCardProps {
  label: string;
  value: string | number;
  icon?: 'plan' | 'revenue' | 'subscription' | 'user' | 'mrr';
}

const icons: Record<string, React.ReactNode> = {
  plan: <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /></svg>,
  revenue: <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" stroke="currentColor" strokeWidth="2" /></svg>,
  subscription: <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24"><path d="M12 4v16" stroke="currentColor" strokeWidth="2" /></svg>,
  user: <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" /><path d="M4 20c0-4 8-4 8-4s8 0 8 4" stroke="currentColor" strokeWidth="2" /></svg>,
  mrr: <svg className="w-8 h-8 text-pink-500" fill="none" viewBox="0 0 24 24"><path d="M4 12h16" stroke="currentColor" strokeWidth="2" /></svg>,
};

export default function KPIStatCard({ label, value, icon }: KPIStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center"
    >
      <div className="mb-2">{icon ? icons[icon] : null}</div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500 font-medium">{label}</div>
    </motion.div>
  );
}
