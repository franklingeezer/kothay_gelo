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

  const [goals, setGoals] = useState(() => {
    const savedGoals = localStorage.getItem('kg_goals');
    return savedGoals ? JSON.parse(savedGoals) : [];
  });

  // --- 2. PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('kg_expenses', JSON.stringify(expenses));
    localStorage.setItem('kg_budget', budget.toString());
    localStorage.setItem('kg_manual_limit', manualLimit.toString());
    localStorage.setItem('kg_goals', JSON.stringify(goals));
  }, [expenses, budget, manualLimit, goals]);

  // --- 3. ACTIONS ---
  const addExpense = (amount, category, method, note, isLoan = false, loanType = 'lent', customTime = null) => {
    const now = new Date();
    const newEntry = {
      id: Date.now(),
      amount: Number(amount),
      category: isLoan ? "Loan" : (category || "Other"), 
      method, 
      note, 
      isLoan,
      loanType: isLoan ? loanType : null,
      isSettled: false,
      date: now.toLocaleDateString(),
      time: customTime || now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setExpenses(prev => [newEntry, ...prev]);
  };

  const deleteExpense = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const settleLoan = (id) => {
    setExpenses(prev => prev.map(exp => {
      if (exp.id === id) {
        return { ...exp, isSettled: true, isLoan: false, category: "Settled" };
      }
      return exp;
    }));
  };

  const clearAllData = () => {
    if (window.confirm("Are you sure you want to wipe the ledger?")) {
      setExpenses([]);
      setGoals([]);
    }
  };

  const addGoal = (title, targetAmount, months) => {
    const newGoal = {
      id: Date.now(),
      title,
      target: Number(targetAmount),
      duration: Number(months),
      monthlyRequired: Math.ceil(Number(targetAmount) / Number(months)),
      createdAt: new Date().toLocaleDateString()
    };
    setGoals([newGoal]); 
  };

  // --- 4. CALCULATIONS ---
  const totalSpent = useMemo(() => 
    (expenses || []).filter(e => !e.isLoan && e.category !== "Settled").reduce((sum, e) => sum + e.amount, 0), [expenses]);

  const remaining = budget - totalSpent;

  const dailySuggestion = useMemo(() => {
    const date = new Date();
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const remainingDays = Math.max(1, daysInMonth - date.getDate() + 1);
    return Math.floor(remaining / remainingDays);
  }, [remaining]);

  const spentToday = useMemo(() => {
    const todayStr = new Date().toLocaleDateString();
    return (expenses || []).filter(e => e.date === todayStr && !e.isLoan && e.category !== "Settled")
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const loanStats = useMemo(() => {
    return (expenses || []).filter(e => e.isLoan && !e.isSettled).reduce((acc, curr) => {
      const type = curr.loanType?.toLowerCase();
      if (type === 'lent') acc.lent += curr.amount;
      else if (type === 'borrowed' || type === 'borrow' || type === 'debt') acc.debt += curr.amount;
      return acc;
    }, { lent: 0, debt: 0 });
  }, [expenses]);

  const goalProgress = useMemo(() => {
    if (goals.length === 0) return null;
    const goal = goals[0];
    const currentSaved = Math.max(0, budget - totalSpent);
    const percent = Math.min((currentSaved / goal.target) * 100, 100);
    return { ...goal, currentSaved, percent: percent.toFixed(1) };
  }, [goals, totalSpent, budget]);

  const monthlyReport = useMemo(() => {
    const currentSaved = budget - totalSpent;
    const performance = goalProgress ? (currentSaved / goalProgress.monthlyRequired) * 100 : 0;
    
    return {
      savingsThisMonth: Math.max(0, currentSaved),
      status: performance >= 100 ? 'On Track' : 'Falling Behind',
      message: performance >= 100 
        ? "Good job! You saved enough for this month's portion." 
        : "You're spending too much to meet your target. Ammu is watching."
    };
  }, [budget, totalSpent, goalProgress]);

  const categoryData = useMemo(() => {
    const groups = (expenses || []).reduce((acc, exp) => {
      if (exp.isLoan || exp.category === "Settled") return acc;
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

  // --- 5. THE ROAST ENGINE ---
  const insight = useMemo(() => {
    const currentLimit = manualLimit > 0 ? manualLimit : dailySuggestion;
    const todayStr = new Date().toLocaleDateString();
    const todayExpenses = (expenses || []).filter(e => e.date === todayStr);
    const lastExpense = todayExpenses[0]; 
    const lastCat = lastExpense?.category?.toLowerCase() || "";
    const lastNote = lastExpense?.note?.toLowerCase() || "";

    if (lastExpense?.category === 'Settled') {
      return "Taka ferot paiso dekhi khub khushi? Shob taka abar khoroch kore felio na, kisu jamao!";
    }

    if (spentToday === 0 && todayExpenses.length === 0) {
      return "Ajke ek taka-o khoroch koro nai? Tumi ki manush naki feresta? Shotti kore bolo, kar pocket marso?";
    }

    if (goalProgress && goalProgress.percent < 5 && spentToday > 0) {
       return `"${goalProgress.title}" kinba bolsila na? Eto khoroch korle laptop ki shopne dekhba? Focus koro!`;
    }

    if (lastExpense?.isLoan && (lastExpense?.loanType === 'borrowed' || lastExpense?.loanType === 'borrow')) {
      return "Nijeder taka shesh kore ekhon manush-er kache haath patteso? Sharam lage na?";
    }

    if (loanStats.debt > 0 && !lastExpense?.isLoan) {
      return `Manush-er kache ৳${loanStats.debt} dena, r tumi ekhane boga-r moto khoroch korteso? Sharam nai?`;
    }

    if (lastNote.includes('gf') || lastNote.includes('date')) {
      return "Gf niye ghurte gile pocket to khali hobei! Biye korba kobe? Shoshurbari theke ki dowry paba?";
    }
    
    if (lastCat === 'transport') {
      return `৳${lastExpense.amount} rickshaw bhara?! Paa duita ki shudhu pant porar jonno dise Allah? Hatta shiko!`;
    }

    if (lastCat === 'food') {
      return "Khaite khaite shesh hoye gela! Shari-din ki khali pet-er chinta? Ar koto gilla lagbe?";
    }

    if (lastCat === 'shopping') {
      return "Ato shopping korle masher sheshe ki ghash khaba? Nijere ki raj-puttro bhabo?";
    }

    if (spentToday > currentLimit) {
      return `LIMIT SHESH! ৳${Math.abs(currentLimit - spentToday)} extra khoroch! Abba janle kintu bashay dhukte dibe na.`;
    }

    const randomRoasts = [
      "Haye haye! Shongshar to tumi rastay boshaia diba dekhtesi.",
      `Ekhon ৳${lastExpense?.amount || 0}, eibhabe kotee-poti hoba naki deuliyah?`,
      "Mayer kache bolbo? Taka ki bhashay ashe?",
      "Tumi ki bhabso tumi Ambani-r nati? Eto bilashita keno?"
    ];

    return randomRoasts[Math.floor(Math.random() * randomRoasts.length)];

  }, [spentToday, dailySuggestion, manualLimit, loanStats, expenses, goalProgress]);

  return {
    expenses, budget, setBudget, addExpense, deleteExpense, clearAllData,
    remaining, dailySuggestion, spentToday, insight, manualLimit, 
    setManualLimit, categoryData, topCategory, progress, loanStats,
    addGoal, goalProgress, settleLoan, monthlyReport,
    cashSpentToday: (expenses || []).filter(e => !e.isLoan && e.method?.toUpperCase() === 'CASH').reduce((sum, e) => sum + e.amount, 0),
    digitalSpentToday: (expenses || []).filter(e => !e.isLoan && e.method?.toUpperCase() !== 'CASH').reduce((sum, e) => sum + e.amount, 0)
  };
};