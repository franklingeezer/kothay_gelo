import { useState, useMemo } from 'react'
import { useStore } from '../store'
import { fmt } from '../utils/constants'
import s from './Loans.module.css'

// ── Helpers ───────────────────────────────────────────────────────
function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function daysSince(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.floor(diff / 86400000)
}

// ── Add / Edit Loan Modal ─────────────────────────────────────────
function LoanModal({ initial, onClose, onSave }) {
  const [name,   setName]   = useState(initial?.name   || '')
  const [amount, setAmount] = useState(initial?.amount ? String(initial.amount) : '')
  const [note,   setNote]   = useState(initial?.note   || '')
  const [ltype,  setLtype]  = useState(initial?.type   || 'owed')
  const [due,    setDue]    = useState(initial?.due_date ? initial.due_date.slice(0,10) : '')

  const handleSave = () => {
    const amt = parseFloat(amount)
    if (!name.trim() || !amt || amt <= 0) return
    onSave({
      ...(initial || {}),
      name:     name.trim(),
      amount:   amt,
      note:     note.trim() || 'Loan',
      type:     ltype,
      due_date: due || null,
    })
    onClose()
  }

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <div className={s.modalHandle} />
        <div className={s.modalHeader}>
          <span className={s.modalTitle}>{initial ? 'Edit Loan' : 'Add Loan'}</span>
          <button className={s.modalClose} onClick={onClose}>✕</button>
        </div>

        <div className={s.typeRow}>
          <button
            className={`${s.typeBtn} ${ltype === 'owed' ? s.typeBtnGreen : ''}`}
            onClick={() => setLtype('owed')}
          >🤝 They owe me</button>
          <button
            className={`${s.typeBtn} ${ltype === 'owe' ? s.typeBtnRed : ''}`}
            onClick={() => setLtype('owe')}
          >💸 I owe them</button>
        </div>

        <input
          className={s.minp}
          type="text"
          placeholder="Person's name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <div className={s.amtWrap}>
          <span className={s.amtSym}>৳</span>
          <input
            className={s.amtInp}
            type="number"
            placeholder="0"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <input
          className={s.minp}
          type="text"
          placeholder="Note (e.g. Lunch, Bus fare)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className={s.dueRow}>
          <label className={s.dueLbl}>Due date (optional)</label>
          <input
            className={s.minp}
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            style={{ marginBottom: 0 }}
          />
        </div>

        <button
          className={s.saveBtn}
          style={{ background: ltype === 'owed' ? 'var(--green)' : 'var(--red)' }}
          onClick={handleSave}
        >
          {initial ? 'Save Changes ✓' : `Add — ${ltype === 'owed' ? 'They owe me' : 'I owe them'} ✓`}
        </button>
      </div>
    </div>
  )
}

