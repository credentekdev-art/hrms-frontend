import { useAuth } from '../context/AuthContext'

export default function RoleGate({ allow, children, fallback = null }) {
  const { user } = useAuth()
  return user && allow.includes(user.role) ? children : fallback
}
