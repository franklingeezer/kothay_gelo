import { useExpenses } from './hooks/useExpenses';
import ExpenseForm from './components/QuickAdd/ExpenseForm';
import { Wallet, Settings, Plus, X, LayoutGrid, Trash2, Search } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import React, { useState } from 'react';

export default function App() {
  const { 
    expenses, remaining, budget, setBudget, progress, insight, 
    dailySuggestion, spentToday, trendData, heatmapData,
    addExpense, deleteExpense, recurring, setRecurring, totalRecurring,
    manualLimit, setManualLimit,
    categoryData
  } = useExpenses();

  const [activeTab, setActiveTab] = useState('home');
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  
  const [theme, setTheme] = useState(() => localStorage.getItem('takatrack_theme') || 'light');
  const [name, setName] = useState(() => localStorage.getItem('takatrack_name') || 'User');

  const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7'];
  const totalCategory = categoryData.reduce((sum, c) => sum + c.value, 0);
  const topCategory = categoryData.reduce((max, c) => (c.value > (max?.value || 0) ? c : max), null);

  const renderCustomLabel = ({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`;
  const filteredExpenses = expenses.filter(item =>
  item.category.toLowerCase().includes(search.toLowerCase()) ||
  item.method.toLowerCase().includes(search.toLowerCase()) ||
  (item.note || '').toLowerCase().includes(search.toLowerCase())
);

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-slate-900 pb-32 font-sans">
      <div className="max-w-md mx-auto">

        {/* ================= HOME TAB ================= */}
        {activeTab === 'home' && (
          <div className="p-6 space-y-6 animate-in fade-in duration-500">
            {/* NEW BRANDED LOGO HEADER */}
            <header className="flex justify-between items-start text-left mb-2">
              <div className="group">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 -rotate-6 group-hover:rotate-0 transition-all duration-300">
                    <span className="text-white font-black text-xl italic">?</span>
                  </div>
                  <div>
                    <h1 className="font-black text-2xl tracking-tighter text-slate-900">
                      Kothay<span className="text-indigo-600 italic ml-1">Gelo?</span>
                    </h1>
                    <div className="h-1 w-full bg-indigo-100 rounded-full mt-[-4px]" />
                  </div>
                </div>
              </div>
              <div className="bg-white px-3 py-1 rounded-full border border-slate-100 text-[9px] font-black text-slate-400 shadow-sm">
                LIVE TRACKER
              </div>
            </header>

            {/* MAIN BALANCE CARD */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl group-hover:bg-indigo-600/40 transition-all" />
              
              <p className="text-[10px] font-black uppercase opacity-50 tracking-[0.2em] mb-1">Monthly Remaining</p>
              <h2 className="text-4xl font-bold italic tracking-tight">
                ৳{remaining.toLocaleString()}
              </h2>

              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase opacity-60">
                  <span>Usage Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${progress > 90 ? 'bg-rose-500' : 'bg-indigo-400'}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase opacity-40">Spent Today</p>
                  <p className="text-lg font-bold">৳{spentToday}</p>
                </div>
                <div className="text-left border-l border-white/5 pl-4">
                  <p className="text-[10px] font-black uppercase opacity-40">Daily Limit</p>
                  <p className="text-lg font-bold">৳{dailySuggestion}</p>
                </div>
              </div>
            </div>

            {/* DETECTIVE INSIGHT BUBBLE */}
            <div className="bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-[2rem] p-5 text-left relative group">
              <div className="absolute -top-3 left-6 bg-indigo-600 text-[8px] font-black text-white px-2 py-0.5 rounded uppercase tracking-widest">
                The Evidence
              </div>
              <p className="text-sm font-bold text-indigo-900 italic leading-relaxed">
                "{insight}"
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white p-3 rounded-2xl">
              <Search size={16} className="text-slate-400"/>
              <input
                value={search}
                onChange={(e)=>setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full outline-none text-sm"
              />
            </div>

            {/* RECENT ACTIVITY */}
            <div className="text-left">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-sm uppercase tracking-widest text-slate-400">Recent Leaks</h3>
                <span className="text-[10px] font-bold text-indigo-600">View All</span>
              </div>

              <div className="space-y-3">
                {expenses.length === 0 ? (
                  <div className="py-10 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                    <p className="text-xs text-slate-400 italic">No evidence found yet...</p>
                  </div>
                ) : (
                  filteredExpenses.slice(0, 5).map(item => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setEditingItem(item);
                        setShowAdd(true);
                      }}
                      className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border border-slate-50 hover:border-indigo-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-lg">
                          {item.category === 'Food' ? '🍔' : item.category === 'Shopping' ? '🛍️' : '💸'}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-800">{item.category}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">
                            {item.method} • {item.date}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <p className="font-black text-slate-900 tracking-tighter text-right">
                          ৳{item.amount}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= STATS TAB ================= */}
        {activeTab === 'stats' && (
          <div className="p-6 space-y-6 text-left animate-in slide-in-from-right-4">
            <h1 className="font-black text-2xl uppercase tracking-tighter">Analytics</h1>

            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-6">
                 <div className="w-2 h-6 bg-indigo-600 rounded-full" />
                 <h3 className="font-bold text-sm">Where it's going</h3>
              </div>

              {categoryData.length === 0 ? (
                <p className="text-sm text-slate-400 italic py-10 text-center">No transactions to analyze.</p>
              ) : (
                <>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="value"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          label={false}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4 mt-4">
                    {categoryData.map((c, i) => {
                      const percent = totalCategory ? ((c.value / totalCategory) * 100).toFixed(0) : 0;
                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-black uppercase">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                              <span className="text-slate-400">{c.name}</span>
                            </div>
                            <span className="text-slate-900">৳{c.value} ({percent}%)</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* HEATMAP */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="font-bold text-sm mb-4">Consistency (14 Days)</h3>
              <div className="grid grid-cols-7 gap-2">
                {heatmapData.map((d, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-lg transition-all ${
                      d.status === 'under' ? 'bg-emerald-400 shadow-lg shadow-emerald-100' : 
                      d.status === 'over' ? 'bg-rose-400 shadow-lg shadow-rose-100' : 
                      'bg-slate-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= SETTINGS TAB ================= */}
        {activeTab === 'settings' && (
          <div className="p-6 space-y-6 text-left animate-in slide-in-from-right-4">
            <h1 className="font-black text-2xl uppercase tracking-tighter">Settings</h1>

            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Monthly Budget</p>
                <div className="flex items-center gap-2 bg-slate-50 p-4 rounded-2xl">
                  <span className="font-black text-indigo-600">৳</span>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="bg-transparent w-full text-lg font-black outline-none"
                  />
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Manual Daily Limit</p>
                <div className="flex items-center gap-2 bg-slate-50 p-4 rounded-2xl">
                  <span className="font-black text-indigo-600">৳</span>
                  <input
                    type="number"
                    value={manualLimit}
                    onChange={(e) => setManualLimit(Number(e.target.value))}
                    placeholder="Auto"
                    className="bg-transparent w-full text-lg font-black outline-none placeholder:text-slate-200"
                  />
                </div>
                <p className="text-[9px] font-bold text-indigo-400 mt-2 italic">* Suggested: ৳{dailySuggestion}</p>
              </div>
            </div>

            {/* RECURRING BILLS */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-sm">Fixed Bills (৳{totalRecurring})</h3>
                 <button
                    onClick={() => {
                      const name = prompt("Bill name?");
                      const amount = prompt("Amount?");
                      if (name && amount) setRecurring(prev => [...prev, { id: Date.now(), name, amount: Number(amount) }]);
                    }}
                    className="text-[10px] font-black bg-indigo-600 text-white px-3 py-1 rounded-full"
                  >
                    + ADD
                  </button>
              </div>

              <div className="space-y-2">
                {recurring.length === 0 ? (
                  <p className="text-xs text-slate-300 italic">No recurring bills added.</p>
                ) : (
                  recurring.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                      <span className="text-sm font-bold text-slate-700">{item.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black italic">৳{item.amount}</span>
                        <button onClick={() => setRecurring(prev => prev.filter(r => r.id !== item.id))} className="text-rose-400">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= NAVBAR ================= */}
        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-xl p-2 rounded-full shadow-2xl z-50 flex items-center gap-2">
          <button 
            onClick={() => setActiveTab('home')} 
            className={`p-4 rounded-full transition-all ${activeTab === 'home' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}
          >
            <Wallet size={20} />
          </button>
          
          <button onClick={() => setShowAdd(true)} className="bg-white p-4 rounded-full text-slate-900 shadow-xl active:scale-90 transition-transform">
            <Plus size={24} />
          </button>

          <button 
            onClick={() => setActiveTab('stats')} 
            className={`p-4 rounded-full transition-all ${activeTab === 'stats' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}
          >
            <LayoutGrid size={20} />
          </button>

          <button 
            onClick={() => setActiveTab('settings')} 
            className={`p-4 rounded-full transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}
          >
            <Settings size={20} />
          </button>
        </nav>

        {/* MODAL */}
        {showAdd && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 relative shadow-2xl">
              <button onClick={() => setShowAdd(false)} className="absolute right-8 top-8 text-slate-300 hover:text-rose-500 transition-colors">
                <X size={24}/>
              </button>
              <h2 className="text-xl font-black uppercase mb-8 text-center text-slate-800">Log a Leak</h2>
              <ExpenseForm
                editItem={editingItem}
                onAdd={(a, c, m, n) => {
                  if (editingItem) {
                    deleteExpense(editingItem.id);
                  }
                  addExpense(a, c, m, n);
                  setEditingItem(null);
                  setShowAdd(false);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}