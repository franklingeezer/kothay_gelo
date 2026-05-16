import { useState, useMemo } from 'react'
import { useStore } from '../store'
import { fmt } from '../utils/constants'
import s from './Bills.module.css'

const BILL_ICONS = ['📄','💡','💧','📱','🌐','🏠','🚗','📺','🎵','🏋️','📚','💊']
const FREQ_OPTS  = [
  { id: 'monthly',    label: 'Monthly' },
  { id: 'weekly',     label: 'Weekly' },
  { id: 'yearly',     label: 'Yearly' },
  { id: 'quarterly',  label: 'Quarterly' },
]

function daysUntil(dueDateStr) {
  const now  = new Date(); now.setHours(0,0,0,0)
  const due  = new Date(dueDateStr); due.setHours(0,0,0,0)
  return Math.round((due - now) / 86400000)
}

function nextDueLabel(days) {
  if (days < 0)  return { text: `${Math.abs(days)}d overdue`, color: 'var(--red)' }
  if (days === 0) return { text: 'Due today!',  color: 'var(--red)' }
  if (days === 1) return { text: 'Due tomorrow', color: 'var(--amber)' }
  if (days <= 7)  return { text: `In ${days} days`, color: 'var(--amber)' }
  return { text: `In ${days} days`, color: 'var(--muted)' }
}

// ── Add / Edit Modal ──────────────────────────────────────────────
function BillModal({ initial, onClose, onSave }) {
  const [name,   setName]   = useState(initial?.name   || '')
  const [amount, setAmount] = useState(initial?.amount ? String(initial.amount) : '')
  const [icon,   setIcon]   = useState(initial?.icon   || '📄')
  const [freq,   setFreq]   = useState(initial?.frequency || 'monthly')
  const [due,    setDue]    = useState(initial?.due_date ? initial.due_date.slice(0,10) : '')
  const [note,   setNote]   = useState(initial?.note   || '')

  const handleSave = () => {
    const amt = parseFloat(amount)
    if (!name.trim() || !amt || amt <= 0 || !due) return
    onSave({ ...(initial || {}), name: name.trim(), amount: amt, icon, frequency: freq, due_date: due, note: note.trim() })
    onClose()
  }

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <div className={s.modalHandle} />
        <div className={s.modalHeader}>
          <span className={s.modalTitle}>{initial ? 'Edit Bill' : 'Add Bill Reminder'}</span>
          <button className={s.modalClose} onClick={onClose}>✕</button>
        </div>

        {/* Icon picker */}
        <div className={s.iconPicker}>
          {BILL_ICONS.map((ic) => (
            <button key={ic} className={`${s.iconBtn} ${icon === ic ? s.iconBtnOn : ''}`}
              onClick={() => setIcon(ic)}>{ic}</button>
          ))}
        </div>

        <input className={s.minp} type="text" placeholder="Bill name (e.g. Internet)"
          value={name} onChange={(e) => setName(e.target.value)} autoFocus />

        <div className={s.amtWrap}>
          <span className={s.amtSym}>৳</span>
          <input className={s.amtInp} type="number" placeholder="Amount" min="1"
            value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>

        <div className={s.freqRow}>
          {FREQ_OPTS.map((f) => (
            <button key={f.id} className={`${s.freqBtn} ${freq === f.id ? s.freqOn : ''}`}
              onClick={() => setFreq(f.id)}>{f.label}</button>
          ))}
        </div>

        <div className={s.dueGroup}>
          <label className={s.dueLbl}>Next due date</label>
          <input className={s.minp} type="date" value={due}
            onChange={(e) => setDue(e.target.value)} style={{ marginBottom: 0 }} />
        </div>

        <input className={s.minp} type="text" placeholder="Note (optional)"
          value={note} onChange={(e) => setNote(e.target.value)}
          style={{ marginTop: 10 }} />

        <button className={s.saveBtn} onClick={handleSave}
          disabled={!name.trim() || !amount || !due}>
          {initial ? 'Save Changes ✓' : 'Add Bill Reminder ✓'}
        </button>
      </div>
    </div>
  )
}

// ── Bill Card ─────────────────────────────────────────────────────
function BillCard({ bill, onEdit, onDelete, onPay }) {
  const days    = daysUntil(bill.due_date)
  const { text, color } = nextDueLabel(days)
  const isUrgent = days <= 3

  return (
    <div className={`${s.card} ${isUrgent ? s.cardUrgent : ''}`}>
      <div className={s.cardLeft}>
        <div className={s.billIcon} style={{ background: isUrgent ? 'rgba(239,68,68,.12)' : 'var(--s3)' }}>
          {bill.icon}
        </div>
        <div className={s.cardInfo}>
          <div className={s.cardName}>{bill.name}</div>
          <div className={s.cardMeta}>
            <span style={{ color }} className={s.dueTag}>{text}</span>
            <span className={s.dot}>·</span>
            <span>{FREQ_OPTS.find(f => f.id === bill.frequency)?.label || 'Monthly'}</span>
            {bill.note && <><span className={s.dot}>·</span><span>{bill.note}</span></>}
          </div>
        </div>
      </div>
      <div className={s.cardRight}>
        <div className={s.cardAmt}>{fmt(bill.amount)}</div>
        <div className={s.cardBtns}>
          <button className={s.payBtn} onClick={() => onPay(bill)}>✓ Paid</button>
          <button className={s.editBtn} onClick={() => onEdit(bill)}>✏️</button>
          <button className={s.delBtn} onClick={() => onDelete(bill.id)}>🗑️</button>
        </div>
      </div>
    </div>
  )
}

