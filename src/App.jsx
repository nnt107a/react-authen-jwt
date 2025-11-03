import React from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './router/ProtectedRoute'
import { useAuth } from './auth/AuthProvider'

export default function App() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="app">
      <nav className="nav">
        <div className="nav-left">
          <button type="button" className="nav-button" onClick={() => navigate('/')}>Home</button>
        </div>
        <div className="nav-right">
          {user ? (
            <>
              <span className="nav-greeting">Hello, {user.name}</span>
              <button className="nav-logout" onClick={logout}>Logout</button>
            </>
          ) : (
            <button type="button" className="nav-button" onClick={() => navigate('/login')}>Login</button>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
      </Routes>
    </div>
  )
}