// ── Loan Card ─────────────────────────────────────────────────────
function LoanCard({ loan, onSettle, onDelete, onEdit }) {
  const isOwed = loan.type === 'owed'
  const color  = isOwed ? 'var(--green)' : 'var(--red)'
  const bgCol  = isOwed ? 'rgba(16,185,129,.12)' : 'rgba(239,68,68,.12)'
  const days   = daysSince(loan.date)

  const isOverdue = loan.due_date && !loan.settled && new Date(loan.due_date) < new Date()
  const dueSoon   = loan.due_date && !loan.settled && !isOverdue && daysSince(loan.due_date) > -8

  return (
    <div className={`${s.card} ${loan.settled ? s.cardSettled : ''} ${isOverdue ? s.cardOverdue : ''}`}>
      <div className={s.cardTop}>
        <div className={s.cardLeft}>
          <div className={s.avatar} style={{ background: bgCol, color }}>
            {loan.name.charAt(0).toUpperCase()}
          </div>
          <div className={s.cardInfo}>
            <div className={s.cardName}>
              {loan.name}
              {loan.settled && <span className={s.settledBadge}>Settled ✓</span>}
              {isOverdue   && <span className={s.overdueBadge}>Overdue!</span>}
              {dueSoon     && !isOverdue && <span className={s.soonBadge}>Due soon</span>}
            </div>
            <div className={s.cardMeta}>
              {loan.note}
              {loan.due_date && (
                <span style={{ color: isOverdue ? 'var(--red)' : 'var(--muted)' }}>
                  {' '}· Due {fmtDate(loan.due_date)}
                </span>
              )}
            </div>
            <div className={s.cardAge}>{fmtDate(loan.date)} · {days === 0 ? 'Today' : `${days}d ago`}</div>
          </div>
        </div>
        <div className={s.cardRight}>
          <div className={s.cardAmt} style={{ color }}>{fmt(loan.amount)}</div>
          <div className={s.cardActions}>
            {!loan.settled ? (
              <>
                <button
                  className={s.settleBtn}
                  style={{ color, borderColor: color + '44', background: bgCol }}
                  onClick={() => onSettle(loan.id)}
                >Settle</button>
                <button className={s.editBtn} onClick={() => onEdit(loan)}>✏️</button>
              </>
            ) : (
              <button className={s.deleteBtn} onClick={() => onDelete(loan.id)}>Remove</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Person Summary Row ────────────────────────────────────────────
function PersonRow({ person, loans, onSettle }) {
  const active  = loans.filter((l) => !l.settled)
  const total   = active.reduce((a, l) => a + l.amount, 0)
  const isOwed  = loans[0]?.type === 'owed'
  const color   = isOwed ? 'var(--green)' : 'var(--red)'
  const bgCol   = isOwed ? 'rgba(16,185,129,.12)' : 'rgba(239,68,68,.12)'
  const hasOver = active.some((l) => l.due_date && new Date(l.due_date) < new Date())

  return (
    <div className={s.personRow}>
      <div className={s.avatar} style={{ background: bgCol, color }}>{person.charAt(0).toUpperCase()}</div>
      <div className={s.personInfo}>
        <div className={s.personName}>
          {person}
          {hasOver && <span className={s.overdueBadge}>Overdue!</span>}
        </div>
        <div className={s.personMeta}>{active.length} active loan{active.length !== 1 ? 's' : ''}</div>
      </div>
      <div className={s.personAmt} style={{ color }}>{fmt(total)}</div>
    </div>
  )
}

// ── Main Loans Page ───────────────────────────────────────────────
export default function Loans({ showToast }) {
  const loans       = useStore((st) => st.loans)
  const addLoan     = useStore((st) => st.addLoan)
  const settleLoan  = useStore((st) => st.settleLoan)
  const deleteLoan  = useStore((st) => st.deleteLoan)

  const [tab,      setTab]      = useState('owed')    // 'owed' | 'owe'
  const [view,     setView]     = useState('list')    // 'list' | 'people'
  const [filter,   setFilter]   = useState('active')  // 'active' | 'settled'
  const [showModal, setShowModal] = useState(false)
  const [editLoan,  setEditLoan]  = useState(null)    // loan to edit, or null for add
  const [search,   setSearch]   = useState('')

  // ── Aggregates ──────────────────────────────────────────────────
  const activeLoan    = useMemo(() => loans.filter((l) => !l.settled), [loans])
  const totalOwed     = useMemo(() => activeLoan.filter((l) => l.type === 'owed').reduce((a, l) => a + l.amount, 0), [activeLoan])
  const totalOwe      = useMemo(() => activeLoan.filter((l) => l.type === 'owe').reduce((a, l)  => a + l.amount, 0), [activeLoan])
  const net           = totalOwed - totalOwe
  const overdueLoans  = useMemo(() =>
    activeLoan.filter((l) => l.due_date && new Date(l.due_date) < new Date()),
    [activeLoan]
  )

  // ── Filtered list ────────────────────────────────────────────────
  const visible = useMemo(() => {
    let list = loans.filter((l) =>
      l.type === tab && (filter === 'active' ? !l.settled : l.settled)
    )
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((l) => l.name.toLowerCase().includes(q) || l.note?.toLowerCase().includes(q))
    }
    return list
  }, [loans, tab, filter, search])

  // ── People grouping ──────────────────────────────────────────────
  const peopleGroups = useMemo(() => {
    const map = {}
    activeLoan.filter((l) => l.type === tab).forEach((l) => {
      if (!map[l.name]) map[l.name] = []
      map[l.name].push(l)
    })
    return Object.entries(map).sort((a, b) =>
      b[1].reduce((s, l) => s + l.amount, 0) - a[1].reduce((s, l) => s + l.amount, 0)
    )
  }, [activeLoan, tab])

  // ── Handlers ────────────────────────────────────────────────────
  const handleAdd = (loan) => {
    if (loan.id) {
      // Edit — for simplicity, delete + re-add (id changes are fine here)
      deleteLoan(loan.id)
      addLoan({ name: loan.name, amount: loan.amount, note: loan.note, type: loan.type, due_date: loan.due_date })
      showToast('✅ Loan updated!')
    } else {
      addLoan(loan)
      showToast(`✅ Loan added — ${fmt(loan.amount)}`)
    }
  }

  const handleSettle = (id) => {
    settleLoan(id)
    showToast('✅ Marked as settled!')
  }

  const handleDelete = (id) => {
    if (window.confirm('Remove this loan record?')) {
      deleteLoan(id)
      showToast('🗑️ Removed')
    }
  }

  const openAdd  = () => { setEditLoan(null); setShowModal(true) }
  const openEdit = (loan) => { setEditLoan(loan); setShowModal(true) }

  return (
    <div className={s.page}>
      {/* Header */}
      <div className={`${s.topRow} au`}>
        <div className={s.title}>Loans</div>
        <button className={s.addTopBtn} onClick={openAdd}>+ Add</button>
      </div>

      {/* Overdue alert */}
      {overdueLoans.length > 0 && (
        <div className={`${s.overdueAlert} au`}>
          ⚠️ {overdueLoans.length} overdue loan{overdueLoans.length > 1 ? 's' : ''}
          {' '}— {overdueLoans.map((l) => l.name).join(', ')}
        </div>
      )}

      {/* Summary cards */}
      <div className={`${s.summRow} au1`}>
        <div className={`${s.summCard} ${tab === 'owed' ? s.summCardActive : ''}`}
          onClick={() => { setTab('owed'); setFilter('active') }}>
          <div className={s.summLbl}>They owe me</div>
          <div className={s.summVal} style={{ color: 'var(--green)' }}>{fmt(totalOwed)}</div>
          <div className={s.summCount}>{activeLoan.filter((l) => l.type === 'owed').length} active</div>
        </div>
        <div className={`${s.summCard} ${tab === 'owe' ? s.summCardActive : ''}`}
          onClick={() => { setTab('owe'); setFilter('active') }}>
          <div className={s.summLbl}>I owe</div>
          <div className={s.summVal} style={{ color: 'var(--red)' }}>{fmt(totalOwe)}</div>
          <div className={s.summCount}>{activeLoan.filter((l) => l.type === 'owe').length} active</div>
        </div>
      </div>

      {/* Net balance */}
      <div className={`${s.netCard} au2`}>
        <div>
          <div className={s.netLbl}>Net Balance</div>
          <div className={s.netHint}>{net >= 0 ? 'In your favor' : 'You owe more overall'}</div>
        </div>
        <div className={s.netVal} style={{ color: net >= 0 ? 'var(--green)' : 'var(--red)' }}>
          {net >= 0 ? '+' : ''}{fmt(Math.abs(net))}
        </div>
      </div>

      {/* View toggle + Tabs */}
      <div className={`${s.controlRow} au3`}>
        <div className={s.tabs}>
          <button className={`${s.tabBtn} ${tab === 'owed' ? s.tabOwed : ''}`}
            onClick={() => setTab('owed')}>🤝 They Owe Me</button>
          <button className={`${s.tabBtn} ${tab === 'owe' ? s.tabOwe : ''}`}
            onClick={() => setTab('owe')}>💸 I Owe</button>
        </div>
        <div className={s.viewToggle}>
          <button className={`${s.viewBtn} ${view === 'list' ? s.viewOn : ''}`} onClick={() => setView('list')}>☰</button>
          <button className={`${s.viewBtn} ${view === 'people' ? s.viewOn : ''}`} onClick={() => setView('people')}>👥</button>
        </div>
      </div>

      {/* Filter row + search */}
      <div className={`${s.filterSearchRow} au3`}>
        <div className={s.filterRow}>
          <button className={`${s.filterBtn} ${filter === 'active' ? s.filterOn : ''}`}
            onClick={() => setFilter('active')}>Active</button>
          <button className={`${s.filterBtn} ${filter === 'settled' ? s.filterOn : ''}`}
            onClick={() => setFilter('settled')}>Settled</button>
        </div>
        <input
          className={s.searchInp}
          type="text"
          placeholder="🔍 Search name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* People view */}
      {view === 'people' && filter === 'active' ? (
        <div className={`${s.list} au4`}>
          {peopleGroups.length === 0 ? (
            <div className={s.empty}>
              <div className={s.emptyIco}>{tab === 'owed' ? '🤝' : '💸'}</div>
              <div className={s.emptyTitle}>No active loans</div>
              <p className={s.emptySub}>Tap + Add to record one</p>
            </div>
          ) : (
            peopleGroups.map(([name, group]) => (
              <PersonRow key={name} person={name} loans={group} onSettle={handleSettle} />
            ))
          )}
        </div>
      ) : (
        /* List view */
        <div className={`${s.list} au4`}>
          {visible.length === 0 ? (
            <div className={s.empty}>
              <div className={s.emptyIco}>{filter === 'settled' ? '✅' : tab === 'owed' ? '🤝' : '💸'}</div>
              <div className={s.emptyTitle}>
                {search.trim()
                  ? 'No results found'
                  : filter === 'settled'
                  ? 'No settled loans yet'
                  : tab === 'owed'
                  ? 'No one owes you right now'
                  : "You don't owe anyone"}
              </div>
              <p className={s.emptySub}>{filter === 'active' && !search.trim() && 'Tap + Add to record a loan'}</p>
            </div>
          ) : (
            visible.map((l) => (
              <LoanCard
                key={l.id}
                loan={l}
                onSettle={handleSettle}
                onDelete={handleDelete}
                onEdit={openEdit}
              />
            ))
          )}
        </div>
      )}

      {/* FAB */}
      <button className={`${s.fab} au5`} onClick={openAdd}>
        <span style={{ fontSize: 22, fontWeight: 300 }}>+</span>
        Add Loan
      </button>

      {showModal && (
        <LoanModal
          initial={editLoan}
          onClose={() => setShowModal(false)}
          onSave={handleAdd}
        />
      )}
    </div>
  )
}
