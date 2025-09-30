import React from 'react'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ roles, children }) => {
  const { user } = useAuth()
  if (!user) {
    return <div className="p-6 text-red-600">Unauthorized. Please login.</div>
  }
  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <div className="p-6 text-red-600">Forbidden. Required role: {roles.join(', ')}</div>
  }
  return children
}

export default ProtectedRoute
