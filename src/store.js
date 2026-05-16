import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { db, getUserId, getUserName, setUserName } from './lib/supabase'

export { getUserId, getUserName, setUserName }

const DEFAULT_GOALS = [
  { title: 'Monthly Budget', sub: 'Keep spending under limit', emoji: '🎯', target: 15000, saved: 0,     color: '#6c5ce7', type: 'spending', is_default: true },
  { title: 'Emergency Fund', sub: 'Build your safety net',     emoji: '🏦', target: 50000, saved: 12500, color: '#00c9a7', type: 'saving',   is_default: true },
  { title: 'Food Budget',    sub: 'Monthly food spending cap', emoji: '🍱', target: 5000,  saved: 0,     color: '#ffa94d', type: 'spending', is_default: true },
  { title: 'Fun Cap',        sub: 'Monthly entertainment cap', emoji: '🎬', target: 2000,  saved: 0,     color: '#a29bfe', type: 'spending', is_default: true },
]

export const useStore = create(
  persist(
    (set, get) => ({
      // ── State ─────────────────────────────────────────────────
      expenses:        [],
      goals:           [],
      loans:           [],
      bills:           [],
      dailyLimit:      1000,
      monthlyBudget:   15000,
      foodBudget:      5000,
      funBudget:       2000,
      emergencyTarget: 50000,
      loading:         true,
      synced:          false,

      set: (partial) => set(partial),

      // ── LOAD ALL ──────────────────────────────────────────────
      loadAll: async () => {
        set({ loading: true })
        try {
          const [expenses, goals, dbSettings, loans, bills] = await Promise.all([
            db.getExpenses(),
            db.getGoals(),
            db.getSettings(),
            db.getLoans(),
            db.getBills(),
          ])

          let finalGoals = goals
          if (!goals || goals.length === 0) {
            const seeded = await Promise.all(DEFAULT_GOALS.map((g) => db.addGoal(g)))
            finalGoals = seeded.filter(Boolean)
          }

          const localLimit = get().dailyLimit
          const isDefault  = localLimit === 1000

          set({
            expenses:  expenses  || [],
            goals:     finalGoals.length ? finalGoals : DEFAULT_GOALS,
            loans:     loans     || [],
            bills:     bills     || [],
            loading:   false,
            synced:    true,
            ...(dbSettings && isDefault ? {
              dailyLimit:    dbSettings.daily_limit    || 1000,
              monthlyBudget: dbSettings.monthly_budget || 15000,
              foodBudget:    dbSettings.food_budget    || 5000,
              funBudget:     dbSettings.fun_budget     || 2000,
            } : {}),
          })
        } catch (err) {
          console.error('[loadAll]', err)
          set({ loading: false })
        }
      },

      // ── EXPENSES ──────────────────────────────────────────────
      addExpense: async (expense) => {
        const tempId = 'temp_' + Date.now()
        const temp   = { id: tempId, date: new Date().toISOString(), user_id: getUserId(), ...expense }
        set((s) => ({ expenses: [temp, ...s.expenses] }))
        const saved = await db.addExpense({ ...expense, date: new Date().toISOString() })
        if (saved) {
          set((s) => ({ expenses: s.expenses.map((e) => e.id === tempId ? saved : e) }))
        } else {
          set((s) => ({ expenses: s.expenses.filter((e) => e.id !== tempId) }))
        }
      },

      deleteExpense: async (id) => {
        set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }))
        await db.deleteExpense(id)
      },

      // ── GOALS ─────────────────────────────────────────────────
      addGoal: async (goal) => {
        const saved = await db.addGoal(goal)
        if (saved) set((s) => ({ goals: [...s.goals, saved] }))
      },

      deleteGoal: async (id) => {
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }))
        await db.deleteGoal(id)
      },

      depositToGoal: async (id, amount) => {
        const goal = get().goals.find((g) => g.id === id)
        if (!goal) return
        const newSaved = Math.min(goal.saved + amount, goal.target)
        set((s) => ({ goals: s.goals.map((g) => g.id === id ? { ...g, saved: newSaved } : g) }))
        await db.depositToGoal(id, newSaved)
      },

      // ── LOANS ─────────────────────────────────────────────────
      addLoan: async (loan) => {
        const tempId = 'temp_' + Date.now()
        const temp   = {
          id: tempId,
          date: new Date().toISOString(),
          settled: false,
          user_id: getUserId(),
          ...loan,
        }
        set((s) => ({ loans: [temp, ...s.loans] }))
        const saved = await db.addLoan({ ...loan, date: new Date().toISOString(), settled: false })
        if (saved) {
          set((s) => ({ loans: s.loans.map((l) => l.id === tempId ? saved : l) }))
        } else {
          set((s) => ({ loans: s.loans.filter((l) => l.id !== tempId) }))
        }
      },

      settleLoan: async (id) => {
        set((s) => ({ loans: s.loans.map((l) => l.id === id ? { ...l, settled: true } : l) }))
        await db.settleLoan(id)
      },

      deleteLoan: async (id) => {
        set((s) => ({ loans: s.loans.filter((l) => l.id !== id) }))
        await db.deleteLoan(id)
      },


      // ── BILLS ─────────────────────────────────────────────────────
      addBill: async (bill) => {
        const tempId = 'temp_' + Date.now()
        const temp   = { id: tempId, ...bill }
        set((s) => ({ bills: [temp, ...s.bills] }))
        const saved = await db.addBill(bill)
        if (saved) { set((s) => ({ bills: s.bills.map((b) => b.id === tempId ? saved : b) })) }
        else       { set((s) => ({ bills: s.bills.filter((b) => b.id !== tempId) })) }
      },

      updateBill: async (bill) => {
        set((s) => ({ bills: s.bills.map((b) => b.id === bill.id ? { ...b, ...bill } : b) }))
        await db.updateBill(bill)
      },

      deleteBill: async (id) => {
        set((s) => ({ bills: s.bills.filter((b) => b.id !== id) }))
        await db.deleteBill(id)
      },

      payBill: async (id) => {
        const bill = get().bills.find((b) => b.id === id)
        if (!bill) return
        // Advance due date by frequency
        const due = new Date(bill.due_date)
        if (bill.frequency === 'weekly')    due.setDate(due.getDate() + 7)
        else if (bill.frequency === 'monthly')   due.setMonth(due.getMonth() + 1)
        else if (bill.frequency === 'quarterly') due.setMonth(due.getMonth() + 3)
        else if (bill.frequency === 'yearly')    due.setFullYear(due.getFullYear() + 1)
        const newDue = due.toISOString()
        set((s) => ({ bills: s.bills.map((b) => b.id === id ? { ...b, due_date: newDue } : b) }))
        await db.updateBill({ ...bill, due_date: newDue })
      },

      // ── SETTINGS ──────────────────────────────────────────────
      saveSettings: async ({ dailyLimit, monthlyBudget, foodBudget, funBudget }) => {
        set({ dailyLimit, monthlyBudget, foodBudget, funBudget })
        try {
          await db.saveSettings({
            daily_limit:    dailyLimit,
            monthly_budget: monthlyBudget,
            food_budget:    foodBudget,
            fun_budget:     funBudget,
          })
        } catch (err) {
          console.error('[saveSettings]', err)
        }
      },

      // ── SELECTORS ─────────────────────────────────────────────
      getTodayExpenses: () => {
        const today = new Date().toDateString()
        return get().expenses.filter((e) => new Date(e.date).toDateString() === today)
      },

      getWeekExpenses: () => {
        const start = new Date()
        start.setDate(start.getDate() - start.getDay())
        start.setHours(0, 0, 0, 0)
        return get().expenses.filter((e) => new Date(e.date) >= start)
      },

      getMonthExpenses: () => {
        const now   = new Date()
        const start = new Date(now.getFullYear(), now.getMonth(), 1)
        return get().expenses.filter((e) => new Date(e.date) >= start)
      },

      getCategoryTotal: (cat, list) => {
        const expenses = list || get().getMonthExpenses()
        return expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0)
      },
    }),
    {
      name: 'kothay-gelo-v3',
      partialize: (state) => ({
        dailyLimit:      state.dailyLimit,
        monthlyBudget:   state.monthlyBudget,
        foodBudget:      state.foodBudget,
        funBudget:       state.funBudget,
        emergencyTarget: state.emergencyTarget,
      }),
    }
  )
)
