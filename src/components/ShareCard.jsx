import { useRef, useState } from 'react'
import { useStore } from '../store'
import { getUserName } from '../lib/supabase'
import { fmt, CAT_MAP } from '../utils/constants'
import s from './ShareCard.module.css'

function drawRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export default function ShareCard({ onClose }) {
  const expenses      = useStore((st) => st.expenses)
  const monthlyBudget = useStore((st) => st.monthlyBudget)
  const canvasRef     = useRef()
  const [generated, setGenerated] = useState(false)
  const [loading,   setLoading]   = useState(false)

  const now        = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthName  = now.toLocaleString('default', { month: 'long', year: 'numeric' })
  const monthExp   = expenses.filter((e) => new Date(e.date) >= monthStart)
  const total      = monthExp.reduce((a, e) => a + e.amount, 0)
  const saved      = Math.max(monthlyBudget - total, 0)
  const pct        = Math.min((total / monthlyBudget) * 100, 100)

  // Category breakdown
  const catMap = {}
  monthExp.forEach((e) => { catMap[e.category] = (catMap[e.category] || 0) + e.amount })
  const topCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 4)

  const generate = () => {
    setLoading(true)
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    const W = 800, H = 500
    canvas.width = W; canvas.height = H

    // Background
    const bg = ctx.createLinearGradient(0, 0, W, H)
    bg.addColorStop(0, '#060610')
    bg.addColorStop(1, '#0f0f28')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    // Purple orb
    const orb = ctx.createRadialGradient(120, 80, 0, 120, 80, 220)
    orb.addColorStop(0, 'rgba(124,58,237,.22)')
    orb.addColorStop(1, 'rgba(124,58,237,0)')
    ctx.fillStyle = orb
    ctx.fillRect(0, 0, W, H)

    // Green orb
    const orb2 = ctx.createRadialGradient(W - 80, H - 60, 0, W - 80, H - 60, 180)
    orb2.addColorStop(0, 'rgba(16,185,129,.14)')
    orb2.addColorStop(1, 'rgba(16,185,129,0)')
    ctx.fillStyle = orb2
    ctx.fillRect(0, 0, W, H)

    // Card border
    ctx.strokeStyle = 'rgba(255,255,255,.08)'
    ctx.lineWidth = 1
    drawRoundRect(ctx, 16, 16, W - 32, H - 32, 28)
    ctx.stroke()

    // Logo + app name
    ctx.font = 'bold 13px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,.4)'
    ctx.fillText('KOTHAY GELO? 💸', 44, 58)

    // Month
    ctx.font = 'bold 15px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,.35)'
    ctx.textAlign = 'right'
    ctx.fillText(monthName.toUpperCase(), W - 44, 58)
    ctx.textAlign = 'left'

    // Name
    const name = getUserName() || 'Your'
    ctx.font = '900 38px sans-serif'
    ctx.fillStyle = '#f0edff'
    ctx.fillText(`${name}'s Monthly Recap`, 44, 110)

    // Big amount
    const grad = ctx.createLinearGradient(44, 130, 350, 200)
    grad.addColorStop(0, '#a78bfa')
    grad.addColorStop(1, '#7c3aed')
    ctx.fillStyle = grad
    ctx.font = '900 72px sans-serif'
    ctx.fillText(fmt(total), 44, 200)

    ctx.font = '600 16px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,.45)'
    ctx.fillText(`spent of ${fmt(monthlyBudget)} budget`, 44, 228)

    // Progress bar
    const BX = 44, BY = 252, BW = W - 88, BH = 10
    drawRoundRect(ctx, BX, BY, BW, BH, 5)
    ctx.fillStyle = 'rgba(255,255,255,.08)'
    ctx.fill()
    const fillW = Math.max(BW * (pct / 100), 0)
    if (fillW > 0) {
      const fillGrad = ctx.createLinearGradient(BX, 0, BX + fillW, 0)
      fillGrad.addColorStop(0, pct > 90 ? '#dc2626' : '#10b981')
      fillGrad.addColorStop(1, pct > 90 ? '#ef4444' : '#34d399')
      drawRoundRect(ctx, BX, BY, fillW, BH, 5)
      ctx.fillStyle = fillGrad
      ctx.fill()
    }

    // Stats row
    const stats = [
      { label: 'Transactions', val: String(monthExp.length) },
      { label: 'Saved',        val: fmt(saved) },
      { label: 'Daily Avg',    val: fmt(total / (now.getDate() || 1)) },
    ]
    stats.forEach((st, i) => {
      const x = 44 + i * 240
      drawRoundRect(ctx, x, 280, 220, 80, 16)
      ctx.fillStyle = 'rgba(255,255,255,.05)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,.08)'
      ctx.lineWidth = 1
      drawRoundRect(ctx, x, 280, 220, 80, 16)
      ctx.stroke()
      ctx.font = '800 24px sans-serif'
      ctx.fillStyle = '#f0edff'
      ctx.fillText(st.val, x + 16, 316)
      ctx.font = '600 12px sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,.4)'
      ctx.fillText(st.label.toUpperCase(), x + 16, 338)
    })

    // Category breakdown
    if (topCats.length > 0) {
      ctx.font = '700 11px sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,.3)'
      ctx.fillText('TOP CATEGORIES', 44, 398)

      topCats.forEach(([cat, amt], i) => {
        const c   = CAT_MAP[cat] || CAT_MAP.Other
        const x   = 44 + i * 185
        const pct = total > 0 ? (amt / total * 100).toFixed(0) : 0
        ctx.font = '700 13px sans-serif'
        ctx.fillStyle = '#f0edff'
        ctx.fillText(`${c.icon} ${cat}`, x, 424)
        ctx.font = '800 15px sans-serif'
        ctx.fillStyle = c.color
        ctx.fillText(fmt(amt), x, 446)
        ctx.font = '600 11px sans-serif'
        ctx.fillStyle = 'rgba(255,255,255,.3)'
        ctx.fillText(`${pct}%`, x, 464)
      })
    }

    setGenerated(true)
    setLoading(false)
  }

  const download = () => {
    const link = document.createElement('a')
    link.download = `kothay-gelo-${monthName.replace(' ', '-')}.png`
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  const share = async () => {
    const canvas = canvasRef.current
    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'spending-summary.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'My Monthly Spending — Kothay Gelo?' })
      } else {
        download()
      }
    })
  }

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <div className={s.modalHandle} />
        <div className={s.modalHeader}>
          <span className={s.modalTitle}>📸 Spending Summary Card</span>
          <button className={s.modalClose} onClick={onClose}>✕</button>
        </div>

        <p className={s.modalSub}>Generate a beautiful summary of your {monthName} spending to share!</p>

        <canvas ref={canvasRef} className={`${s.canvas} ${generated ? s.canvasVisible : ''}`} />

        {!generated ? (
          <button className={s.genBtn} onClick={generate} disabled={loading}>
            {loading ? '⏳ Generating…' : '✨ Generate My Card'}
          </button>
        ) : (
          <div className={s.actionRow}>
            <button className={s.dlBtn}    onClick={download}>⬇️ Download</button>
            <button className={s.shareBtn} onClick={share}>📤 Share</button>
            <button className={s.regenBtn} onClick={generate}>🔄</button>
          </div>
        )}

        <div className={s.statsPreview}>
          <div className={s.statItem}><span className={s.statV}>{fmt(total)}</span><span className={s.statL}>Spent</span></div>
          <div className={s.statItem}><span className={s.statV}>{monthExp.length}</span><span className={s.statL}>Transactions</span></div>
          <div className={s.statItem}><span className={s.statV}>{fmt(saved)}</span><span className={s.statL}>Saved</span></div>
        </div>
      </div>
    </div>
  )
}
