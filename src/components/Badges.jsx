import s from './Badges.module.css'

export const BADGE_DEFS = [
  { id: 'first_expense',    icon: '🌱', name: 'First Step',       desc: 'Added your first expense' },
  { id: 'streak_3',         icon: '🔥', name: '3-Day Streak',     desc: 'Under budget 3 days in a row' },
  { id: 'streak_7',         icon: '⚡', name: 'Week Warrior',     desc: 'Under budget 7 days in a row' },
  { id: 'streak_30',        icon: '🏆', name: 'Month Master',     desc: 'Under budget 30 days in a row' },
  { id: 'no_spend_day',     icon: '⭐', name: 'No-Spend Day',     desc: 'A day with zero spending' },
  { id: 'saver',            icon: '💰', name: 'Super Saver',      desc: 'Spent less than 50% of budget in a month' },
  { id: 'loan_free',        icon: '🤝', name: 'Debt Free',        desc: 'No active loans owed' },
  { id: 'goal_reached',     icon: '🎯', name: 'Goal Getter',      desc: 'Completed a savings goal' },
  { id: 'expense_50',       icon: '📊', name: 'Consistent',       desc: 'Logged 50 expenses' },
  { id: 'under_daily_week', icon: '🌈', name: 'Budget Hero',      desc: 'Under daily limit 7 days straight' },
]

export function computeBadges({ expenses, loans, goals, dailyLimit, monthlyBudget }) {
  const earned = new Set()

  // ── Must have actual expenses to earn anything streak-related ──
  if (expenses.length === 0) {
    return { earned, streak: 0 }
  }

  if (expenses.length > 0)  earned.add('first_expense')
  if (expenses.length >= 50) earned.add('expense_50')

  // Build day map — only days that HAVE expenses
  const dayMap = {}
  expenses.forEach((e) => {
    const d = new Date(e.date).toDateString()
    dayMap[d] = (dayMap[d] || 0) + e.amount
  })

  // No-spend day — only counts if user has been active
  // Must have at least 2 days of expenses, and one of those days had 0 spending
  // (i.e. today has no expenses but yesterday did)
  const today = new Date(); today.setHours(0,0,0,0)
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  const hasExpensesYesterday = !!dayMap[yesterday.toDateString()]
  const noSpendToday = !dayMap[today.toDateString()]
  if (hasExpensesYesterday && noSpendToday && expenses.length >= 2) {
    earned.add('no_spend_day')
  }

  // ── Streak — ONLY counts days where the user ACTUALLY logged expenses ──
  // Days with no expenses do NOT count (new users get 0 streak)
  let streak = 0
  for (let i = 1; i <= 90; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toDateString()

    // If user had expenses that day AND was under budget → count it
    if (dayMap[key] !== undefined) {
      if (dayMap[key] <= dailyLimit) {
        streak++
      } else {
        break // over budget breaks the streak
      }
    } else {
      // No expenses that day — break streak
      // (don't reward days where user didn't track anything)
      break
    }
  }

  if (streak >= 3)  earned.add('streak_3')
  if (streak >= 7)  earned.add('streak_7')
  if (streak >= 30) earned.add('streak_30')
  if (streak >= 7)  earned.add('under_daily_week')

  // Monthly saver — only if user has expenses this month
  const now        = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthExp   = expenses.filter((e) => new Date(e.date) >= monthStart)
  const monthTotal = monthExp.reduce((a, e) => a + e.amount, 0)
  // Must have at least 5 expenses this month AND be past day 20
  if (monthExp.length >= 5 && monthTotal < monthlyBudget * 0.5 && now.getDate() >= 20) {
    earned.add('saver')
  }

  // Loan free — only if user has added loans before (not just zero loans)
  const activeLoans = (loans || []).filter((l) => !l.settled && l.type === 'owe')
  if (activeLoans.length === 0 && (loans || []).length > 0) earned.add('loan_free')

  // Goal reached — only if a saving goal is actually complete
  const doneGoal = (goals || []).some((g) => g.type === 'saving' && g.saved >= g.target && g.target > 0)
  if (doneGoal) earned.add('goal_reached')

  return { earned, streak }
}

export function BadgeRow({ badge, earned }) {
  return (
    <div className={`${s.badge} ${!earned ? s.badgeLocked : ''}`}>
      <div className={s.badgeIco}>{badge.icon}</div>
      <div className={s.badgeInfo}>
        <div className={s.badgeName}>{badge.name}</div>
        <div className={s.badgeDesc}>{badge.desc}</div>
      </div>
      {earned && <div className={s.badgeCheck}>✓</div>}
    </div>
  )
}

export function StreakBanner({ streak }) {
  // Only show streak banner if streak is real (> 0)
  if (streak < 1) return null
  return (
    <div className={s.streakBanner}>
      <span className={s.streakFire}>🔥</span>
      <div className={s.streakInfo}>
        <div className={s.streakNum}>{streak}-Day Streak!</div>
        <div className={s.streakSub}>Under budget {streak} day{streak !== 1 ? 's' : ''} in a row</div>
      </div>
      <div className={s.streakBadge}>{streak >= 30 ? '🏆' : streak >= 7 ? '⚡' : '🔥'}</div>
    </div>
  )
}

export default function BadgesPage({ expenses, loans, goals, dailyLimit, monthlyBudget }) {
  const { earned, streak } = computeBadges({ expenses, loans, goals, dailyLimit, monthlyBudget })
  const earnedCount = BADGE_DEFS.filter((b) => earned.has(b.id)).length

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={s.title}>Badges</div>
        <div className={s.earnedCount}>{earnedCount}/{BADGE_DEFS.length} earned</div>
      </div>

      <StreakBanner streak={streak} />

      {/* Show motivational message for new users instead of empty streak */}
      {streak === 0 && expenses.length > 0 && (
        <div className={s.noStreakMsg}>
          💪 Stay under your daily limit to start a streak!
        </div>
      )}

      {expenses.length === 0 && (
        <div className={s.newUserMsg}>
          <div className={s.newUserIco}>🎯</div>
          <div className={s.newUserTitle}>Start tracking to earn badges!</div>
          <p className={s.newUserSub}>Add your first expense to begin your journey</p>
        </div>
      )}

      <div className={s.progressWrap}>
        <div className={s.progressBar}>
          <div className={s.progressFill} style={{ width: `${(earnedCount / BADGE_DEFS.length) * 100}%` }} />
        </div>
        <div className={s.progressLbl}>{Math.round((earnedCount / BADGE_DEFS.length) * 100)}% complete</div>
      </div>

      <div className={s.list}>
        {BADGE_DEFS.map((b) => (
          <BadgeRow key={b.id} badge={b} earned={earned.has(b.id)} />
        ))}
      </div>
    </div>
  )
}
