import { NavLink } from 'react-router-dom'
import { FileText, ShoppingBag, Ticket, Users, BarChart2 } from 'lucide-react'
import { useApp } from '@/context/AppContext'

const TABS = [
  { to: '/account/contract', icon: FileText, labelKey: 'account.tabs.contract' },
  { to: '/account/orders',   icon: ShoppingBag, labelKey: 'account.tabs.orders' },
  { to: '/account/tickets',  icon: Ticket, labelKey: 'account.tabs.tickets' },
  { to: '/account/users',    icon: Users, labelKey: 'account.tabs.users' },
  { to: '/account/reporting', icon: BarChart2, labelKey: 'account.tabs.reporting' },
]

export default function AccountTabNav() {
  const { t } = useApp()

  return (
    <div
      className="flex gap-1 overflow-x-auto pb-1 mb-6 border-b"
      style={{ borderColor: 'var(--color-border)' }}
    >
      {TABS.map(({ to, icon: Icon, labelKey }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors duration-150 border-b-2 -mb-px ${
              isActive
                ? 'border-current'
                : 'border-transparent'
            }`
          }
          style={({ isActive }) => ({
            color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
          })}
        >
          <Icon size={15} />
          {t(labelKey)}
        </NavLink>
      ))}
    </div>
  )
}
