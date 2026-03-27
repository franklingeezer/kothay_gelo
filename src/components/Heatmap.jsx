import React from 'react';

export default function Heatmap({ data }) {
  return (
    <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-sm text-left">Consistency Tracker</h3>
        <div className="flex gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="w-2 h-2 rounded-full bg-rose-400" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {data.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div 
              className={`w-full aspect-square rounded-lg transition-all duration-500 ${
                day.status === 'under' ? 'bg-emerald-400 shadow-sm shadow-emerald-100' : 
                day.status === 'over' ? 'bg-rose-400 shadow-sm shadow-rose-100' : 
                'bg-slate-100'
              }`}
            />
            <span className="text-[7px] font-black text-slate-300 uppercase">
              {day.date.split('/')[0]}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-400 mt-4 italic">
        Aim for a full row of green! 🌿
      </p>
    </div>
  );
}