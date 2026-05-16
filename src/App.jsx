import { useState, useEffect } from 'react'
import { useStore } from './store'
import { ThemeProvider } from './components/Settings'
import Login      from './components/Login'
import Home       from './components/Home'
import AddExpense from './components/AddExpense'
import Analytics  from './components/Analytics'
import Goals      from './components/Goals'
import Loans      from './components/Loans'
import Bills      from './components/Bills'
import BadgesPage from './components/Badges'
import Settings   from './components/Settings'
import Toast      from './components/Toast'
import NavBar     from './components/NavBar'
import { LockScreen, isPinLocked, clearUnlocked } from './components/PinLock'
import styles     from './App.module.css'

function LoadingScreen() {
  return (
    <div className={styles.loading}>
      <img src="/logo.png" alt="Kothay Gelo" className={styles.loadingLogo} />
      <div className={styles.loadingSpinner} />
      <p className={styles.loadingText}>Loading your data…</p>
    </div>
  )
}

function BadgesPageWrapper() {
  const expenses      = useStore((s) => s.expenses)
  const loans         = useStore((s) => s.loans)
  const goals         = useStore((s) => s.goals)
  const dailyLimit    = useStore((s) => s.dailyLimit)
  const monthlyBudget = useStore((s) => s.monthlyBudget)
  return <BadgesPage expenses={expenses} loans={loans} goals={goals} dailyLimit={dailyLimit} monthlyBudget={monthlyBudget} />
}

function AppInner() {
  const [tab,      setTab]      = useState('home')
  const [toast,    setToast]    = useState(null)
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('kg_logged_in'))
  const [locked,   setLocked]   = useState(() => isPinLocked())

  const loadAll  = useStore((s) => s.loadAll)
  const loading  = useStore((s) => s.loading)
  const setStore = useStore((s) => s.set)
  const bills    = useStore((s) => s.bills) || []

  const billsDueSoon = bills.filter((b) => {
    if (!b.due_date) return false
    const d = new Date(b.due_date); d.setHours(0,0,0,0)
    const n = new Date(); n.setHours(0,0,0,0)
    return Math.round((d - n) / 86400000) <= 3
  }).length

  useEffect(() => {
    if (loggedIn && !locked) loadAll()
  }, [loggedIn, locked])

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && loggedIn && isPinLocked()) setLocked(true)
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [loggedIn])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2400)
  }

  const handleLogin = () => { setLoggedIn(true); setLocked(false); setTab('home') }

  const handleLogout = () => {
    localStorage.removeItem('kg_logged_in')
    localStorage.removeItem('kg_user_id')
    localStorage.removeItem('kg_user_name')
    localStorage.removeItem('kg_username')
    clearUnlocked()
    setStore({ expenses: [], goals: [], loans: [], bills: [], loading: true, synced: false })
    setLoggedIn(false); setLocked(false); setTab('home')
  }

  const goTo = (t) => setTab(t)

  if (!loggedIn) return <Login onLogin={handleLogin} />
  if (locked)    return <LockScreen onUnlock={() => setLocked(false)} />
  if (loading)   return <LoadingScreen />



  return (
    <div className={styles.shell}>
      <div className={styles.content}>
        {tab === 'home'     && <Home       goTo={goTo} showToast={showToast} />}
        {tab === 'add'      && <AddExpense goTo={goTo} showToast={showToast} />}
        {tab === 'analytics'&& <Analytics  goTo={goTo} />}
        {tab === 'loans'    && <Loans      goTo={goTo} showToast={showToast} />}
        {tab === 'bills'    && <Bills      goTo={goTo} showToast={showToast} />}
        {tab === 'goals'    && <Goals      goTo={goTo} showToast={showToast} />}
        {tab === 'badges'   && <BadgesPageWrapper />}
        {tab === 'settings' && <Settings   goTo={goTo} showToast={showToast} onLogout={handleLogout} />}
      </div>
      <NavBar tab={tab} goTo={goTo} billsDueSoon={billsDueSoon} />
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  )
}
