import { Navigate } from 'react-router-dom'
import { getAdminSession } from '@/lib/adminAuth'

export default function EventsAdminProtectedRoute({ children }) {
  const session = getAdminSession()
  if (!session) return <Navigate to="/admin-event/login" replace />
  return children
}
