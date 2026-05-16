import { useState } from 'react'
import { useStore } from '../store'
import { fmt, CAT_MAP, getInsight, timeAgo } from '../utils/constants'
import { computeBadges, StreakBanner } from './Badges'
import ExpenseSearch from './ExpenseSearch'
import ShareCard from './ShareCard'
import s from './Home.module.css'

export default function Home({ goTo, showToast }) {
  const [showSearch, setShowSearch] = useState(false)
  const [showShare,  setShowShare]  = useState(false)

  const expenses         = useStore((st) => st.expenses)
  const dailyLimit       = useStore((st) => st.dailyLimit)
  const getTodayExpenses = useStore((st) => st.getTodayExpenses)
  const getWeekExpenses  = useStore((st) => st.getWeekExpenses)
  const getMonthExpenses = useStore((st) => st.getMonthExpenses)

  const todayExp    = getTodayExpenses()
  const weekExp     = getWeekExpenses()
  const monthExp    = getMonthExpenses()
  const todayTotal  = todayExp.reduce((a, e) => a + e.amount, 0)
  const weekTotal   = weekExp.reduce((a, e) => a + e.amount, 0)
  const monthTotal  = monthExp.reduce((a, e) => a + e.amount, 0)
  const pct         = Math.min((todayTotal / dailyLimit) * 100, 100)
  const remaining   = Math.max(dailyLimit - todayTotal, 0)
  const overBy      = Math.max(todayTotal - dailyLimit, 0)   // ← how much over limit
  const isOver      = todayTotal > dailyLimit
  const smallCount  = todayExp.filter((e) => e.amount < 100).length

  const { icon, msg } = getInsight(pct, smallCount, todayTotal, dailyLimit)

  const loans        = useStore((st) => st.loans)
  const goals        = useStore((st) => st.goals)
  const monthlyBudget = useStore((st) => st.monthlyBudget)
  const { streak }   = computeBadges({ expenses, loans, goals, dailyLimit, monthlyBudget })

  const barColor = isOver ? '#ef4444' : pct > 60 ? '#f59e0b' : '#10b981'
  const barGrad  = isOver
    ? 'linear-gradient(90deg,#dc2626,#ef4444,#ff6b6b)'
    : pct > 60
    ? 'linear-gradient(90deg,#d97706,#f59e0b)'
    : 'linear-gradient(90deg,#059669,#10b981)'

  const circumference = 2 * Math.PI * 26
  const strokeDash    = isOver ? 0 : circumference * (1 - pct / 100)

  // Category chips
  const catMap = {}
  todayExp.forEach((e) => { catMap[e.category] = (catMap[e.category] || 0) + e.amount })
  const topCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 4)

  return (
    <div className={s.page}>

      {/* ── Over-limit banner ── */}
      {isOver && (
        <div className={`${s.overBanner} au`}>
          <span className={s.overBannerIco}>🚨</span>
          <div className={s.overBannerText}>
            <strong>Daily limit exceeded!</strong>
            <span>You went over by <span className={s.overAmt}>{fmt(overBy)}</span> today</span>
          </div>
          <div className={s.overBannerBadge}>+{fmt(overBy)}</div>
        </div>
      )}

      {/* Top bar */}
      <div className={`${s.topbar} au`}>
        <div className={s.brandRow}>
          <img src="/logo.png" alt="Kothay Gelo logo" className={s.logo} />
          <div>
            <p className={s.greeting}>আজকে কোথায় গেলো? 👋</p>
            <h1 className={s.brand}>Kothay <span>Gelo?</span></h1>
          </div>
        </div>
        <div className={s.topBtns}>
          <button className={s.iconBtn} onClick={() => setShowSearch(true)} aria-label="Search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
              <circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/>
            </svg>
          </button>
          <button className={s.iconBtn} onClick={() => setShowShare(true)} aria-label="Share card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16,6 12,2 8,6"/><line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
          </button>
          <button className={s.settingsBtn} onClick={() => goTo('settings')} aria-label="Settings">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06-.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
          </button>
        </div>
      </div>

      {/* ── Hero Budget Card ── */}
      <div className={`${s.hero} au1`} style={isOver ? { borderColor: '#ef444466' } : {}}>
        <div className={s.heroBlob} style={{ background: barColor + '22' }} />

        <div className={s.heroBody}>
          <div className={s.heroLeft}>
            <p className={s.heroLabel}>TODAY'S SPENDING</p>
            <p className={s.heroAmt} style={{ color: barColor }}>{fmt(todayTotal)}</p>

            {/* Over-limit sub vs normal sub */}
            {isOver ? (
              <div className={s.overSubRow}>
                <span className={s.overSubLimit}>limit {fmt(dailyLimit)}</span>
                <span className={s.overSubOver} style={{ color: '#ef4444' }}>
                  +{fmt(overBy)} over 🔴
                </span>
              </div>
            ) : (
              <p className={s.heroSub}>of {fmt(dailyLimit)} daily limit</p>
            )}

            {/* Progress bar */}
            <div className={s.barWrap}>
              <div className={s.barTrack}>
                <div
                  className={`${s.barFill} ${isOver ? s.barOver : ''}`}
                  style={{ width: `${Math.min(pct, 100)}%`, background: barGrad }}
                />
                {!isOver && pct > 0 && pct < 100 && (
                  <div className={s.barDot} style={{ left: `${pct}%`, background: barColor, boxShadow: `0 0 8px ${barColor}` }} />
                )}
              </div>
              <div className={s.barRow}>
                <span>{fmt(todayTotal)} used</span>
                {isOver
                  ? <span style={{ color: '#ef4444', fontWeight: 800 }}>{fmt(overBy)} over limit!</span>
                  : <span style={{ color: barColor }}>{fmt(remaining)} left</span>
                }
              </div>
            </div>
          </div>

          {/* Circle gauge */}
          <div className={s.gauge}>
            <svg viewBox="0 0 60 60" width="70" height="70">
              <circle cx="30" cy="30" r="26" stroke="rgba(255,255,255,.06)" strokeWidth="5" fill="none"/>
              <circle
                cx="30" cy="30" r="26"
                stroke={barColor}
                strokeWidth="5" fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDash}
                transform="rotate(-90 30 30)"
                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1), stroke .5s', filter: `drop-shadow(0 0 6px ${barColor})` }}
              />
            </svg>
            <div className={s.gaugePct} style={{ color: barColor }}>
              {isOver ? '💀' : `${Math.round(pct)}%`}
            </div>
          </div>
        </div>
      </div>

      {/* Insight pill */}
      <div className={`${s.insight} au2`}>
        <span className={s.insIcon}>{icon}</span>
        <span className={s.insMsg}>{msg}</span>
      </div>

      {/* Streak banner */}
      {streak > 0 && (
        <div className={`${s.streakWrap} au2`} onClick={() => goTo('badges')}>
          <StreakBanner streak={streak} />
        </div>
      )}

      {/* Stats row */}
      <div className={`${s.statsRow} au3`}>
        {[
          { label: 'This Week',  val: fmt(weekTotal),     sub: `${weekExp.length} expense${weekExp.length !== 1 ? 's' : ''}` },
          { label: 'This Month', val: fmt(monthTotal),    sub: `${monthExp.length} expense${monthExp.length !== 1 ? 's' : ''}` },
          { label: 'Avg / Day',  val: fmt(weekTotal / 7), sub: 'this week' },
        ].map((st) => (
          <div key={st.label} className={s.statCard}>
            <p className={s.statLbl}>{st.label}</p>
            <p className={s.statVal}>{st.val}</p>
            <p className={s.statSub}>{st.sub}</p>
          </div>
        ))}
      </div>

      {/* Category chips */}
      {topCats.length > 0 && (
        <div className={`${s.chipRow} au4`}>
          {topCats.map(([cat, total]) => {
            const c = CAT_MAP[cat] || CAT_MAP.Other
            return (
              <div key={cat} className={s.chip} style={{ background: c.bg, borderColor: c.color + '55' }}>
                <span className={s.chipIco}>{c.icon}</span>
                <span className={s.chipAmt} style={{ color: c.color }}>{fmt(total)}</span>
                <span className={s.chipLbl}>{c.label}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Badges shortcut */}
      <button className={`${s.badgesBtn} au4`} onClick={() => goTo('badges')}>
        <span>🏆 View Badges & Achievements</span>
        <span className={s.badgesArrow}>›</span>
      </button>

      {/* Recent */}
      <div className={`${s.secHead} au4`}>
        <span className={s.secTitle}>Recent</span>
        <button className={s.secAll} onClick={() => goTo('analytics')}>View all →</button>
      </div>

      <div className={`${s.txList} au5`}>
        {expenses.length === 0 ? (
          <div className={s.empty}>
            <div className={s.emptyIco}>💸</div>
            <p className={s.emptyTitle}>No expenses yet</p>
            <p className={s.emptySub}>Tap <strong>Add Expense</strong> below to get started</p>
          </div>
        ) : (
          expenses.slice(0, 8).map((e, i) => {
            const c = CAT_MAP[e.category] || CAT_MAP.Other
            return (
              <div key={e.id} className={s.tx} style={{ animationDelay: `${i * 0.05}s` }}>
                <div className={s.txIco} style={{ background: c.bg }}>
                  <span>{c.icon}</span>
                </div>
                <div className={s.txMid}>
                  <p className={s.txName}>{e.note}</p>
                  <p className={s.txMeta}>{c.label} · {e.method}</p>
                </div>
                <div className={s.txRight}>
                  <p className={s.txAmt} style={{ color: c.color }}>−{fmt(e.amount)}</p>
                  <p className={s.txTime}>{timeAgo(e.date)}</p>
                </div>
              </div>
            )
          })
        )}
      </div>

      <button className={`${s.addBtn} au5`} onClick={() => goTo('add')}>
        <span className={s.addBtnPlus}>+</span>
        Add Expense
      </button>

      {showSearch && <ExpenseSearch onClose={() => setShowSearch(false)} />}
      {showShare  && <ShareCard     onClose={() => setShowShare(false)} />}
    </div>
  )
}
