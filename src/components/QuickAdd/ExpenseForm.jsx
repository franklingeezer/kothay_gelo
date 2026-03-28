import React, { useState } from 'react';
import { Check, X, Users, Smartphone, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Health", "Other"];
const METHODS = ["Cash", "bKash", "Nagad"];

export default function ExpenseForm({ onAdd }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [method, setMethod] = useState("Cash");
  const [note, setNote] = useState("");
  const [isLoan, setIsLoan] = useState(false);
  
  // NEW STATE: 'lent' (someone owes you) vs 'debt' (you borrowed from someone)
  const [loanType, setLoanType] = useState("lent"); 

  const handleNumPress = (val) => {
    if (val === "00" && !amount) return;
    if (amount.length < 8) {
      setAmount(prev => (prev === "0" ? val : prev + val));
    }
  };

  const handleDelete = () => {
    setAmount(prev => prev.slice(0, -1));
  };

  const submit = () => {
    if (!amount || Number(amount) === 0) return;
    
    // Updated to send loanType ('lent' or 'debt') to your hook
    onAdd(Number(amount), isLoan ? "Loan" : category, method, note, isLoan, loanType);
    
    // Reset Form
    setAmount("");
    setNote("");
    setCategory("Food");
    setMethod("Cash");
    setIsLoan(false);
    setLoanType("lent");
  };

  return (
    <div className="space-y-5 animate-in fade-in zoom-in duration-300">
      
      {/* 1. LOAN MODE TOGGLE */}
      <button 
        onClick={() => setIsLoan(!isLoan)}
        className={`w-full p-4 rounded-3xl border-2 transition-all flex justify-between items-center active:scale-95 ${
          isLoan 
            ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
            : 'border-slate-100 bg-white shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
            isLoan ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
          }`}>
            <Users size={20} />
          </div>
          <div className="text-left">
            <p className={`text-sm font-black tracking-tight ${isLoan ? 'text-indigo-900' : 'text-slate-700'}`}>
              Loan / Debt Mode
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              {isLoan ? "Track money with others" : "Regular daily spending"}
            </p>
          </div>
        </div>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          isLoan ? 'border-indigo-600 bg-indigo-600' : 'border-slate-200'
        }`}>
           {isLoan && <Check size={14} className="text-white stroke-[4]" />}
        </div>
      </button>

      {/* 2. DIRECTION TOGGLE (Only shows if Loan is active) */}
      {isLoan && (
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-[2rem] animate-in slide-in-from-top-2 duration-300">
          <button
            type="button"
            onClick={() => setLoanType('lent')}
            className={`flex items-center justify-center gap-2 py-3 rounded-3xl text-[10px] font-black uppercase transition-all ${
              loanType === 'lent' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'
            }`}
          >
            <ArrowUpRight size={14} strokeWidth={3} />
            I Lent
          </button>
          <button
            type="button"
            onClick={() => setLoanType('debt')}
            className={`flex items-center justify-center gap-2 py-3 rounded-3xl text-[10px] font-black uppercase transition-all ${
              loanType === 'debt' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'
            }`}
          >
            <ArrowDownLeft size={14} strokeWidth={3} />
            I Borrowed
          </button>
        </div>
      )}

      {/* 3. AMOUNT DISPLAY */}
      <div className="text-center py-2">
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 transition-colors ${
          isLoan ? (loanType === 'lent' ? 'text-indigo-400' : 'text-rose-400') : 'text-slate-400'
        }`}>
          {isLoan ? (loanType === 'lent' ? "Total Amount Lent" : "Total Amount Borrowed") : "Amount to Log"}
        </p>
        <div className={`text-6xl font-black tracking-tighter flex justify-center items-baseline gap-1 transition-colors ${
          isLoan ? (loanType === 'lent' ? 'text-indigo-600' : 'text-rose-600') : 'text-indigo-600'
        }`}>
          <span className="text-2xl font-light opacity-40">৳</span>
          {amount || "0"}
        </div>
      </div>

      {/* 4. CATEGORY SELECTOR - Only shown if NOT a loan */}
      {!isLoan && (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-5 py-2.5 rounded-2xl text-[11px] font-bold border whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-indigo-600 text-white shadow-md border-indigo-600'
                  : 'bg-white text-slate-400 border-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* 5. PAYMENT METHOD */}
      <div className="bg-slate-100 p-1.5 rounded-[2rem] grid grid-cols-3 gap-1">
        {METHODS.map(m => (
          <button
            key={m}
            onClick={() => setMethod(m)}
            className={`py-3 rounded-[1.5rem] text-[10px] font-black uppercase transition-all ${
              method === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* 6. NOTE INPUT */}
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={isLoan ? "Person's name..." : "What was this for?"}
        className={`w-full bg-slate-50 border rounded-2xl p-4 text-sm font-bold outline-none transition-all ${
          isLoan 
            ? (loanType === 'lent' ? 'border-indigo-100 focus:ring-indigo-50' : 'border-rose-100 focus:ring-rose-50') 
            : 'border-slate-100 focus:ring-indigo-50'
        }`}
      />

      {/* 7. NUMBER PAD */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, "00", 0].map((n) => (
          <button
            key={n}
            onClick={() => handleNumPress(n.toString())}
            className="h-14 rounded-2xl bg-white border border-slate-100 text-slate-900 font-black text-xl active:scale-95 shadow-sm"
          >
            {n}
          </button>
        ))}
        <button
          onClick={handleDelete}
          className="h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center active:scale-95"
        >
          <X size={24} strokeWidth={3} />
        </button>
      </div>

      {/* 8. CONFIRM BUTTON */}
      <button
        onClick={submit}
        disabled={!amount || Number(amount) === 0}
        className={`w-full py-5 rounded-[2.5rem] font-black uppercase text-xs flex items-center justify-center gap-3 transition-all ${
          amount && Number(amount) > 0
            ? (isLoan 
                ? (loanType === 'lent' ? 'bg-indigo-600 shadow-indigo-200' : 'bg-rose-600 shadow-rose-200') 
                : 'bg-slate-900 shadow-slate-200'
              ) + ' text-white shadow-2xl active:scale-95'
            : 'bg-slate-100 text-slate-300 cursor-not-allowed'
        }`}
      >
        <Check size={20} strokeWidth={3} />
        {isLoan ? (loanType === 'lent' ? 'Log Money Lent' : 'Log Money Borrowed') : 'Confirm Entry'}
      </button>
    </div>
  );
}