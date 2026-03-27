import React from 'react';

const StatCard = ({ label, amount, color }) => (
  <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 flex flex-col gap-1">
    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">{label}</span>
    <span className={`text-2xl font-mono font-bold ${color}`}>
      ৳{amount.toLocaleString()}
    </span>
  </div>
);

export default StatCard;
    