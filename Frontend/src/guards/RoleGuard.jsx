import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '../context/useAuth'

export default function RoleGuard({ allowedRoles }) {
  const { user } = useAuth()

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/access-denied" replace />
  }

  return <Outlet />
}