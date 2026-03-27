import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Health", "Other"];
const METHODS = ["Cash", "bKash", "Nagad"];

export default function ExpenseForm({ onAdd }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [method, setMethod] = useState("Cash");
  const [note, setNote] = useState("");

  // 🔥 Improved input handling
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

    onAdd(amount, category, method, note);

    // 🔥 Reset cleanly
    setAmount("");
    setNote("");
    setCategory("Food");
    setMethod("Cash");
  };

  return (
    <div className="space-y-6">

      {/* AMOUNT */}
      <div className="text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Amount
        </p>

        <div className="text-5xl font-extrabold text-indigo-600 tracking-tighter">
          ৳{amount || "0"}
        </div>
      </div>

      {/* CATEGORY */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full text-[11px] font-bold border whitespace-nowrap transition ${
              category === cat
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* PAYMENT METHOD */}
      <div className="grid grid-cols-3 gap-2">
        {METHODS.map(m => (
          <button
            key={m}
            onClick={() => setMethod(m)}
            className={`py-3 rounded-2xl text-[10px] font-black uppercase border transition ${
              method === m
                ? 'bg-slate-900 text-white'
                : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* NOTE */}
      <textarea
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a note (optional)"
        className="w-full bg-slate-50 rounded-2xl p-4 text-[13px] outline-none focus:ring-2 focus:ring-indigo-200"
      />

      {/* NUMBER PAD */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, "00", 0].map((n) => (
          <button
            key={n}
            onClick={() => handleNumPress(n.toString())}
            className="h-14 rounded-2xl bg-slate-50 text-slate-800 font-bold text-xl active:scale-95 transition"
          >
            {n}
          </button>
        ))}

        <button
          onClick={handleDelete}
          className="h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center active:scale-95 transition"
        >
          <X size={20} />
        </button>
      </div>

      {/* SUBMIT */}
      <button
        onClick={submit}
        disabled={!amount || Number(amount) === 0}
        className={`w-full py-5 rounded-[2rem] font-black uppercase text-xs flex items-center justify-center gap-3 transition-all ${
          amount && Number(amount) > 0
            ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 active:scale-95'
            : 'bg-slate-100 text-slate-300'
        }`}
      >
        <Check size={18} />
        Confirm Entry
      </button>
    </div>
  );
}