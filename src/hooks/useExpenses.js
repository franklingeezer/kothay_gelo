import { useState, useEffect } from 'react';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('takatrack_v12');
    return saved ? JSON.parse(saved) : [];
  });

  const [budget, setBudget] = useState(() => {
    const saved = localStorage.getItem('takatrack_budget');
    return saved ? parseFloat(saved) : 10000;
  });

  const [recurring, setRecurring] = useState(() => {
    const saved = localStorage.getItem('takatrack_recurring');
    return saved ? JSON.parse(saved) : [];
  });

  const [manualLimit, setManualLimit] = useState(() => {
    const saved = localStorage.getItem('takatrack_manual_limit');
    return saved ? parseFloat(saved) : 0;
  });

  // SAVE TO LOCAL STORAGE
  useEffect(() => {
    localStorage.setItem('takatrack_v12', JSON.stringify(expenses));
    localStorage.setItem('takatrack_budget', budget.toString());
    localStorage.setItem('takatrack_recurring', JSON.stringify(recurring));
    localStorage.setItem('takatrack_manual_limit', manualLimit.toString());
  }, [expenses, budget, recurring, manualLimit]);

  const now = new Date();
  const todayStr = now.toLocaleDateString('en-GB');
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // MONTHLY FILTER
  const monthlyExpenses = expenses.filter(item => {
    const parts = item.date.split('/');
    const m = parseInt(parts[1]);
    const y = parseInt(parts[2]);
    return m - 1 === currentMonth && y === currentYear;
  });

  const totalRecurring = recurring.reduce((acc, curr) => acc + curr.amount, 0);
  const totalSpent = monthlyExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  const remaining = Math.max(0, budget - totalSpent - totalRecurring);

  const progress = budget > 0
    ? ((totalSpent + totalRecurring) / budget) * 100
    : 0;

  // DAILY LIMIT CALCULATIONS
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - now.getDate() + 1);

  const dailySuggestion = manualLimit > 0
    ? manualLimit
    : remaining > 0
      ? Math.floor(remaining / daysRemaining)
      : 0;

  const spentToday = expenses
    .filter(e => e.date === todayStr)
    .reduce((a, b) => a + b.amount, 0);

  // KOTHAY GELO? - FUNNY INSIGHT GENERATOR
  const getFunnyInsight = () => {
    if (expenses.length === 0) return "Welcome! Tap + to start the investigation. 🔍";
    if (remaining <= 0) return "Budget sesh! Ekhon ki batash kheye thakba? 🌬️";
    if (spentToday > dailySuggestion) return "Ajke ektu beshi-i 'Kothay Gelo' hoye gelo! 🛑";

    const lastExpense = expenses[0];
    const insights = {
      Food: [
        "Pet bhore gelo, pocket khali holo! 🍔",
        "Ar koto khaba? Taka ki gache dhore? 🌳",
        "Foodpanda-r malik toh dhoni hoye gelo! 🐼"
      ],
      Shopping: [
        "Eto shopping korle thakba kothay? 🏠",
        "Abar shopping? Almirah-te jayga ache? 👗",
        "Bhaloi 'invest' korla... closet-e! 💸"
      ],
      Transport: [
        "Rickshaw bhara ki ekhon dollar-e hoy? 🛺",
        "Hete gele kintu taka-ta bachto! 🚶‍♂️",
        "Uber-e na giye bus-e try koro mamas! 🚌"
      ],
      General: [
        "Taka toh pakhir moto ure jachhe! 🕊️",
        "Kothay gelo? Ei toh eikhane gelo! 👆",
        "Spending healthy ache, keep it up! ✨"
      ]
    };

    const categoryArray = insights[lastExpense.category] || insights.General;
    return categoryArray[Math.floor(Math.random() * categoryArray.length)];
  };

  // TREND DATA (Last 7 Days)
  const getTrendData = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toLocaleDateString('en-GB');
      const amount = expenses
        .filter(e => e.date === dateStr)
        .reduce((sum, item) => sum + item.amount, 0);

      return {
        day: d.toLocaleDateString('en-GB', { weekday: 'short' }),
        amount
      };
    });
  };

  // HEATMAP DATA (Last 14 Days)
  const getHeatmapData = () => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      const dateStr = d.toLocaleDateString('en-GB');
      const dayTotal = expenses
        .filter(e => e.date === dateStr)
        .reduce((sum, item) => sum + item.amount, 0);

      let status = 'empty';
      if (dayTotal > 0) {
        status = dayTotal > dailySuggestion ? 'over' : 'under';
      }
      return { date: dateStr, status };
    });
  };

  // CATEGORY BREAKDOWN (Sorted by highest spend)
  const getCategoryBreakdown = () => {
    const map = {};
    monthlyExpenses.forEach(item => {
      map[item.category] = (map[item.category] || 0) + item.amount;
    });

    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const addExpense = (a, c, m, n) => {
    const newExpense = {
      id: Date.now(),
      amount: parseFloat(a),
      category: c,
      method: m,
      note: n,
      date: todayStr
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const deleteExpense = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  return { 
    expenses,
    remaining,
    budget,
    setBudget,
    progress,
    totalSpent,
    totalRecurring,
    recurring,
    setRecurring,
    insight: getFunnyInsight(), // Integrated the funny generator
    dailySuggestion,
    manualLimit,
    setManualLimit,
    spentToday,
    dailyProgress: dailySuggestion > 0 ? (spentToday / dailySuggestion) * 100 : 0,
    trendData: getTrendData(),
    heatmapData: getHeatmapData(),
    categoryData: getCategoryBreakdown(),
    addExpense,
    deleteExpense
  };
};