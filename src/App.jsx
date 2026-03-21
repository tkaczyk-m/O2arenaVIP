import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from '@/context/AppContext'
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

function ProtectedRoute({ children }) {
  const { currentUser } = useApp()
  if (!currentUser) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  const { currentUser } = useApp()

  return (
    <Routes>
      <Route
        path="/login"
        element={currentUser ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
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
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  )
}
