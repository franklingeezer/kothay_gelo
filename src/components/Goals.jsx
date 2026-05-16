import { useState } from 'react'
import { useStore } from '../store'
import { fmt, GOAL_COLORS, GOAL_EMOJIS } from '../utils/constants'
import s from './Goals.module.css'

// ── Deposit Modal ──────────────────────────────────────────────────
function DepositModal({ goal, onClose, onDeposit }) {
  const [amount, setAmount] = useState('')
  const remaining = goal.target - goal.saved
  const QUICK = [500, 1000, 2000, 5000].filter((q) => q <= remaining)

  const handleDeposit = () => {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return
    onDeposit(goal.id, Math.min(amt, remaining))
    onClose()
  }

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <div className={s.modalHeader}>
          <span className={s.modalEmoji}>{goal.emoji}</span>
          <div>
            <div className={s.modalTitle}>Add to {goal.title}</div>
            <div className={s.modalSub}>{fmt(goal.saved)} saved · {fmt(remaining)} to go</div>
          </div>
          <button className={s.modalClose} onClick={onClose}>✕</button>
        </div>

        <div className={s.modalTrack}>
          <div
            className={s.modalTrackFill}
            style={{
              width: `${Math.min((goal.saved / goal.target) * 100, 100)}%`,
              background: goal.color
            }}
          />
        </div>

        <div className={s.modalAmtWrap}>
          <span className={s.modalSym}>৳</span>
          <input
            className={s.modalInp}
            type="number" placeholder="0" min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
          />
        </div>

        {QUICK.length > 0 && (
          <div className={s.modalQuick}>
            {QUICK.map((q) => (
              <button
                key={q}
                className={s.modalQuickBtn}
                style={{ borderColor: goal.color + '55', color: goal.color }}
                onClick={() => setAmount(String(q))}
              >
                {fmt(q)}
              </button>
            ))}
            <button
              className={s.modalQuickBtn}
              style={{ borderColor: goal.color + '55', color: goal.color }}
              onClick={() => setAmount(String(remaining))}
            >
              Full
            </button>
          </div>
        )}

        <button
          className={s.modalBtn}
          style={{ background: goal.color, boxShadow: `0 6px 24px ${goal.color}44` }}
          onClick={handleDeposit}
        >
          Deposit {amount ? fmt(parseFloat(amount)) : ''} →
        </button>
      </div>
    </div>
  )
}

