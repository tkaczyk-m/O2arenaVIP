import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Users, ChevronDown, LogOut, Building2 } from 'lucide-react'
import { useState } from 'react'
import { useAdmin } from '@/context/AdminContext'
import { BRANDS } from '@/lib/brands'
import clsx from 'clsx'

const BRAND_COLORS = {
  default: '#06d373',
  o2arena: '#0066cc',
  tarena: '#e20074',
  slavia: '#cc0000',
}

function BrandSwitcher({ activeBrand, setActiveBrand }) {
  const [open, setOpen] = useState(false)
  const brands = Object.values(BRANDS)
  const color = BRAND_COLORS[activeBrand.key]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors"
        style={{
          backgroundColor: `${color}1a`,
          color,
          border: `1px solid ${color}44`,
        }}
      >
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
        {activeBrand.shortName}
        <ChevronDown size={13} className={clsx('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-1.5 w-44 rounded-lg shadow-lg z-20 py-1 overflow-hidden"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            {brands.map(b => {
              const bc = BRAND_COLORS[b.key]
              const isActive = b.key === activeBrand.key
              return (
                <button
                  key={b.key}
                  onClick={() => { setActiveBrand(b); setOpen(false) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-black/5 transition-colors"
                  style={{ color: isActive ? bc : 'var(--color-text)' }}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: bc }} />
                  {b.shortName}
                  {isActive && <span className="ml-auto text-xs opacity-50">aktivní</span>}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default function AdminShell() {
  const { adminUser, adminLogout, activeBrand, setActiveBrand } = useAdmin()
  const navigate = useNavigate()

  const handleLogout = () => {
    adminLogout()
    navigate('/admin/login')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <aside
        className="w-52 shrink-0 flex flex-col"
        style={{ backgroundColor: 'var(--color-sidebar-bg)', borderRight: '1px solid var(--color-sidebar-border)' }}
      >
        {/* Logo */}
        <div
          className="h-14 flex items-center gap-2 px-4 shrink-0"
          style={{ borderBottom: '1px solid var(--color-sidebar-border)' }}
        >
          <Building2 size={18} style={{ color: 'var(--color-primary)' }} className="shrink-0" />
          <div>
            <div className="text-xs font-bold leading-tight" style={{ color: 'var(--color-text)' }}>VIP Portal</div>
            <div className="text-xs leading-tight" style={{ color: 'var(--color-text-subtle)' }}>Admin</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          <NavLink
            to="/admin/clients"
            className={({ isActive }) => clsx(
              'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
            )}
            style={({ isActive }) => ({
              backgroundColor: isActive ? 'var(--color-sidebar-active-bg)' : 'transparent',
              color: isActive ? 'var(--color-sidebar-active-text)' : 'var(--color-sidebar-text)',
            })}
          >
            <Users size={16} className="shrink-0" />
            Partneři
          </NavLink>
        </nav>

        {/* User */}
        <div className="p-3 shrink-0" style={{ borderTop: '1px solid var(--color-sidebar-border)' }}>
          <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-fg)' }}
            >
              {adminUser?.initials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>
                {adminUser?.name}
              </div>
              <div className="text-xs truncate" style={{ color: 'var(--color-text-subtle)' }}>
                Account Manager
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <LogOut size={13} />
            Odhlásit se
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header
          className="h-14 shrink-0 flex items-center justify-between px-6"
          style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}
        >
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Správa B2B partnerů
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>Venue:</span>
            {activeBrand && (
              <BrandSwitcher activeBrand={activeBrand} setActiveBrand={setActiveBrand} />
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
