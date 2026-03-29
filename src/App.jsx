import { useExpenses } from './hooks/useExpenses';
import ExpenseForm from './components/QuickAdd/ExpenseForm';
import { 
  Wallet, Settings, Plus, X, LayoutGrid, Search, 
  Ghost, Zap, Target, TrendingUp, 
  Rocket, CheckCircle2, Calendar, ArrowDownLeft, ArrowUpRight,
  Download, Clock, History as HistoryIcon
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import React, { useState, useMemo } from 'react';

const THEME = {
  primary: "#6366f1", 
  secondary: "#0f172a", 
  accent: "#f59e0b",
  danger: "#f43f5e",
  success: "#10b981",
  glass: "bg-white/80 backdrop-blur-md border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.03)]",
  heading: "font-black uppercase tracking-[0.15em] text-slate-900"
};

const Logo = () => (
  <div className="relative group cursor-pointer text-left">
    <svg width="42" height="42" viewBox="0 0 100 100" fill="none" className="drop-shadow-sm group-hover:-rotate-12 transition-all duration-500">
      <circle cx="50" cy="50" r="48" fill="white" stroke={THEME.primary} strokeWidth="1"/>
      <path d="M30 55L75 35L60 65L53 58L30 55Z" fill={THEME.primary} />
      <path d="M53 58L55 75L60 65L53 58Z" fill="#4f46e5" />
      <path d="M20 65C25 65 30 62 35 58" stroke={THEME.primary} strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" className="animate-pulse" />
    </svg>
  </div>
);

const SettingCard = ({ label, value, onChange, prefix, suggestion, icon: Icon, color }) => (
  <div className={`rounded-[2.5rem] p-8 mb-4 transition-all active:scale-[0.98] ${THEME.glass}`}>
    <div className="flex justify-between items-start mb-6 text-left">
      <div className={`p-3 rounded-2xl`} style={{ backgroundColor: color + '1A', color: color }}>
        <Icon size={20} />
      </div>
      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{label}</p>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-xl font-black text-indigo-600">{prefix}</span>
      <input 
        type="number" 
        value={value || ''} 
        onChange={(e) => onChange(Number(e.target.value))}
        className="bg-transparent w-full text-4xl font-bold text-slate-900 outline-none placeholder:text-slate-100 tracking-tighter"
        placeholder="0"
      />
    </div>
    {suggestion && (
      <p className="text-[10px] font-bold text-slate-400 mt-6 italic text-left">
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
    loanStats = { lent: 0, debt: 0 },
    addGoal, goalProgress,
    settleLoan 
  } = useExpenses();

  const [activeTab, setActiveTab] = useState('home');
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [goalTitle, setGoalTitle] = useState('Laptop');
  const [goalTarget, setGoalTarget] = useState(60000);

  const COLORS = [THEME.primary, '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7'];
  const dailyLimit = manualLimit > 0 ? manualLimit : dailySuggestion;
  const isOverLimit = spentToday > dailyLimit;

  const { todayItems, historyGroups } = useMemo(() => {
    const todayStr = new Date().toLocaleDateString();
    const filtered = (expenses || []).filter(item =>
      (item.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.note || "").toLowerCase().includes(search.toLowerCase())
    );
    const today = filtered.filter(item => item.date === todayStr);
    const history = filtered.filter(item => item.date !== todayStr);
    const groups = {};
    history.forEach(item => {
      const dateKey = item.date || "Past Records";
      if (!groups[dateKey]) groups[dateKey] = { items: [], total: 0 };
      groups[dateKey].items.push(item);
      groups[dateKey].total += item.amount;
    });
    return { 
      todayItems: today, 
      historyGroups: Object.entries(groups).sort((a, b) => new Date(b[0]) - new Date(a[0])) 
    };
  }, [expenses, search]);

  const exportToCSV = () => {
    const headers = ["Date", "Time", "Category", "Note", "Amount", "Type"];
    const rows = expenses.map(item => [
      item.date, item.time || 'N/A', item.category, item.note || '-', item.amount, item.isLoan ? 'Loan' : 'Expense'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `KothayGelo_Statement.csv`);
    link.click();
  };

  const getEmoji = (category, note) => {
  const cat = category?.toLowerCase() || "";
  const n = note?.toLowerCase() || "";

  // Priority 1: Specific Keywords in Notes
  if (n.includes('tea') || n.includes('cha')) return '☕';
  if (n.includes('medicine') || n.includes('doctor') || n.includes('hospital')) return '🏥';
  if (n.includes('rent') || n.includes('electricity') || n.includes('wifi')) return '⚡';

  // Priority 2: Category Matches
  if (cat === 'settled') return '✅';
  if (cat === 'food') return '🍔';
  if (cat === 'transport') return '🚌';
  if (cat === 'loan') return '🤝';
  if (cat === 'shopping') return '🛍️';
  if (cat === 'health') return '💊'; // New Health Emoji
  if (cat === 'bills') return '🧾'; // New Bills Emoji
  if (cat === 'education') return '📚'; // New Education Emoji
  if (cat === 'entertainment') return '🎬'; // New Fun Emoji

  // Default Fallback
  return <Ghost size={18} className="text-slate-300"/>;
};

  const renderExpenseItem = (item) => (
    <div key={item.id} onClick={() => { setEditingItem(item); setShowAdd(true); }} className={`p-5 rounded-[2.2rem] flex justify-between items-center transition-all active:scale-[0.97] cursor-pointer ${THEME.glass} mb-3`}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl">{getEmoji(item.category, item.note)}</div>
        <div className="text-left">
          <p className="font-bold text-sm text-slate-800 leading-tight">{item.note || item.category}</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[9px] text-slate-400 font-black tracking-widest uppercase">{item.category}</p>
            {item.time && <span className="text-[9px] text-indigo-400 font-bold flex items-center gap-0.5"><Clock size={8}/> {item.time}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <p className={`font-black text-base ${item.amount > 500 ? 'text-rose-500' : 'text-slate-900'}`}>৳{item.amount}</p>
        {item.isLoan && !item.isSettled && (
          <button onClick={(e) => { e.stopPropagation(); settleLoan(item.id); }} className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-100"><CheckCircle2 size={14} /></button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FBFBFE] text-slate-900 pb-40 font-sans">
      <div className="max-w-md mx-auto px-7 pt-10">
        
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <Logo />
            <h1 className="font-black text-2xl tracking-tighter text-slate-900 leading-none">Kothay<span className="text-indigo-600">Gelo</span></h1>
          </div>
          <div className="bg-white px-4 py-1.5 rounded-full border border-slate-100 text-[9px] font-black text-slate-400 tracking-widest uppercase shadow-sm">2026 LIVE</div>
        </header>

        {activeTab === 'home' && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden text-left shadow-indigo-100">
              <p className="text-[11px] font-black uppercase opacity-40 tracking-[0.2em] mb-3">Remaining Balance</p>
              <h2 className="text-5xl font-bold tracking-tighter italic">৳{(remaining || 0).toLocaleString()}</h2>
              <div className="mt-10 space-y-4">
                <div className="flex justify-between text-[11px] font-black uppercase"><span className="opacity-50">Budget Used</span><span className="text-indigo-400">{Math.round(progress)}%</span></div>
                <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5 text-left">
              <div className={`p-7 rounded-[2.5rem] ${THEME.glass}`}>
                <div className="flex items-center gap-2 mb-2"><ArrowDownLeft size={14} className="text-rose-500" /><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Spent Today</p></div>
                <p className={`text-2xl font-black ${isOverLimit ? 'text-rose-500' : 'text-slate-800'}`}>৳{spentToday}</p>
              </div>
              <div className={`p-7 rounded-[2.5rem] ${THEME.glass}`}>
                <div className="flex items-center gap-2 mb-2"><ArrowUpRight size={14} className="text-emerald-500" /><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daily Limit</p></div>
                <p className="text-2xl font-black text-slate-800">৳{dailyLimit}</p>
              </div>
            </div>

            <div className="p-7 rounded-[2.5rem] border-2 border-dashed border-indigo-100 bg-indigo-50/30 text-left">
               <p className="text-sm font-bold italic text-indigo-800 font-semibold/70">"{insight}"</p>
            </div>

            <div className="space-y-4">
              <h3 className={`${THEME.heading} text-[10px] flex items-center gap-2 text-left mb-6`}><Calendar size={14} className="text-indigo-600" /> Today's Entries</h3>
              {todayItems.length > 0 ? todayItems.map(renderExpenseItem) : <p className="py-10 text-center text-xs font-bold text-slate-300 italic">No leaks today yet.</p>}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 text-left">
            <div className="flex justify-between items-end mb-4">
                <h1 className={`${THEME.heading} text-3xl tracking-tighter`}>History.</h1>
                <button onClick={exportToCSV} className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-colors shadow-sm"><Download size={20}/></button>
            </div>
            
            <div className="flex items-center gap-4 bg-white p-5 px-8 rounded-full border border-slate-100 shadow-sm focus-within:border-indigo-100 transition-all">
              <Search size={18} className="text-slate-300"/>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search for past leaks..." className="w-full outline-none text-sm font-bold bg-transparent placeholder:text-slate-200" />
            </div>

            <div className="space-y-10">
              {historyGroups.length > 0 ? historyGroups.map(([date, group]) => (
                <div key={date} className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">{date}</p>
                    <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest">৳{group.total} Total</p>
                  </div>
                  {group.items.map(renderExpenseItem)}
                </div>
              )) : <p className="py-20 text-center text-slate-300 font-bold italic text-sm">The paper trail is clean.</p>}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-10 animate-in slide-in-from-right-8 duration-500 text-left">
            <h1 className={`${THEME.heading} text-3xl tracking-tighter`}>Analysis.</h1>
            {goalProgress && (
              <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group shadow-indigo-100">
                <Rocket size={100} className="absolute -right-6 -bottom-6 opacity-10 -rotate-12 group-hover:rotate-0 transition-all duration-700" />
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Target: {goalProgress.title}</p>
                <h3 className="text-4xl font-black italic mb-8">৳{goalProgress.target.toLocaleString()}</h3>
                <div className="h-2.5 bg-white/10 rounded-full overflow-hidden mb-8"><div className="h-full bg-indigo-500 transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ width: `${goalProgress.percent}%` }} /></div>
                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                  <div><p className="text-[10px] font-black uppercase opacity-40">Saved</p><p className="text-xl font-bold">৳{goalProgress.currentSaved.toLocaleString()}</p></div>
                  <div><p className="text-[10px] font-black uppercase opacity-40">Needed/mo</p><p className="text-xl font-bold">৳{goalProgress.monthlyRequired.toLocaleString()}</p></div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-5">
              <div className={`p-8 rounded-[2.5rem] ${THEME.glass}`}>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Lent Out</p>
                <p className="text-2xl font-black text-slate-800">৳{loanStats.lent.toLocaleString()}</p>
              </div>
              <div className={`p-8 rounded-[2.5rem] ${THEME.glass}`}>
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Total Debt</p>
                <p className="text-2xl font-black text-slate-800">৳{loanStats.debt.toLocaleString()}</p>
              </div>
            </div>
            <div className={`p-10 rounded-[3rem] ${THEME.glass}`}>
              <div className="flex items-center gap-3 mb-10"><TrendingUp size={22} className="text-indigo-600" /><h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Spending Mix</h3></div>
              <div className="h-64 w-full mb-10">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={categoryData} dataKey="value" innerRadius={75} outerRadius={95} paddingAngle={12}>{categoryData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} cornerRadius={12} stroke="none" />)}</Pie><Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.05)'}} /></PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                {categoryData.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-5 bg-slate-50/50 rounded-2xl border border-white transition-all hover:bg-white/80">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <div><p className="text-sm font-bold text-slate-800 leading-none">{item.name}</p></div>
                    </div>
                    <p className="font-black text-slate-900 text-base">৳{item.value.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-500 text-left">
            <h1 className={`${THEME.heading} text-3xl tracking-tighter`}>Settings.</h1>
            <div className="space-y-5">
              <SettingCard label="Monthly Budget" value={budget} onChange={setBudget} prefix="৳" icon={Target} color={THEME.primary} />
              <SettingCard label="Daily Limit" value={manualLimit} onChange={setManualLimit} prefix="৳" suggestion={dailySuggestion} icon={Zap} color={THEME.accent} />
            </div>
            <div className={`p-10 rounded-[3rem] ${THEME.glass}`}>
              <div className="flex items-center gap-3 mb-8"><Rocket size={22} className="text-indigo-600" /><h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-300">Set Saving Goal</h3></div>
              <div className="space-y-5">
                <input type="text" value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} placeholder="What are we saving for?" className="w-full bg-slate-50/50 p-5 rounded-2xl outline-none font-bold text-sm focus:ring-2 ring-indigo-50 transition-all border border-slate-50" />
                <div className="flex gap-4">
                  <input type="number" value={goalTarget} onChange={(e) => setGoalTarget(Number(e.target.value))} placeholder="৳ Target Price" className="flex-1 bg-slate-50/50 p-5 rounded-2xl outline-none font-bold text-sm focus:ring-2 ring-indigo-50 transition-all border border-slate-50" />
                  <button onClick={() => addGoal(goalTitle, goalTarget, 6)} className="bg-slate-900 text-white px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95">SET</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-2xl p-3 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[100] flex items-center gap-2 border border-white/10">
          <button onClick={() => setActiveTab('home')} className={`p-5 rounded-[2.2rem] transition-all ${activeTab === 'home' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 hover:text-slate-300'}`}><Wallet size={20} /></button>
          <button onClick={() => setActiveTab('history')} className={`p-5 rounded-[2.2rem] transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 hover:text-slate-300'}`}><HistoryIcon size={20} /></button>
          <button onClick={() => { setEditingItem(null); setShowAdd(true); }} className="bg-white p-5 rounded-full text-slate-900 mx-1 shadow-xl active:scale-90 transition-all hover:rotate-90"><Plus size={24} /></button>
          <button onClick={() => setActiveTab('stats')} className={`p-5 rounded-[2.2rem] transition-all ${activeTab === 'stats' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 hover:text-slate-300'}`}><LayoutGrid size={20} /></button>
          <button onClick={() => setActiveTab('settings')} className={`p-5 rounded-[2.2rem] transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 hover:text-slate-300'}`}><Settings size={20} /></button>
        </nav>

        {showAdd && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[150] flex items-end sm:items-center justify-center animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-sm rounded-t-[4rem] sm:rounded-[4rem] p-12 relative shadow-2xl animate-in slide-in-from-bottom-20 duration-500">
              <button onClick={() => { setShowAdd(false); setEditingItem(null); }} className="absolute right-10 top-10 text-slate-200 hover:text-indigo-600 transition-colors"><X size={32}/></button>
              <h2 className="text-2xl font-black uppercase mb-12 text-left text-slate-900 tracking-tighter italic">{editingItem ? "Refine Leak" : "Log a Leak"}</h2>
              <ExpenseForm
                editItem={editingItem}
                onAdd={(a, c, m, n, isLoan, loanType) => {
                  const now = new Date();
                  const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  if (editingItem) deleteExpense(editingItem.id);
                  addExpense(a, c, m, n, isLoan, loanType, timestamp); 
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