const SESSION_KEY = 'vip_admin_session'

const CREDENTIALS = {
  o2arena:  { password: 'o2admin',      brandKey: 'o2arena', brandName: 'O2 Arena Praha' },
  tarena:   { password: 'tarenaadmin',  brandKey: 'tarena',  brandName: 'T-Arena Brno' },
  slavia:   { password: 'slaviaadmin',  brandKey: 'slavia',  brandName: 'Slavia / Eden' },
  plg:      { password: 'plgadmin',     brandKey: 'default', brandName: 'PLG' },
}

export function adminLogin(username, password) {
  const cred = CREDENTIALS[username]
  if (!cred || cred.password !== password) return { success: false }
  const session = {
    username,
    brandKey: cred.brandKey,
    brandName: cred.brandName,
    loggedInAt: new Date().toISOString(),
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return { success: true, session }
}

export function getAdminSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearAdminSession() {
  localStorage.removeItem(SESSION_KEY)
}

export const DEMO_CREDENTIALS = Object.entries(CREDENTIALS).map(([username, c]) => ({
  username,
  password: c.password,
  brandName: c.brandName,
}))
