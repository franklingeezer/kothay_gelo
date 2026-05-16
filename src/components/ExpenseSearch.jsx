import { useState, useMemo, useEffect, useRef } from 'react'
import { useStore } from '../store'
import { fmt, CAT_MAP, CATEGORIES, timeAgo } from '../utils/constants'
import s from './ExpenseSearch.module.css'

export default function ExpenseSearch({ onClose }) {
  const expenses   = useStore((st) => st.expenses)
  const deleteExpense = useStore((st) => st.deleteExpense)

  const [query,   setQuery]   = useState('')
  const [catFilter, setCat]   = useState('all')
  const [sort,    setSort]    = useState('newest')
  const inputRef = useRef()

  useEffect(() => { inputRef.current?.focus() }, [])

  const results = useMemo(() => {
    let list = [...expenses]
    const q  = query.trim().toLowerCase()
    if (q)             list = list.filter((e) => e.note?.toLowerCase().includes(q) || e.category?.toLowerCase().includes(q) || e.method?.toLowerCase().includes(q))
    if (catFilter !== 'all') list = list.filter((e) => e.category === catFilter)
    if (sort === 'newest')   list.sort((a, b) => new Date(b.date) - new Date(a.date))
    if (sort === 'oldest')   list.sort((a, b) => new Date(a.date) - new Date(b.date))
    if (sort === 'highest')  list.sort((a, b) => b.amount - a.amount)
    if (sort === 'lowest')   list.sort((a, b) => a.amount - b.amount)
    return list
  }, [expenses, query, catFilter, sort])

  const total = results.reduce((a, e) => a + e.amount, 0)

  const handleDelete = (id) => {
    if (window.confirm('Delete this expense?')) deleteExpense(id)
  }

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.panel} onClick={(e) => e.stopPropagation()}>
        <div className={s.panelHandle} />

        {/* Search bar */}
        <div className={s.searchBar}>
          <span className={s.searchIco}>🔍</span>
          <input
            ref={inputRef}
            className={s.searchInp}
            type="text"
            placeholder="Search expenses…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className={s.clearBtn} onClick={() => setQuery('')}>✕</button>
          )}
          <button className={s.closeBtn} onClick={onClose}>Done</button>
        </div>

        {/* Category filter */}
        <div className={s.catScroll}>
          <button
            className={`${s.catChip} ${catFilter === 'all' ? s.catOn : ''}`}
            onClick={() => setCat('all')}
          >All</button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              className={`${s.catChip} ${catFilter === c.id ? s.catOn : ''}`}
              onClick={() => setCat(c.id)}
              style={catFilter === c.id ? { borderColor: c.color, color: c.color, background: c.bg } : {}}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        {/* Sort + result count */}
        <div className={s.controlRow}>
          <span className={s.resultCount}>
            {results.length} result{results.length !== 1 ? 's' : ''} · {fmt(total)}
          </span>
          <select className={s.sortSelect} value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="highest">Highest amount</option>
            <option value="lowest">Lowest amount</option>
          </select>
        </div>

        {/* Results */}
        <div className={s.results}>
          {results.length === 0 ? (
            <div className={s.empty}>
              <div className={s.emptyIco}>🔍</div>
              <div className={s.emptyTitle}>No results found</div>
              <p className={s.emptySub}>Try a different search or filter</p>
            </div>
          ) : (
            results.map((e) => {
              const c = CAT_MAP[e.category] || CAT_MAP.Other
              return (
                <div key={e.id} className={s.row}>
                  <div className={s.rowIco} style={{ background: c.bg }}>
                    <span>{c.icon}</span>
                  </div>
                  <div className={s.rowMid}>
                    <div className={s.rowNote}>{e.note}</div>
                    <div className={s.rowMeta}>
                      {c.label} · {e.method} · {timeAgo(e.date)}
                    </div>
                  </div>
                  <div className={s.rowRight}>
                    <div className={s.rowAmt} style={{ color: c.color }}>−{fmt(e.amount)}</div>
                    <button className={s.rowDel} onClick={() => handleDelete(e.id)}>🗑️</button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
