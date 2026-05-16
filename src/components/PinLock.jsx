import { useState, useEffect, useRef } from 'react'
import s from './PinLock.module.css'

// ── PIN Storage helpers ───────────────────────────────────────────
export const hasPin        = () => !!localStorage.getItem('kg_pin')
export const getPin        = () => localStorage.getItem('kg_pin') || ''
export const savePin       = (pin) => localStorage.setItem('kg_pin', pin)
export const removePin     = () => localStorage.removeItem('kg_pin')
export const getLockTimer  = () => parseInt(localStorage.getItem('kg_lock_timer') || '5')
export const setLockTimer  = (mins) => localStorage.setItem('kg_lock_timer', String(mins))
export const isPinLocked   = () => {
  if (!hasPin()) return false
  const lastUnlock = localStorage.getItem('kg_pin_unlocked_at')
  if (!lastUnlock) return true
  const mins = getLockTimer()
  // Never lock if timer is 0
  if (mins === 0) return false
  return Date.now() - parseInt(lastUnlock) > mins * 60 * 1000
}
export const markUnlocked  = () => localStorage.setItem('kg_pin_unlocked_at', Date.now().toString())
export const clearUnlocked = () => localStorage.removeItem('kg_pin_unlocked_at')

// ── PIN Pad component ─────────────────────────────────────────────
function PinPad({ onComplete, error, title, sub }) {
  const [digits, setDigits] = useState([])
  const MAX = 4

  const press = (d) => {
    if (digits.length >= MAX) return
    const next = [...digits, d]
    setDigits(next)
    if (next.length === MAX) {
      setTimeout(() => onComplete(next.join('')), 120)
    }
  }

  const del = () => setDigits((prev) => prev.slice(0, -1))

  useEffect(() => {
    if (error) setDigits([])
  }, [error])

  const KEYS = [1,2,3,4,5,6,7,8,9,null,0,'⌫']

  return (
    <div className={s.padWrap}>
      <div className={s.padTitle}>{title}</div>
      <div className={s.padSub}>{sub}</div>

      {/* Dots */}
      <div className={s.dots}>
        {Array.from({ length: MAX }).map((_, i) => (
          <div key={i} className={`${s.dot} ${i < digits.length ? s.dotFilled : ''} ${error ? s.dotError : ''}`} />
        ))}
      </div>

      {error && <div className={s.errorMsg}>{error}</div>}

      {/* Keypad */}
      <div className={s.keypad}>
        {KEYS.map((k, i) => (
          k === null ? <div key={i} /> :
          k === '⌫' ? (
            <button key={i} className={`${s.key} ${s.keyDel}`} onClick={del}>⌫</button>
          ) : (
            <button key={i} className={s.key} onClick={() => press(k)}>{k}</button>
          )
        ))}
      </div>
    </div>
  )
}

// ── Lock Screen (shown on app open if PIN set) ────────────────────
export function LockScreen({ onUnlock }) {
  const [error, setError] = useState('')
  const attempts = useRef(0)

  const handlePin = (pin) => {
    if (pin === getPin()) {
      markUnlocked()
      setError('')
      onUnlock()
    } else {
      attempts.current++
      setError(attempts.current >= 3
        ? `Wrong PIN (${attempts.current} attempts)`
        : 'Wrong PIN, try again')
    }
  }

  return (
    <div className={s.lockPage}>
      <div className={s.orb1} /><div className={s.orb2} />
      <div className={s.lockInner}>
        <div className={s.lockLogo}>
          <img src="/logo.png" alt="Kothay Gelo" className={s.lockLogoImg} />
        </div>
        <div className={s.lockIcon}>🔒</div>
        <PinPad
          title="Enter your PIN"
          sub="App is locked for your privacy"
          onComplete={handlePin}
          error={error}
        />
      </div>
    </div>
  )
}

// ── Setup PIN Modal ───────────────────────────────────────────────
export function SetupPinModal({ onClose, onSave, existing }) {
  const [step,    setStep]    = useState(existing ? 'verify' : 'new') // verify→new→confirm | new→confirm
  const [newPin,  setNewPin]  = useState('')
  const [error,   setError]   = useState('')

  const handleVerify = (pin) => {
    if (pin === getPin()) { setStep('new'); setError('') }
    else setError('Wrong current PIN')
  }

  const handleNew = (pin) => {
    setNewPin(pin)
    setStep('confirm')
    setError('')
  }

  const handleConfirm = (pin) => {
    if (pin === newPin) {
      savePin(pin)
      markUnlocked()
      onSave()
      onClose()
    } else {
      setError('PINs don\'t match, try again')
      setStep('new')
      setNewPin('')
    }
  }

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <div className={s.modalHandle} />
        <div className={s.modalHeader}>
          <span className={s.modalTitle}>{existing ? 'Change PIN' : 'Set up PIN'}</span>
          <button className={s.modalClose} onClick={onClose}>✕</button>
        </div>
        {step === 'verify'  && <PinPad title="Enter current PIN"    sub="Verify your identity first"  onComplete={handleVerify}  error={error} />}
        {step === 'new'     && <PinPad title="Choose a new PIN"     sub="Enter a 4-digit PIN"         onComplete={handleNew}     error={error} />}
        {step === 'confirm' && <PinPad title="Confirm your PIN"     sub="Enter the same PIN again"    onComplete={handleConfirm} error={error} />}
      </div>
    </div>
  )
}
