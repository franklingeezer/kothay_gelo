import { useState } from 'react'
import { useStore } from '../store'
import { CATEGORIES, PAYMENT_METHODS, fmt } from '../utils/constants'
import s from './AddExpense.module.css'

export default function AddExpense({ goTo, showToast }) {
  const addExpense = useStore((st) => st.addExpense)
  const [amount, setAmount] = useState('')
  const [cat,    setCat]    = useState('Food')
  const [note,   setNote]   = useState('')
  const [method, setMethod] = useState('Cash')

  const selCat = CATEGORIES.find((c) => c.id === cat) || CATEGORIES[0]
  const QUICK  = [50, 100, 200, 500]

  const handleSave = () => {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) { showToast('⚠️ Enter a valid amount', 'error'); return }
    addExpense({ amount: amt, category: cat, note: note.trim() || cat, method })
    showToast(`✅ ${fmt(amt)} saved under ${cat}`)
    setAmount(''); setNote('')
    goTo('home')
  }

  return (
    <div className={s.page}>
      <p className={`${s.title} au`}>Add Expense</p>

      {/* Amount hero */}
      <div className={`${s.amtHero} au1`} style={{ borderColor: selCat.color + '55' }}>
        <div className={s.amtHeroBg} style={{ background: selCat.color + '18' }} />
        <div className={s.amtCatBadge}>
          <span>{selCat.icon}</span>
          <span style={{ color: selCat.color }}>{selCat.label}</span>
        </div>
        <div className={s.amtRow}>
          <span className={s.amtSym} style={{ color: selCat.color + 'aa' }}>৳</span>
          <input
            className={s.amtInp}
            type="number" placeholder="0" min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ caretColor: selCat.color }}
            autoFocus
          />
        </div>
        <div className={s.quickRow}>
          {QUICK.map((q) => (
            <button
              key={q}
              className={s.quickBtn}
              style={{ borderColor: selCat.color + '55', color: selCat.color, background: selCat.color + '12' }}
              onClick={() => setAmount(String((parseFloat(amount) || 0) + q))}
            >+{q}</button>
          ))}
          {amount && (
            <button className={s.quickBtn} style={{ borderColor: '#ef444455', color: '#ef4444', background: '#ef444412' }} onClick={() => setAmount('')}>Clear</button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="au2">
        <p className={s.flbl}>Category</p>
        <div className={s.catGrid}>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              className={`${s.catBtn} ${cat === c.id ? s.catSel : ''}`}
              style={cat === c.id ? { borderColor: c.color, background: c.bg, boxShadow: `0 4px 16px ${c.color}33` } : {}}
              onClick={() => setCat(c.id)}
            >
              <span className={s.catIco}>{c.icon}</span>
              <span className={s.catLbl} style={cat === c.id ? { color: c.color } : {}}>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className={`${s.fg} au3`}>
        <p className={s.flbl}>Description</p>
        <input
          className={s.finp}
          type="text"
          placeholder="What did you spend on?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {/* Payment method */}
      <div className={`${s.fg} au3`}>
        <p className={s.flbl}>Payment Method</p>
        <div className={s.methodRow}>
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.id}
              className={`${s.methodBtn} ${method === m.id ? s.methodSel : ''}`}
              onClick={() => setMethod(m.id)}
            >{m.label}</button>
          ))}
        </div>
      </div>

      <button className={`${s.saveBtn} au4`} onClick={handleSave}
        style={{ boxShadow: `0 8px 28px ${selCat.color}44` }}>
        <span>Save Expense</span>
        <span className={s.saveBtnArrow}>✓</span>
      </button>
    </div>
  )
}
