import s from './NavBar.module.css'

const TABS = [
  { id:'home', label:'Home', icon:(
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  )},
  { id:'add', label:'Add', icon:(
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  )},
  { id:'loans', label:'Loans', icon:(
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
    </svg>
  )},
  { id:'bills', label:'Bills', icon:(
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="16" rx="2"/>
      <line x1="7" y1="9" x2="17" y2="9"/>
      <line x1="7" y1="13" x2="13" y2="13"/>
    </svg>
  )},
  { id:'goals', label:'Goals', icon:(
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9"/>
      <circle cx="12" cy="12" r="4"/>
      <line x1="12" y1="2" x2="12" y2="5"/>
    </svg>
  )},
  { id:'settings', label:'More', icon:(
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06-.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  )},
]

export default function NavBar({ tab, goTo, billsDueSoon = 0 }) {
  return (
    <nav className={s.nav}>
      <div className={s.inner}>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`${s.btn} ${tab === t.id ? s.on : ''}`}
            onClick={() => goTo(t.id)}
          >
            {tab === t.id && <span className={s.glow} />}
            <span className={s.icon}>
              {t.icon}
              {t.id === 'bills' && billsDueSoon > 0 && (
                <span className={s.badge}>{billsDueSoon}</span>
              )}
            </span>
            <span className={s.label}>{t.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
