export const CATEGORIES = [
  { id: 'Food',          label: 'Food',     icon: '🍜', color: '#00c9a7', bg: 'rgba(0,201,167,.12)' },
  { id: 'Transport',     label: 'Ride',     icon: '🚌', color: '#22d3ee', bg: 'rgba(34,211,238,.12)' },
  { id: 'Shopping',      label: 'Shop',     icon: '🛍️', color: '#a29bfe', bg: 'rgba(162,155,254,.12)' },
  { id: 'Health',        label: 'Health',   icon: '💊', color: '#ff6b6b', bg: 'rgba(255,107,107,.12)' },
  { id: 'Coffee',        label: 'Coffee',   icon: '☕', color: '#ffa94d', bg: 'rgba(255,169,77,.12)' },
  { id: 'Bills',         label: 'Bills',    icon: '📄', color: '#f472b6', bg: 'rgba(244,114,182,.12)' },
  { id: 'Fun',           label: 'Fun',      icon: '🎬', color: '#6c5ce7', bg: 'rgba(108,92,231,.12)' },
  { id: 'Education',     label: 'Study',    icon: '📚', color: '#fbbf24', bg: 'rgba(251,191,36,.12)' },
  { id: 'Groceries',     label: 'Grocery',  icon: '🛒', color: '#34d399', bg: 'rgba(52,211,153,.12)' },
  { id: 'Other',         label: 'Other',    icon: '📦', color: '#635d80', bg: 'rgba(99,93,128,.12)' },
]

export const CAT_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]))

export const PAYMENT_METHODS = [
  { id: 'Cash',   label: '💵 Cash' },
  { id: 'bKash',  label: '📱 bKash' },
  { id: 'Nagad',  label: '📲 Nagad' },
  { id: 'Card',   label: '💳 Card' },
  { id: 'Rocket', label: '🚀 Rocket' },
  { id: 'DBBL',   label: '🏧 DBBL' },
]

export const GOAL_COLORS = [
  '#6c5ce7','#00c9a7','#ffa94d','#ff6b6b',
  '#22d3ee','#f472b6','#fbbf24','#a29bfe',
]

export const GOAL_EMOJIS = [
  '🎯','🏦','✈️','🏠','💍','🎓','🚗','💻',
  '👗','📱','🏋️','🌴','🎸','📸','💰','🌟',
]

export const fmt = (n) =>
  '৳' + (Math.round(n || 0)).toLocaleString('en-IN')

export const fmtShort = (n) => {
  if (n >= 100000) return '৳' + (n / 100000).toFixed(1) + 'L'
  if (n >= 1000)   return '৳' + (n / 1000).toFixed(1) + 'k'
  return fmt(n)
}

export const getInsight = (pct, smallCount, todayTotal, dailyLimit) => {
  if (todayTotal === 0)
    return { icon: '✅', msg: "Fresh start! No spending yet today.", color: 'var(--green)' }
  if (smallCount >= 4)
    return { icon: '💧', msg: `${smallCount} small purchases quietly draining you!`, color: 'var(--amber)' }
  if (pct < 30)
    return { icon: '🌟', msg: 'Excellent control! Well within your daily limit.', color: 'var(--green)' }
  if (pct < 55)
    return { icon: '👀', msg: `At ${Math.round(pct)}% of daily limit — staying mindful!`, color: 'var(--green)' }
  if (pct < 80)
    return { icon: '😬', msg: `Getting close! Only ${fmt(dailyLimit * (1 - pct/100))} left today.`, color: 'var(--amber)' }
  if (pct < 100)
    return { icon: '🚨', msg: 'Almost at your limit — hold off for today!', color: 'var(--red)' }
  return { icon: '🔴', msg: 'Daily limit reached. Try again tomorrow!', color: 'var(--red)' }
}

export const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d === 1) return 'yesterday'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
