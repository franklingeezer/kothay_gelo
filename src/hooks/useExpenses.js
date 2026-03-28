import { useState, useEffect, useMemo } from 'react';

export const useExpenses = () => {
  // --- 1. STATE INITIALIZATION ---
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

  // --- 2. PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('kg_expenses', JSON.stringify(expenses));
    localStorage.setItem('kg_budget', budget.toString());
    localStorage.setItem('kg_manual_limit', manualLimit.toString());
  }, [expenses, budget, manualLimit]);

  // --- 3. ACTIONS ---
  const addExpense = (amount, category, method, note, isLoan = false, loanType = 'lent') => {
    const newEntry = {
      id: Date.now(),
      amount: Number(amount),
      // If it's a loan, we label it "Loan", otherwise we use the provided category
      category: isLoan ? "Loan" : (category || "Other"), 
      method, 
      note, 
      isLoan,
      loanType: isLoan ? loanType : null,
      date: new Date().toLocaleDateString(),
      time: new Date().getHours(),
    };
    // We put the newest at the start of the array
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

  // --- 4. CALCULATIONS ---
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

  // FIX: This now correctly calculates debt so your dashboard cards update!
  // --- FIX: Robust Loan Calculation ---
const loanStats = useMemo(() => {
  return (expenses || []).filter(e => e.isLoan).reduce((acc, curr) => {
    // We convert to lowercase to prevent "Borrowed" vs "borrowed" issues
    const type = curr.loanType?.toLowerCase();
    
    if (type === 'lent') {
      acc.lent += curr.amount;
    } else if (type === 'borrowed' || type === 'borrow' || type === 'debt') {
      acc.debt += curr.amount;
    }
    
    return acc;
  }, { lent: 0, debt: 0 });
}, [expenses]);

  const categoryData = useMemo(() => {
    const groups = (expenses || []).reduce((acc, exp) => {
      if (exp.isLoan) return acc;
      const cat = exp.category || "Other";
      acc[cat] = (acc[cat] || 0) + exp.amount;
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

  // --- 5. THE "NO MERCY" ROAST ENGINE ---
  const insight = useMemo(() => {
    const currentLimit = manualLimit > 0 ? manualLimit : dailySuggestion;
    const todayStr = new Date().toLocaleDateString();
    
    // Filter today's items
    const todayExpenses = (expenses || []).filter(e => e.date === todayStr);
    
    // CRITICAL FIX: Since we use [newEntry, ...prev], index 0 is always the latest
    const lastExpense = todayExpenses[0]; 
    const lastCat = lastExpense?.category?.toLowerCase() || "";
    const lastNote = lastExpense?.note?.toLowerCase() || "";

    // A. ZERO SPENDING
    if (spentToday === 0 && todayExpenses.length === 0) {
      return "Ajke ek taka-o khoroch koro nai? Tumi ki manush naki feresta? Shotti kore bolo, kar pocket marso?";
    }

    // B. LOAN/DEBT SPECIFIC (Highest priority roasting)
    if (lastExpense?.isLoan && lastExpense?.loanType === 'borrowed') {
      return "Nijeder taka shesh kore ekhon manush-er kache haath patteso? Sharam lage na?";
    }

    if (loanStats.debt > 0 && !lastExpense?.isLoan) {
      return `Manush-er kache ৳${loanStats.debt} dena, r tumi ekhane boga-r moto khoroch korteso? Sharam nai?`;
    }

    // C. KEYWORD/CATEGORY SPECIFIC
    if (lastNote.includes('gf') || lastNote.includes('date')) {
      return "Gf niye ghurte gile pocket to khali hobei! Biye korba kobe? Shoshurbari theke ki dowry paba?";
    }
    
    if (lastCat === 'transport') {
      return `৳${lastExpense.amount} rickshaw bhara?! Paa duita ki shudhu pant porar jonno dise Allah? Hatta shiko!`;
    }

    if (lastCat === 'food') {
      return "Khaite khaite shesh hoye gela! Shari-din ki khali pet-er chinta? Ar koto gilla lagbe?";
    }

    if (lastCat === 'health' || lastCat === 'medical') {
      return "Sharir-er jotno nita koto bar bolsi? Ekhon daktar-re taka dita bhalo lagtise?";
    }

    if (lastCat === 'other') {
      return "Category 'Other' mane ki? Shotti kore bolo to taka diye ki ultapolta kaj korso?";
    }

    // D. LIMIT PANIC
    if (spentToday > currentLimit) {
      return `LIMIT SHESH! ৳${Math.abs(currentLimit - spentToday)} extra khoroch! Abba janle kintu bashay dhukte dibe na.`;
    }

    // E. RANDOM JUDGMENT
    const randomRoasts = [
      `Taka ki gache dhore? Ei ৳${lastExpense?.amount} khoroch na korle ki hoto?`,
      "Haye haye! Shongshar to tumi rastay boshaia diba dekhtesi.",
      `Ekhon ৳${lastExpense?.amount}, eibhabe kotee-poti hoba naki deuliyah?`,
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