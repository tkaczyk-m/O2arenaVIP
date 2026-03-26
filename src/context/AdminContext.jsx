import { createContext, useContext, useState, useCallback } from 'react'
import { ADMIN_USERS, setAdminSession, getAdminSession, clearAdminSession } from '@/lib/mockData'
import { BRANDS } from '@/lib/brands'
import { getAllPartners, savePartner, deletePartner as storeDeletePartner } from '@/lib/partnerStore'

const AdminContext = createContext(null)

function getInitialBrand() {
  const stored = localStorage.getItem('admin_brand')
  return (stored && BRANDS[stored]) ? BRANDS[stored] : null
}

export function AdminProvider({ children }) {
  const [adminUser, setAdminUser] = useState(() => getAdminSession())
  const [activeBrand, setActiveBrandState] = useState(() => getInitialBrand())
  const [partners, setPartners] = useState(() => getAllPartners())

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
    savePartner(partner)
    setPartners(getAllPartners())
  }, [])

  const updatePartner = useCallback((id, updates) => {
    const all = getAllPartners()
    const existing = all.find(p => p.id === id)
    if (existing) savePartner({ ...existing, ...updates })
    setPartners(getAllPartners())
  }, [])

  const deletePartner = useCallback((id) => {
    storeDeletePartner(id)
    setPartners(getAllPartners())
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
