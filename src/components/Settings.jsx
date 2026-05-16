import { useState, createContext, useContext, useEffect, useRef } from 'react'
import { useStore, getUserId, getUserName, setUserName } from '../store'
import { db, getAvatar, setAvatar } from '../lib/supabase'
import { hasPin, removePin, clearUnlocked, SetupPinModal, getLockTimer, setLockTimer } from './PinLock'
import { fmt } from '../utils/constants'
import styles from './Settings.module.css'

// ── Theme context ─────────────────────────────────────────────────
const ThemeCtx = createContext()
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('kg_theme') || 'dark')
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('kg_theme', theme)
  }, [theme])
  return (
    <ThemeCtx.Provider value={{ theme, toggle: () => setTheme((t) => t === 'dark' ? 'light' : 'dark') }}>
      {children}
    </ThemeCtx.Provider>
  )
}
export const useTheme = () => useContext(ThemeCtx)

// ── Helpers ───────────────────────────────────────────────────────
function PreviewBar({ label, spent, limit, color }) {
  const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
  const col = pct > 85 ? 'var(--red)' : pct > 60 ? 'var(--amber)' : color || 'var(--green)'
  return (
    <div className={styles.preview}>
      <div className={styles.previewTop}>
        <span className={styles.previewLabel}>{label}</span>
        <span className={styles.previewLimit} style={{ color: col }}>{fmt(limit)}</span>
      </div>
      <div className={styles.track}>
        <div className={styles.trackFill} style={{ width: `${pct}%`, background: col }} />
      </div>
      <div className={styles.trackRow}>
        <span>{fmt(spent)} used</span>
        <span style={{ color: col }}>{fmt(Math.max(limit - spent, 0))} left · {Math.round(pct)}%</span>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, min = 100 }) {
  return (
    <div className={styles.inputRow}>
      <span className={styles.inputLabel}>{label}</span>
      <div className={styles.inputWrap}>
        <span className={styles.sym}>৳</span>
        <input className={styles.inp} type="number" value={value} min={min}
          onChange={(e) => onChange(Number(e.target.value))} />
      </div>
    </div>
  )
}

function Toggle({ label, sub, defaultOn = true }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className={styles.toggleRow}>
      <div>
        <div className={styles.toggleTitle}>{label}</div>
        <div className={styles.toggleSub}>{sub}</div>
      </div>
      <button className={`${styles.toggle} ${on ? styles.toggleOn : ''}`} onClick={() => setOn(!on)} />
    </div>
  )
}

// ── Change Password Modal ─────────────────────────────────────────
function ChangePasswordModal({ onClose, showToast }) {
  const [cur,  setCur]  = useState('')
  const [next, setNext] = useState('')
  const [conf, setConf] = useState('')
  const [err,  setErr]  = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)

  const handle = async () => {
    if (!cur || !next || !conf) { setErr('Fill in all fields.'); return }
    if (next.length < 4)        { setErr('New password must be at least 4 characters.'); return }
    if (next !== conf)          { setErr('New passwords don\'t match.'); return }
    setBusy(true); setErr('')
    const result = await db.changePassword(cur, next)
    setBusy(false)
    if (result === 'wrong_password') { setErr('Current password is incorrect.'); return }
    if (result === 'error')          { setErr('Something went wrong. Try again.'); return }
    showToast('✅ Password changed!')
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHandle} />
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>Change Password</span>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        {[
          { label: 'Current password', val: cur, set: setCur },
          { label: 'New password',     val: next, set: setNext },
          { label: 'Confirm new',      val: conf, set: setConf },
        ].map(({ label, val, set }) => (
          <div key={label} className={styles.mfieldGroup}>
            <label className={styles.mlbl}>{label}</label>
            <div className={styles.mpassWrap}>
              <input className={`${styles.minp} ${styles.minpPass}`}
                type={show ? 'text' : 'password'} value={val}
                onChange={(e) => set(e.target.value)} placeholder="••••••••" />
            </div>
          </div>
        ))}
        <button className={styles.showPassBtn} onClick={() => setShow(!show)}>
          {show ? '🙈 Hide' : '👁️ Show'} passwords
        </button>
        {err && <div className={styles.merror}>⚠️ {err}</div>}
        <button className={styles.mactionBtn} onClick={handle} disabled={busy}>
          {busy ? 'Saving…' : 'Change Password →'}
        </button>
      </div>
    </div>
  )
}

