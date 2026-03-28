// src/components/Navbar.jsx
import React from "react";
import { Bell, Search } from "lucide-react";

export default function Navbar({ userName = "Detective" }) {
  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 bg-transparent">
      
      {/* Left - Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 rotate-3 hover:rotate-0 transition-transform duration-300">
            <span className="text-white font-black text-xl italic">?</span>
          </div>
          {/* Status Indicator Dot */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#F8F9FD] rounded-full"></div>
        </div>

        <div className="flex flex-col items-start">
          <h1 className="font-black text-xl tracking-tighter leading-none text-slate-900">
            Kothay<span className="text-indigo-600 italic">Gelo</span>
          </h1>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
            {userName}'s Ledger
          </p>
        </div>
      </div>

      {/* Right - Quick Actions */}
      <div className="flex items-center gap-2">
        {/* Search Trigger - Great for mobile reach */}
        <button className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm active:scale-90">
          <Search size={18} strokeWidth={2.5} />
        </button>
        
        {/* Notification/Alert Trigger */}
        <button className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm active:scale-90 relative">
          <Bell size={18} strokeWidth={2.5} />
          {/* Badge for overdue loans or budget alerts */}
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
        </button>
      </div>

    </nav>
  );
}