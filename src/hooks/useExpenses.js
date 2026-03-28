import { useState, useEffect, useMemo } from 'react';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('kg_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [budget, setBudget] = useState(() => {
    return Number(localStorage.getItem('kg_budget')) || 20000;
  });

  const [manualLimit, setManualLimit] = useState(() => {
    const savedLimit = localStorage.getItem('kg_manual_limit');
    return savedLimit ? Number(savedLimit) : 0; 
  });

  useEffect(() => {
    localStorage.setItem('kg_expenses', JSON.stringify(expenses));
    localStorage.setItem('kg_budget', budget.toString());
    localStorage.setItem('kg_manual_limit', manualLimit.toString());
  }, [expenses, budget, manualLimit]);

  const addExpense = (amount, category, method, note, isLoan = false, loanType = 'lent') => {
    const newEntry = {
      id: Date.now(),
      amount: Number(amount),
      category: isLoan ? "Loan" : category,
      method, 
      note, 
      isLoan,
      loanType: isLoan ? loanType : null,
      date: new Date().toLocaleDateString(),
      time: new Date().getHours(), // Added time tracking for late-night roasts
    };
    setExpenses(prev => [newEntry, ...prev]);
  };

  const deleteExpense = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const clearAllData = () => {
    if (window.confirm("Are you sure you want to wipe the ledger?")) {
      setExpenses([]);
    }
  };

  // --- CALCULATIONS ---
  const totalSpent = useMemo(() => 
    (expenses || []).filter(e => !e.isLoan).reduce((sum, e) => sum + e.amount, 0), [expenses]);

  const remaining = budget - totalSpent;

  const dailySuggestion = useMemo(() => {
    const date = new Date();
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const remainingDays = Math.max(1, daysInMonth - date.getDate() + 1);
    return Math.floor(remaining / remainingDays);
  }, [remaining]);

  const spentToday = useMemo(() => {
    const todayStr = new Date().toLocaleDateString();
    return (expenses || []).filter(e => e.date === todayStr && !e.isLoan)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const loanStats = useMemo(() => {
    return (expenses || []).filter(e => e.isLoan).reduce((acc, curr) => {
      if (curr.loanType === 'lent') acc.lent += curr.amount;
      if (curr.loanType === 'borrowed') acc.debt += curr.amount;
      return acc;
    }, { lent: 0, debt: 0 });
  }, [expenses]);

  const categoryData = useMemo(() => {
    const groups = (expenses || []).reduce((acc, exp) => {
      if (exp.isLoan) return acc;
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const topCategory = useMemo(() => {
    if (categoryData.length === 0) return null;
    return [...categoryData].sort((a, b) => b.value - a.value)[0];
  }, [categoryData]);

  const progress = useMemo(() => {
    return budget > 0 ? (totalSpent / budget) * 100 : 0;
  }, [totalSpent, budget]);

  // --- THE "NO MERCY" ROAST ENGINE ---
const insight = useMemo(() => {
  const currentLimit = manualLimit > 0 ? manualLimit : dailySuggestion;
  const todayStr = new Date().toLocaleDateString();
  const todayExpenses = (expenses || []).filter(e => e.date === todayStr);
  const lastExpense = todayExpenses[0]; // Get the very last thing you logged

  // 1. THE "FERESTA" (No spending) - Still a roast
  if (spentToday === 0 && todayExpenses.length === 0) {
    return "Ajke ek taka-o khoroch koro nai? Tumi ki manush naki feresta? Shotti kore bolo, kar pocket marso?";
  }

  // 2. THE AUDACITY CHECK (Spending while in debt)
  if (loanStats.debt > 0) {
    return `Manush-er kache ৳${loanStats.debt} dena, r tumi ekhane boga-r moto khoroch korteso? Sharam nai?`;
  }

  // 3. KEYWORD SPECIFIC ROASTS (Highest Priority)
  if (lastExpense?.note?.toLowerCase().includes('gf') || lastExpense?.note?.toLowerCase().includes('date')) {
    return "Gf niye ghurte gile pocket to khali hobei! Biye korba kobe? Shoshurbari theke ki dowry paba?";
  }
  
  if (lastExpense?.category?.toLowerCase() === 'transport') {
    return `৳${lastExpense.amount} rickshaw bhara?! Paa duita ki shudhu pant porar jonno dise Allah?`;
  }

  if (lastExpense?.category?.toLowerCase() === 'food') {
    return "Khaite khaite shesh hoye gela! Shari-din ki khali pet-er chinta? Ar koto gilla lagbe?";
  }

  // 4. THE "OVER LIMIT" PANIC
  if (spentToday > currentLimit) {
    return `LIMIT SHESH! ৳${Math.abs(currentLimit - spentToday)} extra khoroch! Abba janle kintu bashay dhukte dibe na.`;
  }
  
  

  // 5. THE "EVERY LITTLE EXPENSE" ROAST (The Randomizer)
  // This triggers if none of the above specific ones hit.
  const randomRoasts = [
    "Taka ki gache dhore? Ei ৳" + lastExpense?.amount + " khoroch na korle ki hoto?",
    "Haye haye! Shongshar to tumi rastay boshaia diba dekhtesi.",
    "Ekhon ৳" + lastExpense?.amount + ", eibhabe kotee-poti hoba naki deuliyah?",
    "Mayer kache bolbo? Taka ki bhashay ashe?",
    "Budget-er 12ta bajae dise. Shabas, beta! Ar koto taka uraba?",
    "Tumi ki bhabso tumi Ambani-r nati? Eto bilashita keno?"
  ];

  return randomRoasts[Math.floor(Math.random() * randomRoasts.length)];

}, [spentToday, dailySuggestion, manualLimit, progress, loanStats, expenses]);

  return {
    expenses, budget, setBudget, addExpense, deleteExpense, clearAllData,
    remaining, dailySuggestion, spentToday, insight, manualLimit, 
    setManualLimit, categoryData, topCategory, progress, loanStats,
    cashSpentToday: (expenses || []).filter(e => !e.isLoan && e.method?.toUpperCase() === 'CASH').reduce((sum, e) => sum + e.amount, 0),
    digitalSpentToday: (expenses || []).filter(e => !e.isLoan && e.method?.toUpperCase() !== 'CASH').reduce((sum, e) => sum + e.amount, 0)
  };
};