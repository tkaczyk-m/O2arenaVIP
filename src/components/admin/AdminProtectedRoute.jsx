import { Navigate } from 'react-router-dom'
import { useAdmin } from '@/context/AdminContext'

export default function AdminProtectedRoute({ children, requireBrand = true }) {
  const { adminUser, activeBrand } = useAdmin()
  if (!adminUser) return <Navigate to="/admin-clients/login" replace />
  if (requireBrand && !activeBrand) return <Navigate to="/admin-clients/brand" replace />
  return children
}