// ── Main Bills Page ───────────────────────────────────────────────
export default function Bills({ showToast }) {
  const bills     = useStore((st) => st.bills)
  const addBill   = useStore((st) => st.addBill)
  const updateBill = useStore((st) => st.updateBill)
  const deleteBill = useStore((st) => st.deleteBill)
  const payBill    = useStore((st) => st.payBill)

  const [showModal, setShowModal] = useState(false)
  const [editBill,  setEditBill]  = useState(null)

  const sorted = useMemo(() =>
    [...bills].sort((a, b) => daysUntil(a.due_date) - daysUntil(b.due_date)),
    [bills]
  )

  const overdue  = sorted.filter((b) => daysUntil(b.due_date) < 0)
  const upcoming = sorted.filter((b) => daysUntil(b.due_date) >= 0 && daysUntil(b.due_date) <= 7)
  const later    = sorted.filter((b) => daysUntil(b.due_date) > 7)

  const totalMonthly = bills.reduce((a, b) => {
    if (b.frequency === 'monthly')   return a + b.amount
    if (b.frequency === 'weekly')    return a + b.amount * 4.33
    if (b.frequency === 'yearly')    return a + b.amount / 12
    if (b.frequency === 'quarterly') return a + b.amount / 3
    return a
  }, 0)

  const handleSave = (bill) => {
    if (bill.id) { updateBill(bill); showToast('✅ Bill updated!') }
    else         { addBill(bill);    showToast('✅ Bill reminder added!') }
  }

  const handleDelete = (id) => {
    if (window.confirm('Remove this bill reminder?')) {
      deleteBill(id); showToast('🗑️ Removed')
    }
  }

  const handlePay = (bill) => {
    // Mark as paid — advance due date by frequency
    payBill(bill.id)
    showToast(`✅ ${bill.name} marked as paid!`)
  }

  const openAdd  = () => { setEditBill(null); setShowModal(true) }
  const openEdit = (b) => { setEditBill(b);   setShowModal(true) }

  const Section = ({ title, items, color }) => items.length === 0 ? null : (
    <div className={s.section}>
      <div className={s.sectionHead} style={{ color }}>{title}</div>
      {items.map((b) => (
        <BillCard key={b.id} bill={b}
          onEdit={openEdit} onDelete={handleDelete} onPay={handlePay} />
      ))}
    </div>
  )

  return (
    <div className={s.page}>
      <div className={`${s.topRow} au`}>
        <div className={s.title}>Bills</div>
        <button className={s.addTopBtn} onClick={openAdd}>+ Add</button>
      </div>

      {/* Summary */}
      <div className={`${s.summCard} au1`}>
        <div className={s.summItem}>
          <div className={s.summVal}>{bills.length}</div>
          <div className={s.summLbl}>Total Bills</div>
        </div>
        <div className={s.summDivider} />
        <div className={s.summItem}>
          <div className={s.summVal} style={{ color: 'var(--red)' }}>{overdue.length}</div>
          <div className={s.summLbl}>Overdue</div>
        </div>
        <div className={s.summDivider} />
        <div className={s.summItem}>
          <div className={s.summVal} style={{ color: 'var(--amber)' }}>{upcoming.length}</div>
          <div className={s.summLbl}>Due This Week</div>
        </div>
        <div className={s.summDivider} />
        <div className={s.summItem}>
          <div className={s.summVal} style={{ color: 'var(--violet2)' }}>{fmt(totalMonthly)}</div>
          <div className={s.summLbl}>Monthly Cost</div>
        </div>
      </div>

      {bills.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyIco}>📄</div>
          <div className={s.emptyTitle}>No bill reminders yet</div>
          <p className={s.emptySub}>Add your recurring bills so you never miss a payment</p>
          <button className={s.emptyBtn} onClick={openAdd}>+ Add First Bill</button>
        </div>
      ) : (
        <>
          <Section title="⚠️ Overdue"      items={overdue}  color="var(--red)" />
          <Section title="📅 Due This Week" items={upcoming} color="var(--amber)" />
          <Section title="🗓️ Later"         items={later}    color="var(--muted)" />
        </>
      )}

      <button className={`${s.fab} au5`} onClick={openAdd}>
        <span style={{ fontSize: 22, fontWeight: 300 }}>+</span>
        Add Bill
      </button>

      {showModal && (
        <BillModal initial={editBill} onClose={() => setShowModal(false)} onSave={handleSave} />
      )}
    </div>
  )
}
