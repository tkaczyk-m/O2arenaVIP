import { createContext, useContext, useState, useCallback } from 'react'
import { PARTNERS, ADMIN_USERS, setAdminSession, getAdminSession, clearAdminSession } from '@/lib/mockData'
import { BRANDS } from '@/lib/brands'

const AdminContext = createContext(null)

function getInitialBrand() {
  const stored = localStorage.getItem('admin_brand')
  return (stored && BRANDS[stored]) ? BRANDS[stored] : null
}

export function AdminProvider({ children }) {
  const [adminUser, setAdminUser] = useState(() => getAdminSession())
  const [activeBrand, setActiveBrandState] = useState(() => getInitialBrand())
  const [partners, setPartners] = useState(() => Object.values(PARTNERS))

  const adminLogin = useCallback((user) => {
    setAdminSession(user.id)
    setAdminUser(user)
  }, [])

  const adminLogout = useCallback(() => {
    clearAdminSession()
    setAdminUser(null)
    setActiveBrandState(null)
  }, [])

  const setActiveBrand = useCallback((brand) => {
    setActiveBrandState(brand)
    localStorage.setItem('admin_brand', brand.key)
  }, [])

  const addPartner = useCallback((partner) => {
    setPartners(prev => [...prev, partner])
  }, [])

  const updatePartner = useCallback((id, updates) => {
    setPartners(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }, [])

  const deletePartner = useCallback((id) => {
    setPartners(prev => prev.filter(p => p.id !== id))
  }, [])

  return (
    <AdminContext.Provider value={{
      adminUser,
      adminLogin,
      adminLogout,
      activeBrand,
      setActiveBrand,
      partners,
      addPartner,
      updatePartner,
      deletePartner,
      ADMIN_USERS,
    }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
