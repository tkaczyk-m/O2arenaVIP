import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { detectBrand, applyBrandToDOM } from '@/lib/brands'
import { getT } from '@/lib/i18n'
import { getMockSession, getCurrentUser, getCurrentPartner, clearMockSession } from '@/lib/mockData'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [brand, setBrand] = useState(() => detectBrand())
  const [locale, setLocale] = useState(() => localStorage.getItem('vip_locale') || 'cs')
  const [theme, setTheme] = useState(() => localStorage.getItem('vip_theme') || 'light')
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser())
  const [currentPartner, setCurrentPartner] = useState(() => getCurrentPartner())

  // Apply brand to DOM on mount and change
  useEffect(() => {
    applyBrandToDOM(brand)
  }, [brand])

  // Apply theme to DOM
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('vip_theme', theme)
  }, [theme])

  // Persist locale
  useEffect(() => {
    localStorage.setItem('vip_locale', locale)
    document.documentElement.setAttribute('lang', locale)
  }, [locale])

  const t = useCallback((key, ...args) => getT(locale, key, ...args), [locale])

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }, [])

  const switchLocale = useCallback((newLocale) => {
    setLocale(newLocale)
  }, [])

  const login = useCallback((user, partner) => {
    setCurrentUser(user)
    setCurrentPartner(partner)
  }, [])

  const logout = useCallback(() => {
    clearMockSession()
    setCurrentUser(null)
    setCurrentPartner(null)
  }, [])

  const refreshSession = useCallback(() => {
    setCurrentUser(getCurrentUser())
    setCurrentPartner(getCurrentPartner())
  }, [])

  return (
    <AppContext.Provider value={{
      brand,
      setBrand,
      locale,
      switchLocale,
      theme,
      toggleTheme,
      t,
      currentUser,
      currentPartner,
      login,
      logout,
      refreshSession,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
