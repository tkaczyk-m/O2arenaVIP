import { Navigate } from 'react-router-dom'
import { useAdmin } from '@/context/AdminContext'

export default function AdminProtectedRoute({ children }) {
  const { adminUser, activeBrand } = useAdmin()
  if (!adminUser) return <Navigate to="/admin-clients/login" replace />
  if (!activeBrand) return <Navigate to="/admin-clients/brand" replace />
  return children
}
