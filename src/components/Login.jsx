import { useState } from 'react'
import { db, setUserName } from '../lib/supabase'
import s from './Login.module.css'

// ── Forgot Password Flow ──────────────────────────────────────────
// Step 1: enter username → Step 2: verify display name → Step 3: set new password
function ForgotPassword({ onBack }) {
  const [step,     setStep]     = useState(1)
  const [username, setUsername] = useState('')
  const [answer,   setAnswer]   = useState('')
  const [newPass,  setNewPass]  = useState('')
  const [confPass, setConfPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [done,     setDone]     = useState(false)

  // Step 1 — verify username exists
  const handleStep1 = async () => {
    const u = username.trim().toLowerCase()
    if (!u) { setError('Please enter your username.'); return }
    setLoading(true); setError('')
    try {
      const exists = await db.checkUsernameExists(u)
      if (!exists) { setError("We couldn't find that username."); setLoading(false); return }
      setStep(2)
    } catch {
      setError('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  // Step 2 — verify display name as security answer
  const handleStep2 = async () => {
    const a = answer.trim()
    if (!a) { setError('Please enter your display name.'); return }
    setLoading(true); setError('')
    try {
      const match = await db.verifyDisplayName(username.trim().toLowerCase(), a)
      if (!match) { setError("That doesn't match our records. Try your exact display name."); setLoading(false); return }
      setStep(3)
    } catch {
      setError('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  // Step 3 — set new password
  const handleStep3 = async () => {
    if (!newPass)             { setError('Please enter a new password.'); return }
    if (newPass.length < 4)   { setError('Password must be at least 4 characters.'); return }
    if (newPass !== confPass) { setError("Passwords don't match."); return }
    setLoading(true); setError('')
    try {
      const ok = await db.resetPassword(username.trim().toLowerCase(), newPass)
      if (!ok) { setError('Reset failed. Try again.'); setLoading(false); return }
      setDone(true)
    } catch {
      setError('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  const handleKey = (e) => {
    if (e.key !== 'Enter') return
    if (step === 1) handleStep1()
    if (step === 2) handleStep2()
    if (step === 3) handleStep3()
  }

  // ── Success screen ────────────────────────────────────────────
  if (done) {
    return (
      <div className={s.authStep}>
        <div className={s.successIco}>🎉</div>
        <h2 className={s.authTitle}>Password reset!</h2>
        <p className={s.authSub}>Your password has been updated successfully.</p>
        <button className={s.btn} onClick={onBack}>Sign In Now →</button>
      </div>
    )
  }

  return (
    <div className={s.authStep}>
      {/* Header */}
      <div className={s.forgotHeader}>
        <span className={s.forgotIco}>🔑</span>
        <h2 className={s.authTitle}>Forgot Password?</h2>
        <p className={s.authSub}>No worries, we'll help you reset it</p>
      </div>

      {/* Step indicators */}
      <div className={s.steps}>
        {[1, 2, 3].map((n) => (
          <div key={n} className={s.stepWrap}>
            <div className={`${s.stepDot} ${step >= n ? s.stepDotOn : ''} ${step > n ? s.stepDotDone : ''}`}>
              {step > n ? '✓' : n}
            </div>
            {n < 3 && <div className={`${s.stepLine} ${step > n ? s.stepLineOn : ''}`} />}
          </div>
        ))}
      </div>

      {/* ── Step 1: Username ── */}
      {step === 1 && (
        <>
          <div className={s.stepLabel}>Step 1 of 3 — Enter your username</div>
          <div className={s.fieldGroup}>
            <label className={s.lbl}>Username</label>
            <input
              className={s.inp}
              type="text"
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              onKeyDown={handleKey}
              autoFocus
              autoCapitalize="none"
            />
          </div>
          {error && <div className={s.errorBox}>⚠️ {error}</div>}
          <button className={s.btn} onClick={handleStep1} disabled={loading}>
            {loading ? 'Checking…' : 'Continue →'}
          </button>
        </>
      )}

      {/* ── Step 2: Verify identity ── */}
      {step === 2 && (
        <>
          <div className={s.stepLabel}>Step 2 of 3 — Verify your identity</div>
          <div className={s.hintCard}>
            <span className={s.hintCardIco}>💡</span>
            <span>Enter the <strong>display name</strong> you used when you created your account (e.g. "Rahim")</span>
          </div>
          <div className={s.fieldGroup}>
            <label className={s.lbl}>Your Display Name</label>
            <input
              className={s.inp}
              type="text"
              placeholder="e.g. Rahim"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKey}
              autoFocus
              maxLength={30}
            />
          </div>
          {error && <div className={s.errorBox}>⚠️ {error}</div>}
          <button className={s.btn} onClick={handleStep2} disabled={loading}>
            {loading ? 'Verifying…' : 'Verify →'}
          </button>
          <button className={s.backBtn} onClick={() => { setStep(1); setError('') }}>← Back</button>
        </>
      )}

      {/* ── Step 3: New password ── */}
      {step === 3 && (
        <>
          <div className={s.stepLabel}>Step 3 of 3 — Set a new password</div>
          <div className={s.fieldGroup}>
            <label className={s.lbl}>New Password</label>
            <div className={s.passWrap}>
              <input
                className={`${s.inp} ${s.inpPass}`}
                type={showPass ? 'text' : 'password'}
                placeholder="At least 4 characters"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                onKeyDown={handleKey}
                autoFocus
                autoComplete="new-password"
              />
              <button className={s.eyeBtn} onClick={() => setShowPass(!showPass)} type="button">
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <div className={s.fieldGroup}>
            <label className={s.lbl}>Confirm New Password</label>
            <div className={s.passWrap}>
              <input
                className={`${s.inp} ${s.inpPass}`}
                type={showPass ? 'text' : 'password'}
                placeholder="Repeat your new password"
                value={confPass}
                onChange={(e) => setConfPass(e.target.value)}
                onKeyDown={handleKey}
                autoComplete="new-password"
              />
            </div>
          </div>

          {/* Strength indicator */}
          {newPass.length > 0 && (
            <div className={s.strengthRow}>
              {['weak', 'ok', 'strong'].map((lvl, i) => {
                const score = newPass.length < 4 ? 0 : newPass.length < 8 ? 1 : 2
                return (
                  <div key={lvl} className={`${s.strengthBar} ${score >= i ? s.strengthOn : ''}`}
                    style={{ background: score >= i ? (score === 0 ? 'var(--red)' : score === 1 ? 'var(--amber)' : 'var(--green)') : undefined }}
                  />
                )
              })}
              <span className={s.strengthLbl}>
                {newPass.length < 4 ? 'Too short' : newPass.length < 8 ? 'OK' : 'Strong 💪'}
              </span>
            </div>
          )}

          {error && <div className={s.errorBox}>⚠️ {error}</div>}
          <button className={s.btn} onClick={handleStep3} disabled={loading}>
            {loading ? 'Saving…' : 'Reset Password ✓'}
          </button>
          <button className={s.backBtn} onClick={() => { setStep(2); setError('') }}>← Back</button>
        </>
      )}

      {/* Back to login */}
      {step === 1 && (
        <button className={s.backBtn} onClick={onBack}>← Back to Sign In</button>
      )}
    </div>
  )
}

// ── Main Login Component ──────────────────────────────────────────
export default function Login({ onLogin }) {
  const [mode,     setMode]     = useState('welcome') // 'welcome'|'login'|'register'|'forgot'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [name,     setName]     = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)

  const reset = () => { setError(''); setUsername(''); setPassword(''); setName('') }

  const handleLogin = async () => {
    const u = username.trim()
    const p = password.trim()
    if (!u || !p) { setError('Please enter your username and password.'); return }
    setLoading(true); setError('')
    try {
      const user = await db.loginUser(u, p)
      if (!user) { setError('Invalid username or password.'); setLoading(false); return }
      localStorage.setItem('kg_logged_in', '1')
      localStorage.setItem('kg_user_id',   user.user_id)
      localStorage.setItem('kg_user_name', user.display_name || user.username)
      localStorage.setItem('kg_username',  user.username)
      setUserName(user.display_name || user.username)
      onLogin()
    } catch {
      setError('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  const handleRegister = async () => {
    const u = username.trim()
    const p = password.trim()
    const n = name.trim()
    if (!u || !p || !n) { setError('Please fill in all fields.'); return }
    if (u.length < 3)   { setError('Username must be at least 3 characters.'); return }
    if (p.length < 4)   { setError('Password must be at least 4 characters.'); return }
    if (!/^[a-z0-9_]+$/.test(u)) { setError('Username can only contain letters, numbers and underscores.'); return }
    setLoading(true); setError('')
    try {
      const result = await db.registerUser(u, p, n)
      if (result === 'exists') { setError('Username already taken. Try another.'); setLoading(false); return }
      if (!result) { setError('Registration failed. Try again.'); setLoading(false); return }
      localStorage.setItem('kg_logged_in', '1')
      localStorage.setItem('kg_user_id',   result.user_id)
      localStorage.setItem('kg_user_name', n)
      localStorage.setItem('kg_username',  u)
      setUserName(n)
      onLogin()
    } catch {
      setError('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key !== 'Enter') return
    if (mode === 'login')    handleLogin()
    if (mode === 'register') handleRegister()
  }

  return (
    <div className={s.page}>
      <div className={s.orb1} />
      <div className={s.orb2} />

      <div className={s.inner}>
        <div className={s.logoWrap}>
          <img src="/logo.png" alt="Kothay Gelo" className={s.logo} />
        </div>

        {/* ── Welcome ── */}
        {mode === 'welcome' && (
          <div className={s.welcome}>
            <h1 className={s.title}>Kothay <span>Gelo?</span></h1>
            <p className={s.tagline}>আপনার টাকা কোথায় গেলো জানুন</p>
            <p className={s.sub}>Smart expense tracking for Bangladesh 🇧🇩</p>
            <div className={s.features}>
              {[
                { icon: '📊', text: 'Track daily spending' },
                { icon: '🎯', text: 'Set and hit goals' },
                { icon: '🤝', text: 'Manage loans & debts' },
                { icon: '💡', text: 'Get smart insights' },
              ].map((f) => (
                <div key={f.text} className={s.featureRow}>
                  <span className={s.featureIco}>{f.icon}</span>
                  <span className={s.featureTxt}>{f.text}</span>
                </div>
              ))}
            </div>
            <button className={s.btn} onClick={() => { reset(); setMode('login') }}>Sign In →</button>
            <button className={s.btnOutline} onClick={() => { reset(); setMode('register') }}>Create Account</button>
          </div>
        )}

        {/* ── Login ── */}
        {mode === 'login' && (
          <div className={s.authStep}>
            <h2 className={s.authTitle}>Welcome back 👋</h2>
            <p className={s.authSub}>Sign in to continue</p>

            <div className={s.fieldGroup}>
              <label className={s.lbl}>Username</label>
              <input
                className={s.inp}
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                autoComplete="username"
                autoCapitalize="none"
              />
            </div>

            <div className={s.fieldGroup}>
              <label className={s.lbl}>Password</label>
              <div className={s.passWrap}>
                <input
                  className={`${s.inp} ${s.inpPass}`}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoComplete="current-password"
                />
                <button className={s.eyeBtn} onClick={() => setShowPass(!showPass)} type="button">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Forgot password link */}
            <button
              className={s.forgotLink}
              onClick={() => { reset(); setMode('forgot') }}
            >
              Forgot your password?
            </button>

            {error && <div className={s.errorBox}>⚠️ {error}</div>}

            <button className={s.btn} onClick={handleLogin} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>

            <p className={s.switchTxt}>
              Don't have an account?{' '}
              <button className={s.switchBtn} onClick={() => { reset(); setMode('register') }}>Create one</button>
            </p>
            <button className={s.backBtn} onClick={() => { reset(); setMode('welcome') }}>← Back</button>
          </div>
        )}

        {/* ── Register ── */}
        {mode === 'register' && (
          <div className={s.authStep}>
            <h2 className={s.authTitle}>Create account 🚀</h2>
            <p className={s.authSub}>Start tracking your money today</p>

            <div className={s.fieldGroup}>
              <label className={s.lbl}>Display Name</label>
              <input
                className={s.inp}
                type="text"
                placeholder="Your name (e.g. Rahim)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                maxLength={30}
              />
              <span className={s.hint}>⚠️ Remember this — you'll need it to reset your password</span>
            </div>

            <div className={s.fieldGroup}>
              <label className={s.lbl}>Username</label>
              <input
                className={s.inp}
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                onKeyDown={handleKeyDown}
                autoComplete="username"
                autoCapitalize="none"
                maxLength={20}
              />
              <span className={s.hint}>Letters, numbers and underscores only</span>
            </div>

            <div className={s.fieldGroup}>
              <label className={s.lbl}>Password</label>
              <div className={s.passWrap}>
                <input
                  className={`${s.inp} ${s.inpPass}`}
                  type={showPass ? 'text' : 'password'}
                  placeholder="At least 4 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoComplete="new-password"
                />
                <button className={s.eyeBtn} onClick={() => setShowPass(!showPass)} type="button">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && <div className={s.errorBox}>⚠️ {error}</div>}

            <button className={s.btn} onClick={handleRegister} disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account 🚀'}
            </button>

            <p className={s.switchTxt}>
              Already have an account?{' '}
              <button className={s.switchBtn} onClick={() => { reset(); setMode('login') }}>Sign in</button>
            </p>
            <button className={s.backBtn} onClick={() => { reset(); setMode('welcome') }}>← Back</button>
          </div>
        )}

        {/* ── Forgot Password ── */}
        {mode === 'forgot' && (
          <ForgotPassword onBack={() => { reset(); setMode('login') }} />
        )}
      </div>
    </div>
  )
}
