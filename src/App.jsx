import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AppProvider, useApp } from '@/context/AppContext'
import { AdminProvider } from '@/context/AdminContext'

// B2B SPA
import AppShell from '@/components/layout/AppShell'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import EventDetailPage from '@/pages/EventDetailPage'
import ClaimWizardPage from '@/pages/ClaimWizardPage'
import AccountContractPage from '@/pages/account/ContractPage'
import AccountOrdersPage from '@/pages/account/OrdersPage'
import AccountTicketsPage from '@/pages/account/TicketsPage'
import AccountUsersPage from '@/pages/account/UsersPage'
import AccountReportingPage from '@/pages/account/ReportingPage'

// Events admin (brand-specific login, no context needed)
import EventsAdminProtectedRoute from '@/components/admin/EventsAdminProtectedRoute'
import EventsAdminShell from '@/components/admin/EventsAdminShell'
import EventsAdminLoginPage from '@/pages/admin/EventsAdminLoginPage'
import AdminEventsPage from '@/pages/admin/AdminEventsPage'
import AdminEventFormPage from '@/pages/admin/AdminEventFormPage'
import { initStore } from '@/lib/eventStore'
import { initPartnerStore } from '@/lib/partnerStore'

// Clients admin (internal login + brand picker, uses AdminContext)
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute'
import AdminShell from '@/components/admin/AdminShell'
import AdminLoginPage from '@/pages/admin/AdminLoginPage'
import BrandPickerPage from '@/pages/admin/BrandPickerPage'
import ClientsListPage from '@/pages/admin/ClientsListPage'
import ClientFormPage from '@/pages/admin/ClientFormPage'

function ProtectedRoute({ children }) {
  const { currentUser } = useApp()
  if (!currentUser) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  const { currentUser } = useApp()

  return (
    <Routes>
      {/* ── Events Admin (/admin-event/*) — brand-specific login ── */}
      <Route path="/admin-event/login" element={<EventsAdminLoginPage />} />
      <Route
        path="/admin-event/*"
        element={<EventsAdminProtectedRoute><EventsAdminShell /></EventsAdminProtectedRoute>}
      >
        <Route index element={<Navigate to="/admin-event/events" replace />} />
        <Route path="events" element={<AdminEventsPage />} />
        <Route path="events/new" element={<AdminEventFormPage />} />
        <Route path="events/:id/edit" element={<AdminEventFormPage />} />
      </Route>

      {/* ── Clients Admin (/admin-clients/*) — internal login + brand picker ── */}
      <Route path="/admin-clients/login" element={<AdminLoginPage />} />
      <Route path="/admin-clients/brand" element={<AdminProtectedRoute requireBrand={false}><BrandPickerPage /></AdminProtectedRoute>} />
      <Route
        path="/admin-clients/*"
        element={<AdminProtectedRoute><AdminShell /></AdminProtectedRoute>}
      >
        <Route index element={<Navigate to="/admin-clients/clients" replace />} />
        <Route path="clients" element={<ClientsListPage />} />
        <Route path="clients/new" element={<ClientFormPage />} />
        <Route path="clients/:id" element={<ClientFormPage />} />
      </Route>

      {/* ── B2B SPA ── */}
      <Route path="/login" element={currentUser ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="events/:eventId" element={<EventDetailPage />} />
        <Route path="events/:eventId/claim" element={<ClaimWizardPage />} />
        <Route path="account" element={<Navigate to="/account/contract" replace />} />
        <Route path="account/contract" element={<AccountContractPage />} />
        <Route path="account/orders" element={<AccountOrdersPage />} />
        <Route path="account/tickets" element={<AccountTicketsPage />} />
        <Route path="account/users" element={<AccountUsersPage />} />
        <Route path="account/reporting" element={<AccountReportingPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    Promise.all([initStore(), initPartnerStore()]).then(() => setReady(true))
  }, [])

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <AdminProvider>
      <AppProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </AdminProvider>
  )
}
