import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { CalendarDays, LogOut, Building2 } from 'lucide-react'
import { getAdminSession, clearAdminSession } from '@/lib/adminAuth'
import clsx from 'clsx'

const BRAND_COLORS = {
  default: '#06d373',
  o2arena: '#0066cc',
  tarena: '#e20074',
  slavia: '#cc0000',
}

export default function EventsAdminShell() {
  const navigate = useNavigate()
  const session = getAdminSession()
  const color = BRAND_COLORS[session?.brandKey] || '#0066cc'

  const handleLogout = () => {
    clearAdminSession()
    navigate('/admin-event/login')
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
            <div className="text-xs leading-tight" style={{ color: 'var(--color-text-subtle)' }}>Events Admin</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          <NavLink
            to="/admin-event/events"
            className={({ isActive }) => clsx(
              'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
            )}
            style={({ isActive }) => ({
              backgroundColor: isActive ? 'var(--color-sidebar-active-bg)' : 'transparent',
              color: isActive ? 'var(--color-sidebar-active-text)' : 'var(--color-sidebar-text)',
            })}
          >
            <CalendarDays size={16} className="shrink-0" />
            Události
          </NavLink>
        </nav>

        {/* Brand + Logout */}
        <div className="p-3 shrink-0" style={{ borderTop: '1px solid var(--color-sidebar-border)' }}>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg mb-1 text-xs font-semibold"
            style={{ backgroundColor: `${color}1a`, color }}
          >
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
            {session?.brandName}
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
        <header
          className="h-14 shrink-0 flex items-center px-6"
          style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}
        >
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Správa událostí — {session?.brandName}
          </span>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
