import styles from './Toast.module.css'

export default function Toast({ msg, type = 'success' }) {
  return (
    <div className={`${styles.toast} ${type === 'error' ? styles.error : ''}`}>
      {msg}
    </div>
  )
}