// ── Change Username Modal ─────────────────────────────────────────
function ChangeUsernameModal({ onClose, showToast }) {
  const [newU, setNewU] = useState('')
  const [pass, setPass] = useState('')
  const [err,  setErr]  = useState('')
  const [busy, setBusy] = useState(false)

  const handle = async () => {
    const u = newU.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
    if (!u || !pass)   { setErr('Fill in all fields.'); return }
    if (u.length < 3)  { setErr('Username must be at least 3 characters.'); return }
    setBusy(true); setErr('')
    const result = await db.changeUsername(u, pass)
    setBusy(false)
    if (result === 'wrong_password') { setErr('Password is incorrect.'); return }
    if (result === 'taken')          { setErr('That username is already taken.'); return }
    if (result === 'error')          { setErr('Something went wrong. Try again.'); return }
    showToast('✅ Username changed!')
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHandle} />
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>Change Username</span>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        <div className={styles.mfieldGroup}>
          <label className={styles.mlbl}>New username</label>
          <input className={styles.minp} type="text" value={newU} autoCapitalize="none"
            onChange={(e) => setNewU(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="new_username" maxLength={20} />
          <span className={styles.mhint}>Letters, numbers and underscores only</span>
        </div>
        <div className={styles.mfieldGroup}>
          <label className={styles.mlbl}>Confirm with your password</label>
          <input className={styles.minp} type="password" value={pass}
            onChange={(e) => setPass(e.target.value)} placeholder="Your password" />
        </div>
        {err && <div className={styles.merror}>⚠️ {err}</div>}
        <button className={styles.mactionBtn} onClick={handle} disabled={busy}>
          {busy ? 'Saving…' : 'Change Username →'}
        </button>
      </div>
    </div>
  )
}

// ── Main Settings ─────────────────────────────────────────────────
export default function Settings({ showToast, onLogout }) {
  const store    = useStore()
  const expenses = useStore((s) => s.expenses)
  const { theme, toggle } = useTheme()

  const [daily,   setDaily]   = useState(store.dailyLimit)
  const [monthly, setMonthly] = useState(store.monthlyBudget)
  const [food,    setFood]    = useState(store.foodBudget)
  const [fun,     setFun]     = useState(store.funBudget)
  const [name,    setName]    = useState(getUserName())
  const [saving,  setSaving]  = useState(false)

  // Profile picture
  const [avatar,   setAvatarState] = useState(getAvatar())
  const [uploading, setUploading]  = useState(false)
  const fileRef = useRef()

  // Modals
  const [showPassModal, setShowPassModal] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showPinModal,  setShowPinModal]  = useState(false)
  const [pinEnabled,    setPinEnabled]    = useState(hasPin())
  const [lockTimer,     setLockTimerState] = useState(getLockTimer())

  // Spend data
  const now        = new Date()
  const todayStr   = now.toDateString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const spentToday = expenses.filter((e) => new Date(e.date).toDateString() === todayStr).reduce((a, e) => a + e.amount, 0)
  const spentMonth = expenses.filter((e) => new Date(e.date) >= monthStart).reduce((a, e) => a + e.amount, 0)
  const spentFood  = expenses.filter((e) => new Date(e.date) >= monthStart && ['Food','Groceries'].includes(e.category)).reduce((a, e) => a + e.amount, 0)
  const spentFun   = expenses.filter((e) => new Date(e.date) >= monthStart && e.category === 'Fun').reduce((a, e) => a + e.amount, 0)

  // ── Avatar upload ────────────────────────────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { showToast('❌ Image too large (max 2MB)', 'error'); return }
    setUploading(true)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const base64 = ev.target.result
      const ok = await db.updateAvatar(base64)
      if (ok) {
        setAvatarState(base64)
        setAvatar(base64)
        showToast('✅ Profile picture updated!')
      } else {
        showToast('❌ Failed to save avatar', 'error')
      }
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  // ── Save settings ────────────────────────────────────────────────
  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      await store.saveSettings({ dailyLimit: daily, monthlyBudget: monthly, foodBudget: food, funBudget: fun })
      const trimmed = name.trim()
      if (trimmed) {
        await db.updateDisplayName(trimmed)
        setUserName(trimmed)
      }
      showToast('✅ Settings saved!')
    } catch {
      showToast('❌ Save failed, try again', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (window.confirm('Delete ALL expense data? This cannot be undone.')) {
      store.set({ expenses: [] })
      showToast('🗑️ All data cleared')
    }
  }

  // ── PIN toggle ───────────────────────────────────────────────────
  const handlePinToggle = () => {
    if (pinEnabled) {
      if (window.confirm('Remove PIN lock?')) {
        removePin(); clearUnlocked(); setPinEnabled(false)
        showToast('🔓 PIN lock removed')
      }
    } else {
      setShowPinModal(true)
    }
  }

  return (
    <div className={styles.page}>
      <div className={`${styles.title} au`}>Settings</div>

      {/* ── Theme ── */}
      <div className={`${styles.themeCard} au`} onClick={toggle}>
        <div className={styles.themeInfo}>
          <span className={styles.themeIco}>{theme === 'dark' ? '🌙' : '☀️'}</span>
          <div>
            <div className={styles.themeTitle}>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</div>
            <div className={styles.themeSub}>Tap to switch appearance</div>
          </div>
        </div>
        <button className={`${styles.toggle} ${theme === 'dark' ? styles.toggleOn : ''}`}
          onClick={(e) => { e.stopPropagation(); toggle() }} />
      </div>

      {/* ── Profile ── */}
      <div className={`${styles.sectionLabel} au1`}>Your Profile</div>
      <div className={`${styles.card} au1`}>
        {/* Avatar row */}
        <div className={styles.avatarRow}>
          <div className={styles.avatarWrap} onClick={() => fileRef.current?.click()}>
            {avatar ? (
              <img src={avatar} alt="avatar" className={styles.avatarImg} />
            ) : (
              <div className={styles.avatarFallback}>
                {name ? name.charAt(0).toUpperCase() : '👤'}
              </div>
            )}
            <div className={styles.avatarOverlay}>
              {uploading ? '⏳' : '📷'}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className={styles.fileInp}
            onChange={handleAvatarChange} />
          <div className={styles.avatarInfo}>
            <div className={styles.avatarName}>{getUserName() || 'Your Name'}</div>
            <div className={styles.avatarUsername}>@{getUserName() || 'username'}</div>
            <button className={styles.changePhotoBtn} onClick={() => fileRef.current?.click()}>
              {uploading ? 'Uploading…' : 'Change photo'}
            </button>
          </div>
        </div>

        {/* Display name */}
        <div className={styles.profileField}>
          <label className={styles.profileLbl}>Display Name</label>
          <input className={styles.nameInp} type="text" placeholder="Your name"
            value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        {/* Quick actions */}
        <div className={styles.credentialBtns}>
          <button className={styles.credBtn} onClick={() => setShowUserModal(true)}>
            <span className={styles.credIco}>👤</span>
            <div className={styles.credTxt}>
              <div className={styles.credLabel}>Username</div>
              <div className={styles.credSub}>@{getUserName() || '—'}</div>
            </div>
            <span className={styles.credArrow}>›</span>
          </button>
          <button className={styles.credBtn} onClick={() => setShowPassModal(true)}>
            <span className={styles.credIco}>🔑</span>
            <div className={styles.credTxt}>
              <div className={styles.credLabel}>Password</div>
              <div className={styles.credSub}>Change password</div>
            </div>
            <span className={styles.credArrow}>›</span>
          </button>
        </div>
      </div>

      {/* ── Security ── */}
      <div className={`${styles.sectionLabel} au1`}>Security</div>
      <div className={`${styles.card} au1`}>
        <div className={styles.pinRow}>
          <div className={styles.pinLeft}>
            <span className={styles.pinIco}>🔒</span>
            <div>
              <div className={styles.pinTitle}>PIN Lock</div>
              <div className={styles.pinSub}>
                {pinEnabled ? `App locks after ${lockTimer === 0 ? 'never' : lockTimer + ' min'} · Tap to change PIN` : 'Protect app with a 4-digit PIN'}
              </div>
            </div>
          </div>
          <div className={styles.pinRight}>
            <button
              className={`${styles.toggle} ${pinEnabled ? styles.toggleOn : ''}`}
              onClick={handlePinToggle}
            />
          </div>
        </div>
        {pinEnabled && (
          <button className={styles.changePinBtn} onClick={() => setShowPinModal(true)}>
            🔄 Change PIN
          </button>
        )}
      </div>

      {/* ── Live Preview ── */}
      <div className={`${styles.sectionLabel} au2`}>Live Budget Preview</div>
      <div className="au2">
        <PreviewBar label="Daily Limit"  spent={spentToday} limit={daily}   color="var(--green)" />
        <PreviewBar label="Monthly"      spent={spentMonth} limit={monthly} color="var(--violet2)" />
        <PreviewBar label="Food Budget"  spent={spentFood}  limit={food}    color="var(--amber)" />
        <PreviewBar label="Fun Cap"      spent={spentFun}   limit={fun}     color="var(--violet3)" />
      </div>

      {/* ── Budget Limits ── */}
      <div className={`${styles.sectionLabel} au3`}>Budget Limits</div>
      <div className={`${styles.card} au3`}>
        <Field label="Daily Limit"         value={daily}   onChange={setDaily} />
        <Field label="Monthly Budget"      value={monthly} onChange={setMonthly} min={1000} />
        <Field label="Food Budget"         value={food}    onChange={setFood} />
        <Field label="Fun / Entertainment" value={fun}     onChange={setFun} />
      </div>

      {/* ── Smart Alerts ── */}
      <div className={`${styles.sectionLabel} au4`}>Smart Alerts</div>
      <div className={`${styles.card} au4`}>
        <Toggle label="Daily limit warning"    sub="Alert when you hit 70% of daily limit" defaultOn={true} />
        <Toggle label="Small expense detector" sub="Flag when 3+ small purchases pile up"   defaultOn={true} />
        <Toggle label="Monthly recap"          sub="Get a summary at end of each month"     defaultOn={false} />
        <Toggle label="Goal milestones"        sub="Celebrate at 25%, 50%, 75% progress"   defaultOn={true} />
      </div>

      {/* ── App Info ── */}
      <div className={`${styles.sectionLabel} au4`}>App</div>
      <div className={`${styles.card} au4`}>
        <div className={styles.appInfoRow}>
          <img src="/logo.png" alt="logo" className={styles.appLogo} />
          <div>
            <div className={styles.appName}>Kothay Gelo? 💸</div>
            <div className={styles.appVersion}>v2.1 · Smart Expense Tracker · Bangladesh 🇧🇩</div>
          </div>
        </div>
        <div className={styles.dangerRow}>
          <div>
            <div className={styles.dangerTitle}>Reset all data</div>
            <div className={styles.dangerSub}>Permanently delete all expense records</div>
          </div>
          <button className={styles.resetBtn} onClick={handleReset}>Reset</button>
        </div>
      </div>

      <button className={`${styles.saveBtn} au5`} onClick={handleSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save Settings ✓'}
      </button>

      {onLogout && (
        <button className={`${styles.logoutBtn} au5`}
          onClick={() => { if (window.confirm('Sign out of your account?')) onLogout() }}>
          🚪 Sign Out
        </button>
      )}

      {/* ── Modals ── */}
      {showPassModal && <ChangePasswordModal onClose={() => setShowPassModal(false)} showToast={showToast} />}
      {showUserModal && <ChangeUsernameModal onClose={() => setShowUserModal(false)} showToast={showToast} />}
      {showPinModal  && (
        <SetupPinModal
          existing={pinEnabled}
          onClose={() => setShowPinModal(false)}
          onSave={() => { setPinEnabled(true); showToast('🔒 PIN lock enabled!') }}
        />
      )}
    </div>
  )
}
