import { useExpenses } from './hooks/useExpenses';
import ExpenseForm from './components/QuickAdd/ExpenseForm';
import { Wallet, Settings, Plus, X, LayoutGrid, Search, Smartphone, Users, Ghost, ShieldCheck, Zap, Target, BarChart3, TrendingUp, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import React, { useState, useMemo } from 'react';

const Logo = () => (
  <div className="relative group cursor-pointer text-left">
    <svg width="42" height="42" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm group-hover:-rotate-12 transition-all duration-500">
      <circle cx="50" cy="50" r="48" fill="white" stroke="#6366f1" strokeWidth="1"/>
      <path d="M30 55L75 35L60 65L53 58L30 55Z" fill="#6366f1" />
      <path d="M53 58L55 75L60 65L53 58Z" fill="#4f46e5" />
      <path d="M20 65C25 65 30 62 35 58" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" className="animate-pulse" />
    </svg>
  </div>
);

const SettingCard = ({ label, value, onChange, prefix, suggestion, icon: Icon, color }) => (
  <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 mb-4 transition-all active:scale-[0.98]">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-xl bg-opacity-10`} style={{ backgroundColor: color + '1A', color: color }}>
        <Icon size={18} />
      </div>
      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{label}</p>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-xl font-black text-indigo-600">{prefix}</span>
      <input 
        type="number" 
        value={value || ''} 
        onChange={(e) => onChange(Number(e.target.value))}
        className="bg-transparent w-full text-3xl font-bold text-slate-900 outline-none placeholder:text-slate-200 tracking-tight"
        placeholder="0.00"
      />
    </div>
    {suggestion && (
      <p className="text-[9px] font-bold text-slate-400 mt-4 italic text-left">
        * System suggests: <span className="text-indigo-500">৳{suggestion}</span>
      </p>
    )}
  </div>
);

export default function App() {
  const { 
    expenses = [], remaining = 0, budget = 0, setBudget, progress = 0, 
    insight = "", dailySuggestion = 0, spentToday = 0, addExpense, 
    deleteExpense, manualLimit = 0, setManualLimit, categoryData = [],
    cashSpentToday = 0, digitalSpentToday = 0, 
    topCategory, 
    loanStats = { lent: 0, debt: 0 }
  } = useExpenses();

  

  const [activeTab, setActiveTab] = useState('home');
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  
  const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7'];

  // --- DYNAMIC ROAST LOGIC ---
  const getFunnyInsight = () => {
    const currentLimit = manualLimit > 0 ? manualLimit : dailySuggestion;
    const remainingToday = currentLimit - spentToday;
    const isOverspent = remainingToday < 0;

    if (spentToday === 0) return "Ajke ek taka-o khoroch koro nai? Tumi ki manush naki feresta?";
    if (isOverspent) return `Limit-er baire ৳${Math.abs(remainingToday)} gechho. Bashay janle kintu "Haddi-Guddi" ek kore dibe!`;
    if (topCategory?.name === 'Transport' && spentToday > 200) return "Khali rikshaw diye ghuro, duipaye hatta ki bhule geso?";
    if (progress > 85) return "Budget-er obostha bhalo na. Masher seshe ki nonta biscuit kheye thakba?";
    if (topCategory?.name === 'Food') return "Khaite khaite shesh hoye gela! Shari-din ki khali pet-er chinta?";
    if (loanStats.lent > 1000) return "Tumi ki NGO khulso? Manush-re taka dhar deya bondho koro!";
    return insight || "Budget ekhono control-e ache. Shabas, beta!";
  };

  const getEmoji = (category, note) => {
    const cat = category?.toLowerCase() || "";
    const n = note?.toLowerCase() || "";
    if (n.includes('biscuit')) return '🍪';
    if (n.includes('cha') || n.includes('tea')) return '☕';
    if (cat === 'food') return '🍔';
    if (cat === 'transport') return '🚌';
    if (cat === 'shopping') return '🛍️';
    if (cat === 'bills') return '🧾';
    if (cat === 'loan') return '🤝';
    if (cat === 'health' || cat === 'medical') return '💊';
    if (cat === 'other') return '🧐';
    return <Ghost size={18} className="text-slate-400"/>;
  };

  const groupedExpenses = useMemo(() => {
    const groups = {};
    const filtered = (expenses || []).filter(item =>
      (item.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.note || "").toLowerCase().includes(search.toLowerCase())
    );

    filtered.forEach(item => {
      const dateKey = item.date || new Date().toLocaleDateString();
      if (!groups[dateKey]) groups[dateKey] = { items: [], total: 0 };
      groups[dateKey].items.push(item);
      groups[dateKey].total += item.amount;
    });

    return Object.entries(groups).sort((a, b) => new Date(b[0]) - new Date(a[0]));
  }, [expenses, search]);

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-slate-900 pb-32 font-sans selection:bg-indigo-100">
      <div className="max-w-md mx-auto">

        {activeTab === 'home' && (
          <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <header className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-3">
                <Logo />
                <h1 className="font-black text-2xl tracking-tighter text-slate-900 leading-none">
                  Kothay<span className="text-indigo-600 italic">Gelo?</span>
                </h1>
              </div>
              <div className="bg-white px-3 py-1 rounded-full border border-slate-100 text-[9px] font-black text-slate-400 shadow-sm tracking-widest uppercase">
                Live Tracker
              </div>
            </header>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group text-left">
              <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl" />
              <p className="text-[10px] font-black uppercase opacity-50 tracking-[0.2em] mb-1">Monthly Remaining</p>
              <h2 className="text-4xl font-bold italic tracking-tight">৳{(remaining || 0).toLocaleString()}</h2>

              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase opacity-60">
                  <span>Usage Progress</span>
                  <span>{Math.round(progress || 0)}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-400 transition-all duration-1000" style={{ width: `${Math.min(progress || 0, 100)}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
                <div>
                  <p className="text-[10px] font-black uppercase opacity-40">Spent Today</p>
                  <p className="text-lg font-bold">৳{spentToday || 0}</p>
                </div>
                <div className="border-l border-white/5 pl-4">
                  <p className="text-[10px] font-black uppercase opacity-40">Daily Limit</p>
                  <p className="text-lg font-bold">৳{manualLimit > 0 ? manualLimit : dailySuggestion}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-[2rem] bg-emerald-50 border border-emerald-100 text-left shadow-sm">
                  <p className="text-[9px] font-black text-emerald-600 uppercase mb-1">Monthly Cash</p>
                  <p className="text-xl font-bold text-emerald-900">৳{cashSpentToday || 0}</p>
              </div>
              <div className="p-5 rounded-[2rem] bg-indigo-50 border border-indigo-100 text-left shadow-sm">
                  <p className="text-[9px] font-black text-indigo-600 uppercase mb-1">Monthly Digital</p>
                  <p className="text-xl font-bold text-indigo-900">৳{digitalSpentToday || 0}</p>
              </div>
            </div>

            {/* --- UPDATED EVIDENCE BOX --- */}
              <div className="bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-[2rem] p-5 text-left relative group">
                <div className="absolute -top-3 left-6 bg-indigo-600 text-[8px] font-black text-white px-2 py-0.5 rounded uppercase tracking-widest italic">
                  Ammu's Warning
                </div>
                {/* CHANGE THIS LINE BELOW */}
                <p className={`text-sm font-bold italic leading-relaxed ${ (manualLimit > 0 ? manualLimit : dailySuggestion) - spentToday < 0 ? 'text-rose-600' : 'text-indigo-900'}`}>
                  "{insight}" 
                </p>
              </div>

            <div className="flex items-center gap-2 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
              <Search size={16} className="text-slate-400"/>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search for clues..." className="w-full outline-none text-sm font-medium bg-transparent" />
            </div>

            <div className="text-left pb-10 space-y-8">
              {groupedExpenses.map(([date, group]) => (
                <div key={date} className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">
                      {date === new Date().toLocaleDateString() ? "Today" : date}
                    </h3>
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      Total: ৳{group.total}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {group.items.map(item => (
                      <div key={item.id} onClick={() => { setEditingItem(item); setShowAdd(true); }} className="p-4 bg-white rounded-3xl flex justify-between items-center shadow-sm border border-slate-50 cursor-pointer hover:border-indigo-100 transition-all active:scale-[0.98]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-lg">
                            {getEmoji(item.category, item.note)}
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-sm text-slate-800 line-clamp-1">{item.note || item.category}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter">{item.category}</p>
                              {item.isLoan && (
                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${item.loanType === 'lent' ? 'bg-indigo-100 text-indigo-600' : 'bg-rose-100 text-rose-600'}`}>
                                  {item.loanType === 'lent' ? 'Lent' : 'Borrowed'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="font-black text-slate-900">৳{item.amount}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="p-6 space-y-6 text-left animate-in slide-in-from-right-4 duration-500">
            <h1 className="font-black text-3xl uppercase tracking-tighter italic">Analysis<span className="text-indigo-600">.</span></h1>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                <Users size={32} className="absolute -right-2 -bottom-2 opacity-5 text-indigo-600" />
                <p className="text-[9px] font-black text-indigo-600 uppercase mb-1">People Owe You</p>
                <p className="text-2xl font-black text-slate-900 italic">৳{loanStats.lent.toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                <Smartphone size={32} className="absolute -right-2 -bottom-2 opacity-5 text-rose-600" />
                <p className="text-[9px] font-black text-rose-600 uppercase mb-1">You Owe People</p>
                <p className="text-2xl font-black text-slate-900 italic">৳{loanStats.debt.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>
                <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Category Breakdown</h3>
              </div>

              {categoryData?.length === 0 ? (
                <div className="py-20 text-center text-slate-300 italic">No evidence to analyze.</div>
              ) : (
                <>
                  <div className="h-64 w-full mb-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryData} dataKey="value" innerRadius={70} outerRadius={90} paddingAngle={8}>
                          {categoryData.map((entry, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} cornerRadius={12} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4">
                    {categoryData.map((c, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-xs font-bold text-slate-600">{c.name}</span>
                        </div>
                        <span className="text-xs font-black">৳{c.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-50">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                      <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase opacity-50 tracking-widest mb-3">Monthly Intelligence</p>
                        {topCategory && (
                          <p className="text-base font-bold leading-relaxed mb-6">
                            The primary leak is <span className="text-indigo-400 italic underline decoration-indigo-400/30">{topCategory.name}</span>, accounting for ৳{topCategory.value} of your total drainage.
                          </p>
                        )}
                        <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/10">
                          <div>
                            <p className="text-[10px] font-black uppercase opacity-40 mb-1">Cash Heavy</p>
                            <p className="text-xl font-black">{Math.round((cashSpentToday / (cashSpentToday + digitalSpentToday)) * 100) || 0}%</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase opacity-40 mb-1">Digital Flow</p>
                            <p className="text-xl font-black">{Math.round((digitalSpentToday / (cashSpentToday + digitalSpentToday)) * 100) || 0}%</p>
                          </div>
                        </div>
                      </div>
                      <ShieldCheck size={100} className="absolute -right-6 -bottom-6 opacity-10 text-white rotate-12" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-6 space-y-6 animate-in slide-in-from-bottom-10 duration-500 text-left">
            <header className="flex justify-between items-center mb-6">
                <h1 className="font-black text-3xl uppercase tracking-tighter italic text-slate-900">Settings<span className="text-indigo-600">.</span></h1>
                <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm text-indigo-600"><ShieldCheck size={20} /></div>
            </header>

            <SettingCard label="Monthly Budget" value={budget} onChange={setBudget} prefix="৳" icon={Target} color="#6366f1" />
            <SettingCard label="Daily Spending Limit" value={manualLimit} onChange={setManualLimit} prefix="৳" suggestion={dailySuggestion} icon={Zap} color="#f59e0b" />

            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl flex items-center justify-between group cursor-pointer overflow-hidden relative">
               <div className="absolute right-[-20px] bottom-[-20px] opacity-10 rotate-12 group-hover:rotate-0 transition-transform"><LayoutGrid size={120} /></div>
               <div className="relative">
                 <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1">Today's Remaining</p>
                 <h3 className="text-3xl font-black">৳{Math.max(0, (manualLimit || dailySuggestion) - spentToday)}</h3>
               </div>
               <ChevronRight size={24} className="opacity-40" />
            </div>
          </div>
        )}

        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-xl p-2 rounded-full shadow-2xl z-50 flex items-center gap-2">
          <button onClick={() => setActiveTab('home')} className={`p-4 rounded-full transition-all ${activeTab === 'home' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}><Wallet size={20} /></button>
          <button onClick={() => { setEditingItem(null); setShowAdd(true); }} className="bg-white p-4 rounded-full text-slate-900 shadow-xl active:scale-90 transition-all"><Plus size={24} /></button>
          <button onClick={() => setActiveTab('stats')} className={`p-4 rounded-full transition-all ${activeTab === 'stats' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}><LayoutGrid size={20} /></button>
          <button onClick={() => setActiveTab('settings')} className={`p-4 rounded-full transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}><Settings size={20} /></button>
        </nav>

        {showAdd && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-end sm:items-center justify-center animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-t-[3rem] sm:rounded-[3rem] p-8 relative shadow-2xl animate-in slide-in-from-bottom-10">
              <button onClick={() => { setShowAdd(false); setEditingItem(null); }} className="absolute right-8 top-8 text-slate-300 hover:text-indigo-600 transition-colors"><X size={24}/></button>
              <h2 className="text-xl font-black uppercase mb-8 text-left text-slate-800 tracking-tighter italic">{editingItem ? "Update Clue" : "Log a Leak"}</h2>
              <ExpenseForm
                editItem={editingItem}
                onAdd={(a, c, m, n, isLoan, loanType) => {
                  if (editingItem) deleteExpense(editingItem.id);
                  addExpense(a, c, m, n, isLoan, loanType);
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