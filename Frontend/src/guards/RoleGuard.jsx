import {Navigate,Outlet,} from 'react-router-dom'
import useAuth from '../context/useAuth'

export default function RoleGuard({allowedRoles,}) {
  const auth = useAuth()

  if (!auth.user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  const userHasPermission =
    allowedRoles.includes(auth.user.role)

  if (!userHasPermission) {
    return (
      <Navigate
        to="/access-denied"
        replace
      />
    )
  }

  return <Outlet />
}