// ── Add Goal Modal ─────────────────────────────────────────────────
function AddGoalModal({ onClose, onAdd }) {
  const [title,  setTitle]  = useState('')
  const [target, setTarget] = useState('')
  const [emoji,  setEmoji]  = useState('🎯')
  const [color,  setColor]  = useState(GOAL_COLORS[0])
  const [type,   setType]   = useState('saving')

  const handleAdd = () => {
    if (!title.trim() || !parseFloat(target)) return
    onAdd({ title: title.trim(), target: parseFloat(target), emoji, color, type, sub: type === 'saving' ? 'Savings goal' : 'Spending limit' })
    onClose()
  }

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <div className={s.modalHeader}>
          <span className={s.modalEmoji}>{emoji}</span>
          <div className={s.modalTitle}>New Goal</div>
          <button className={s.modalClose} onClick={onClose}>✕</button>
        </div>

        {/* Emoji picker */}
        <div className={s.emojiGrid}>
          {GOAL_EMOJIS.map((e) => (
            <button
              key={e}
              className={`${s.emojiBtn} ${emoji === e ? s.emojiBtnSel : ''}`}
              onClick={() => setEmoji(e)}
            >{e}</button>
          ))}
        </div>

        {/* Type toggle */}
        <div className={s.typeRow}>
          <button className={`${s.typeBtn} ${type === 'saving' ? s.typeSel : ''}`} onClick={() => setType('saving')}>
            💰 Saving Goal
          </button>
          <button className={`${s.typeBtn} ${type === 'spending' ? s.typeSel : ''}`} onClick={() => setType('spending')}>
            🚫 Spending Limit
          </button>
        </div>

        {/* Name */}
        <input
          className={s.modalField}
          placeholder="Goal name (e.g. Trip to Cox's Bazar)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Target */}
        <div className={s.modalAmtWrap} style={{ marginBottom: 14 }}>
          <span className={s.modalSym}>৳</span>
          <input
            className={s.modalInp}
            type="number" placeholder="Target amount"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
        </div>

        {/* Color */}
        <div className={s.colorRow}>
          {GOAL_COLORS.map((c) => (
            <button
              key={c}
              className={`${s.colorDot} ${color === c ? s.colorDotSel : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>

        <button
          className={s.modalBtn}
          style={{ background: color, boxShadow: `0 6px 24px ${color}44` }}
          onClick={handleAdd}
        >
          Create Goal →
        </button>
      </div>
    </div>
  )
}

// ── Goals Page ─────────────────────────────────────────────────────
export default function Goals({ showToast }) {
  const goals           = useStore((st) => st.goals)
  const addGoal         = useStore((st) => st.addGoal)
  const deleteGoal      = useStore((st) => st.deleteGoal)
  const depositToGoal   = useStore((st) => st.depositToGoal)
  const getMonthExpenses = useStore((st) => st.getMonthExpenses)
  const monthlyBudget   = useStore((st) => st.monthlyBudget)
  const foodBudget      = useStore((st) => st.foodBudget)
  const funBudget       = useStore((st) => st.funBudget)

  const [depositGoal, setDepositGoal] = useState(null)
  const [showAdd,     setShowAdd]     = useState(false)

  const monthExp   = getMonthExpenses()
  const monthTotal = monthExp.reduce((a, e) => a + e.amount, 0)
  const foodTotal  = monthExp.filter((e) => e.category === 'Food' || e.category === 'Groceries').reduce((a, e) => a + e.amount, 0)
  const funTotal   = monthExp.filter((e) => e.category === 'Fun').reduce((a, e) => a + e.amount, 0)

  // Live spending-linked goals
  const getSpent = (g) => {
    if (g.id === 'monthly-budget') return monthTotal
    if (g.id === 'food-budget')    return foodTotal
    if (g.id === 'fun-cap')        return funTotal
    return g.saved
  }

  const getTarget = (g) => {
    if (g.id === 'monthly-budget') return monthlyBudget
    if (g.id === 'food-budget')    return foodBudget
    if (g.id === 'fun-cap')        return funBudget
    return g.target
  }

  const handleDeposit = (id, amount) => {
    depositToGoal(id, amount)
    showToast && showToast(`✅ ${fmt(amount)} added to goal!`)
  }

  const handleDelete = (g) => {
    if (window.confirm(`Delete "${g.title}"?`)) deleteGoal(g.id)
  }

  // Summary stats
  const savingGoals  = goals.filter((g) => g.type === 'saving')
  const totalSaved   = savingGoals.reduce((a, g) => a + g.saved, 0)
  const totalTarget  = savingGoals.reduce((a, g) => a + g.target, 0)

  return (
    <div className={s.page}>
      <div className={`${s.topRow} au`}>
        <div className={s.title}>Goals</div>
        <button className={s.addBtn} onClick={() => setShowAdd(true)}>
          + New Goal
        </button>
      </div>

      {/* Summary card */}
      <div className={`${s.summCard} au1`}>
        <div className={s.summItem}>
          <div className={s.summVal}>{savingGoals.length}</div>
          <div className={s.summLbl}>Saving Goals</div>
        </div>
        <div className={s.summDivider} />
        <div className={s.summItem}>
          <div className={s.summVal}>{fmt(totalSaved)}</div>
          <div className={s.summLbl}>Total Saved</div>
        </div>
        <div className={s.summDivider} />
        <div className={s.summItem}>
          <div className={s.summVal}>{totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%</div>
          <div className={s.summLbl}>Overall</div>
        </div>
      </div>

      {/* Goal cards */}
      {goals.map((g, i) => {
        const spent  = getSpent(g)
        const target = getTarget(g)
        const pct    = Math.min(Math.round((spent / target) * 100), 100)
        const isSaving = g.type === 'saving'
        const barColor = isSaving
          ? (pct >= 100 ? 'var(--gold)' : g.color)
          : (pct > 85 ? 'var(--red)' : pct > 65 ? 'var(--amber)' : g.color)
        const lbl = isSaving
          ? `${fmt(spent)} saved of ${fmt(target)}`
          : `${fmt(spent)} of ${fmt(target)} used`
        const canDeposit = isSaving && pct < 100

        return (
          <div key={g.id} className={`${s.gc} au${Math.min(i + 2, 5)}`}>
            {/* Header */}
            <div className={s.gcHead}>
              <div className={s.gcEmoji}>{g.emoji}</div>
              <div className={s.gcInfo}>
                <div className={s.gcTitle}>{g.title}</div>
                <div className={s.gcSub}>{g.sub}</div>
              </div>
              {pct >= 100 && <span className={s.gcBadge}>🎉 Done!</span>}
              {!g.isDefault && (
                <button className={s.gcDel} onClick={() => handleDelete(g)}>✕</button>
              )}
            </div>

            {/* Progress ring + bar */}
            <div className={s.gcProgress}>
              <div className={s.gcBar}>
                <div
                  className={s.gcBarFill}
                  style={{ width: `${pct}%`, background: barColor }}
                />
              </div>
              <div className={s.gcRow}>
                <span className={s.gcLbl}>{lbl}</span>
                <span className={s.gcPct} style={{ color: barColor }}>{pct}%</span>
              </div>
            </div>

            {/* Deposit button for saving goals */}
            {canDeposit && (
              <button
                className={s.depositBtn}
                style={{ color: g.color, borderColor: g.color + '44', background: g.color + '12' }}
                onClick={() => setDepositGoal(g)}
              >
                <span>+</span> Add Money
              </button>
            )}
            {pct >= 100 && isSaving && (
              <div className={s.gcComplete} style={{ color: 'var(--gold)' }}>
                🌟 Goal reached! Amazing work!
              </div>
            )}
          </div>
        )
      })}

      {/* Add goal card */}
      <button className={`${s.addCard} au5`} onClick={() => setShowAdd(true)}>
        <span className={s.addCardIco}>＋</span>
        <span className={s.addCardTxt}>Create a new goal</span>
        <span className={s.addCardArrow}>→</span>
      </button>

      {/* Modals */}
      {depositGoal && (
        <DepositModal
          goal={depositGoal}
          onClose={() => setDepositGoal(null)}
          onDeposit={handleDeposit}
        />
      )}
      {showAdd && (
        <AddGoalModal
          onClose={() => setShowAdd(false)}
          onAdd={(g) => { addGoal(g); showToast && showToast('✅ Goal created!') }}
        />
      )}
    </div>
  )
}
