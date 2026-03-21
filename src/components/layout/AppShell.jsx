import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Sidebar from './Sidebar'
import Footer from './Footer'
import { useApp } from '@/context/AppContext'

export default function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { brand } = useApp()

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col shrink-0 transition-all duration-200"
        style={{ width: sidebarCollapsed ? '64px' : '240px' }}
      >
        <div className="flex-1 overflow-hidden">
          <Sidebar collapsed={sidebarCollapsed} />
        </div>
        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(p => !p)}
          className="absolute bottom-4 transition-all duration-200 z-10 w-5 h-5 rounded-full flex items-center justify-center border shadow-sm"
          style={{
            left: sidebarCollapsed ? '52px' : '228px',
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-muted)',
          }}
          title={sidebarCollapsed ? 'Rozbalit' : 'Sbalit'}
        >
          <span className="text-xs">{sidebarCollapsed ? '›' : '‹'}</span>
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 flex"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            className="relative z-50 w-64 flex flex-col"
            style={{ backgroundColor: 'var(--color-sidebar-bg)' }}
          >
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-3 right-3 p-1 rounded"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <X size={18} />
            </button>
            <Sidebar collapsed={false} onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div
          className="lg:hidden flex items-center gap-3 px-4 py-3 border-b shrink-0"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-lg"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-fg)' }}
            >
              {brand.shortName[0]}
            </div>
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              {brand.shortName}
            </span>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex-1 px-4 sm:px-6 py-6">
            <Outlet />
          </div>
          <Footer />
        </div>
      </main>
    </div>
  )
}
