import React, { useState } from 'react';
import { Plus, Utensils, Car, ShoppingBag, PlusCircle } from 'lucide-react';

export default function QuickAdd({ onAdd }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');

  const categories = [
    { name: 'Food', icon: <Utensils size={18}/>, color: 'bg-orange-500' },
    { name: 'Transport', icon: <Car size={18}/>, color: 'bg-blue-500' },
    { name: 'Shopping', icon: <ShoppingBag size={18}/>, color: 'bg-purple-500' },
    { name: 'Other', icon: <PlusCircle size={18}/>, color: 'bg-slate-500' },
  ];

  const handleAdd = () => {
    if (!amount) return;
    onAdd(amount, category);
    setAmount('');
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100">
      <h3 className="text-slate-800 font-bold mb-4">Quick Add</h3>
      <div className="flex flex-col gap-4">
        {/* Amount Input */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
          <input 
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl py-4 pl-10 pr-4 text-2xl font-bold text-slate-800 transition-all outline-none"
          />
        </div>

        {/* Category Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setCategory(cat.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all whitespace-nowrap ${
                category === cat.name 
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
              }`}
            >
              {cat.icon} <span className="text-sm font-medium">{cat.name}</span>
            </button>
          ))}
        </div>

        <button 
          onClick={handleAdd}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-transform active:scale-95"
        >
          <Plus size={20} /> Save Expense
        </button>
      </div>
    </div>
  );
}