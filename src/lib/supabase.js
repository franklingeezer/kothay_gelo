import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── Session helpers ──────────────────────────────────────────────
export const getUserId      = () => localStorage.getItem('kg_user_id')      || ''
export const getUserName    = () => localStorage.getItem('kg_user_name')    || ''
export const setUserName    = (n) => localStorage.setItem('kg_user_name', n)
export const getUsername    = () => localStorage.getItem('kg_username')     || ''
export const getAvatar      = () => localStorage.getItem('kg_avatar')       || ''
export const setAvatar      = (a) => localStorage.setItem('kg_avatar', a)

// ── Simple hash (sufficient for a local/hobby app) ───────────────
function simpleHash(str) {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i)
    hash = hash >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}

// ── Database helpers ─────────────────────────────────────────────
export const db = {

  // ── USER AUTH ────────────────────────────────────────────────────
  async registerUser(username, password, displayName) {
    const { data: existing } = await supabase
      .from('users').select('id').eq('username', username).maybeSingle()
    if (existing) return 'exists'

    const userId   = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
    const passHash = simpleHash(password)
    const { data, error } = await supabase
      .from('users')
      .insert([{ username, password_hash: passHash, display_name: displayName, user_id: userId }])
      .select().single()
    if (error) { console.error('[db.registerUser]', error.message); return null }
    return data
  },

  async checkUsernameExists(username) {
    const { data } = await supabase
      .from('users').select('id').eq('username', username).maybeSingle()
    return !!data
  },

  async verifyDisplayName(username, displayName) {
    const { data } = await supabase
      .from('users').select('display_name')
      .eq('username', username).maybeSingle()
    if (!data) return false
    // Case-insensitive match
    return data.display_name?.trim().toLowerCase() === displayName.trim().toLowerCase()
  },

  async resetPassword(username, newPassword) {
    const newHash = simpleHash(newPassword)
    const { error } = await supabase
      .from('users').update({ password_hash: newHash })
      .eq('username', username)
    if (error) { console.error('[db.resetPassword]', error.message); return false }
    return true
  },

  async loginUser(username, password) {
    const passHash = simpleHash(password)
    const { data, error } = await supabase
      .from('users').select('*')
      .eq('username', username).eq('password_hash', passHash).maybeSingle()
    if (error) { console.error('[db.loginUser]', error.message); return null }
    return data || null
  },

  // ── PROFILE UPDATE ───────────────────────────────────────────────
  async updateDisplayName(newName) {
    const { error } = await supabase
      .from('users').update({ display_name: newName }).eq('user_id', getUserId())
    if (error) { console.error('[db.updateDisplayName]', error.message); return false }
    setUserName(newName)
    return true
  },

  async updateAvatar(base64) {
    const { error } = await supabase
      .from('users').update({ avatar: base64 }).eq('user_id', getUserId())
    if (error) { console.error('[db.updateAvatar]', error.message); return false }
    setAvatar(base64)
    return true
  },

  async changePassword(currentPassword, newPassword) {
    const passHash = simpleHash(currentPassword)
    // Verify current password first
    const { data } = await supabase
      .from('users').select('id')
      .eq('user_id', getUserId()).eq('password_hash', passHash).maybeSingle()
    if (!data) return 'wrong_password'
    const newHash = simpleHash(newPassword)
    const { error } = await supabase
      .from('users').update({ password_hash: newHash }).eq('user_id', getUserId())
    if (error) { console.error('[db.changePassword]', error.message); return 'error' }
    return 'ok'
  },

  async changeUsername(newUsername, password) {
    const passHash = simpleHash(password)
    // Verify password
    const { data: user } = await supabase
      .from('users').select('id')
      .eq('user_id', getUserId()).eq('password_hash', passHash).maybeSingle()
    if (!user) return 'wrong_password'
    // Check availability
    const { data: taken } = await supabase
      .from('users').select('id').eq('username', newUsername).maybeSingle()
    if (taken) return 'taken'
    const { error } = await supabase
      .from('users').update({ username: newUsername }).eq('user_id', getUserId())
    if (error) { console.error('[db.changeUsername]', error.message); return 'error' }
    localStorage.setItem('kg_username', newUsername)
    return 'ok'
  },

  // ── EXPENSES ─────────────────────────────────────────────────────
  async getExpenses() {
    const { data, error } = await supabase
      .from('expenses').select('*').eq('user_id', getUserId()).order('date', { ascending: false })
    if (error) console.error('[db.getExpenses]', error.message)
    return data || []
  },
  async addExpense(expense) {
    const { data, error } = await supabase
      .from('expenses').insert([{ ...expense, user_id: getUserId() }]).select().single()
    if (error) console.error('[db.addExpense]', error.message)
    return data
  },
  async deleteExpense(id) {
    const { error } = await supabase
      .from('expenses').delete().eq('id', id).eq('user_id', getUserId())
    if (error) console.error('[db.deleteExpense]', error.message)
  },

  // ── GOALS ────────────────────────────────────────────────────────
  async getGoals() {
    const { data, error } = await supabase
      .from('goals').select('*').eq('user_id', getUserId()).order('created_at', { ascending: true })
    if (error) console.error('[db.getGoals]', error.message)
    return data || []
  },
  async addGoal(goal) {
    const { data, error } = await supabase
      .from('goals').insert([{ ...goal, user_id: getUserId() }]).select().single()
    if (error) console.error('[db.addGoal]', error.message)
    return data
  },
  async depositToGoal(id, newSaved) {
    const { error } = await supabase
      .from('goals').update({ saved: newSaved }).eq('id', id).eq('user_id', getUserId())
    if (error) console.error('[db.depositToGoal]', error.message)
  },
  async deleteGoal(id) {
    const { error } = await supabase
      .from('goals').delete().eq('id', id).eq('user_id', getUserId())
    if (error) console.error('[db.deleteGoal]', error.message)
  },

  // ── SETTINGS ─────────────────────────────────────────────────────
  async getSettings() {
    const { data, error } = await supabase
      .from('settings').select('*').eq('user_id', getUserId()).maybeSingle()
    if (error) console.error('[db.getSettings]', error.message)
    return data
  },
  async saveSettings(settings) {
    const { error } = await supabase
      .from('settings').upsert({ ...settings, user_id: getUserId(), updated_at: new Date().toISOString() })
    if (error) console.error('[db.saveSettings]', error.message)
  },


  // ── BILLS ─────────────────────────────────────────────────────
  async getBills() {
    const { data, error } = await supabase
      .from('bills').select('*').eq('user_id', getUserId()).order('due_date', { ascending: true })
    if (error) console.error('[db.getBills]', error.message)
    return data || []
  },
  async addBill(bill) {
    const { data, error } = await supabase
      .from('bills').insert([{ ...bill, user_id: getUserId() }]).select().single()
    if (error) console.error('[db.addBill]', error.message)
    return data
  },
  async updateBill(bill) {
    const { id, user_id, ...rest } = bill
    const { error } = await supabase
      .from('bills').update(rest).eq('id', id).eq('user_id', getUserId())
    if (error) console.error('[db.updateBill]', error.message)
  },
  async deleteBill(id) {
    const { error } = await supabase
      .from('bills').delete().eq('id', id).eq('user_id', getUserId())
    if (error) console.error('[db.deleteBill]', error.message)
  },

  // ── LOANS ────────────────────────────────────────────────────────
  async getLoans() {
    const { data, error } = await supabase
      .from('loans').select('*').eq('user_id', getUserId()).order('date', { ascending: false })
    if (error) console.error('[db.getLoans]', error.message)
    return data || []
  },
  async addLoan(loan) {
    const { data, error } = await supabase
      .from('loans').insert([{ ...loan, user_id: getUserId() }]).select().single()
    if (error) console.error('[db.addLoan]', error.message)
    return data
  },
  async settleLoan(id) {
    const { error } = await supabase
      .from('loans').update({ settled: true, settled_at: new Date().toISOString() })
      .eq('id', id).eq('user_id', getUserId())
    if (error) console.error('[db.settleLoan]', error.message)
  },
  async deleteLoan(id) {
    const { error } = await supabase
      .from('loans').delete().eq('id', id).eq('user_id', getUserId())
    if (error) console.error('[db.deleteLoan]', error.message)
  },
}
