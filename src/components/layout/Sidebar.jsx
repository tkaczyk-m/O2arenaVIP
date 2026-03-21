import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, User, LogOut, ChevronRight, Building2 } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import clsx from 'clsx'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { to: '/account/contract', icon: User, labelKey: 'nav.account', matchPrefix: '/account' },
]

function NavItem({ item, t, collapsed }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) => clsx(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative',
        (isActive || (item.matchPrefix && window.location.pathname.startsWith(item.matchPrefix)))
          ? 'sidebar-active'
          : 'sidebar-item'
      )}
      style={({ isActive }) => ({
        backgroundColor: (isActive || (item.matchPrefix && window.location.pathname.startsWith(item.matchPrefix)))
          ? 'var(--color-sidebar-active-bg)'
          : 'transparent',
        color: (isActive || (item.matchPrefix && window.location.pathname.startsWith(item.matchPrefix)))
          ? 'var(--color-sidebar-active-text)'
          : 'var(--color-sidebar-text)',
      })}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span>{t(item.labelKey)}</span>}
      {collapsed && (
        <div
          className="absolute left-full ml-2 px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
        >
          {t(item.labelKey)}
        </div>
      )}
    </NavLink>
  )
}

export default function Sidebar({ collapsed, onClose }) {
  const { t, currentUser, currentPartner, brand, locale, switchLocale, logout } = useApp()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
    if (onClose) onClose()
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: 'var(--color-sidebar-bg)', borderRight: '1px solid var(--color-sidebar-border)' }}
    >
      {/* Logo / Brand */}
      <div
        className="flex items-center gap-3 px-4 py-4 border-b shrink-0"
        style={{ borderColor: 'var(--color-sidebar-border)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-fg)' }}
        >
          <Building2 size={16} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
              {brand.shortName}
            </div>
            <div className="text-xs truncate" style={{ color: 'var(--color-text-subtle)' }}>
              VIP Partner Portal
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {NAV_ITEMS.map(item => (
          <NavItem key={item.to} item={item} t={t} collapsed={collapsed} />
        ))}
      </nav>

      {/* Locale switcher */}
      {!collapsed && (
        <div
          className="px-3 py-2 border-t flex items-center gap-1"
          style={{ borderColor: 'var(--color-sidebar-border)' }}
        >
          {['cs', 'en'].map(loc => (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              className={clsx(
                'px-2 py-1 rounded text-xs font-medium transition-all',
                locale === loc ? 'font-semibold' : 'opacity-50 hover:opacity-80'
              )}
              style={{
                backgroundColor: locale === loc ? 'var(--color-sidebar-active-bg)' : 'transparent',
                color: locale === loc ? 'var(--color-sidebar-active-text)' : 'var(--color-text-muted)',
              }}
            >
              {loc.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* User + Logout */}
      <div
        className="p-3 border-t shrink-0"
        style={{ borderColor: 'var(--color-sidebar-border)' }}
      >
        {!collapsed && currentUser && (
          <div className="flex items-center gap-2 px-1 mb-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-fg)' }}
            >
              {currentUser.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>
                {currentUser.name}
              </div>
              <div className="text-xs truncate" style={{ color: 'var(--color-text-subtle)' }}>
                {currentPartner?.companyName}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-surface-2)'; e.currentTarget.style.color = 'var(--color-text)' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span>{t('nav.logout')}</span>}
        </button>
      </div>
    </div>
  )
}
