import React from 'react'
import { Navigate } from 'react-router-dom'
import { tokenService } from '../auth/tokenService'

export default function ProtectedRoute({ children }) {
  const token = tokenService.getAccessToken()
  if (!token) return <Navigate to="/login" replace />
  return children
}
