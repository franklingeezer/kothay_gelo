import { useState } from 'react'
import { useStore } from '../store'
import { CAT_MAP, fmt, fmtShort } from '../utils/constants'
import {
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie
} from 'recharts'
import s from './Analytics.module.css'

const PERIODS = [
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'all', label: 'All' },
]

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return <div className={s.tooltip}>{fmt(payload[0].value)}</div>
  }
  return null
}

export default function Analytics() {
  const expenses = useStore((st) => st.expenses)
  const [period, setPeriod] = useState('week')
  const [activeTab, setActiveTab] = useState('overview') // overview | transactions

  const now = new Date()

  const filtered = (() => {
    if (period === 'week') {
      const s = new Date(now); s.setDate(now.getDate() - 6); s.setHours(0,0,0,0)
      return expenses.filter((e) => new Date(e.date) >= s)
    }
    if (period === 'month') {
      return expenses.filter((e) => new Date(e.date) >= new Date(now.getFullYear(), now.getMonth(), 1))
    }
    return expenses
  })()

  const total   = filtered.reduce((a, e) => a + e.amount, 0)
  const avg     = filtered.length ? total / filtered.length : 0
  const biggest = filtered.length ? Math.max(...filtered.map((e) => e.amount)) : 0

  // 7-day bar data
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now); d.setDate(now.getDate() - (6 - i))
    const label = d.toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 2)
    const tot = expenses
      .filter((e) => new Date(e.date).toDateString() === d.toDateString())
      .reduce((a, e) => a + e.amount, 0)
    return { label, tot, isToday: i === 6 }
  })

  // Category breakdown
  const catMap = {}
  filtered.forEach((e) => { catMap[e.category] = (catMap[e.category] || 0) + e.amount })
  const catData = Object.entries(catMap)
    .map(([cat, val]) => ({ cat, val, info: CAT_MAP[cat] || CAT_MAP.Other }))
    .sort((a, b) => b.val - a.val)

  return (
    <div className={s.page}>
      <div className={`${s.title} au`}>Analytics</div>

      {/* Period tabs */}
      <div className={`${s.ptabs} au1`}>
        {PERIODS.map((p) => (
          <button
            key={p.id}
            className={`${s.ptab} ${period === p.id ? s.ptabOn : ''}`}
            onClick={() => setPeriod(p.id)}
          >{p.label}</button>
        ))}
      </div>

      {/* KPI row */}
      <div className={`${s.kpiRow} au2`}>
        <div className={s.kpi}>
          <div className={s.kpiVal}>{fmtShort(total)}</div>
          <div className={s.kpiLbl}>Total</div>
        </div>
        <div className={s.kpiDiv} />
        <div className={s.kpi}>
          <div className={s.kpiVal}>{filtered.length}</div>
          <div className={s.kpiLbl}>Transactions</div>
        </div>
        <div className={s.kpiDiv} />
        <div className={s.kpi}>
          <div className={s.kpiVal}>{fmtShort(avg)}</div>
          <div className={s.kpiLbl}>Avg/Txn</div>
        </div>
        <div className={s.kpiDiv} />
        <div className={s.kpi}>
          <div className={s.kpiVal}>{fmtShort(biggest)}</div>
          <div className={s.kpiLbl}>Biggest</div>
        </div>
      </div>

      {/* View tabs */}
      <div className={`${s.viewTabs} au3`}>
        <button className={`${s.viewTab} ${activeTab === 'overview' ? s.viewOn : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={`${s.viewTab} ${activeTab === 'transactions' ? s.viewOn : ''}`} onClick={() => setActiveTab('transactions')}>Transactions</button>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Bar chart */}
          <div className={`${s.cw} au3`}>
            <div className={s.cwt}>Daily Spending</div>
            <ResponsiveContainer width="100%" height={110}>
              <BarChart data={days} barSize={24} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 600, fontFamily: 'Outfit' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar dataKey="tot" radius={[5, 5, 0, 0]}>
                  {days.map((d, i) => (
                    <Cell key={i} fill={d.isToday ? 'var(--violet)' : 'var(--s4)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie + breakdown */}
          <div className={`${s.cw} au4`}>
            <div className={s.cwt}>By Category</div>
            {catData.length === 0 ? (
              <div className={s.noData}>No data for this period</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie data={catData} dataKey="val" nameKey="cat" cx="50%" cy="50%" innerRadius={34} outerRadius={54} paddingAngle={2}>
                      {catData.map((d, i) => <Cell key={i} fill={d.info.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: 'var(--s3)', border: '1px solid var(--bd)', borderRadius: 10, color: 'var(--txt)', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className={s.catList}>
                  {catData.map((d) => {
                    const pct = Math.round((d.val / total) * 100)
                    return (
                      <div key={d.cat} className={s.catRow}>
                        <div className={s.catIco} style={{ background: d.info.bg }}>{d.info.icon}</div>
                        <div className={s.catInfo}>
                          <div className={s.catName}>{d.cat} <span className={s.catPct}>{pct}%</span></div>
                          <div className={s.catBar}><div className={s.catBarFill} style={{ width: `${pct}%`, background: d.info.color }} /></div>
                        </div>
                        <div className={s.catAmt} style={{ color: d.info.color }}>{fmt(d.val)}</div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </>
      )}

      {activeTab === 'transactions' && (
        <div className={`${s.txSection} au3`}>
          {filtered.length === 0 ? (
            <div className={s.noData}>No transactions this period</div>
          ) : (
            filtered.map((e) => {
              const c = CAT_MAP[e.category] || CAT_MAP.Other
              const d = new Date(e.date)
              const lbl = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
              return (
                <div key={e.id} className={s.tx}>
                  <div className={s.txIco} style={{ background: c.bg }}>{c.icon}</div>
                  <div className={s.txMid}>
                    <div className={s.txName}>{e.note}</div>
                    <div className={s.txMeta}>{lbl} · {e.method}</div>
                  </div>
                  <div className={s.txAmt} style={{ color: c.color }}>{fmt(e.amount)}</div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
