import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import api from '../api/axios'
import { tokenService } from './tokenService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    // load user if access token present
    const t = tokenService.getAccessToken()
    if (t) {
      // fetch user info
      api.get('/protected/user').then(r => setUser(r.data)).catch(() => { /* ignore */ })
    }
  }, [])

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      const resp = await api.post('/auth/login', { email, password })
      return resp.data
    },
    onSuccess: data => {
      const { accessToken, refreshToken, user } = data
      tokenService.setAccessToken(accessToken)
      tokenService.setRefreshToken(refreshToken)
      setUser(user)
      navigate('/', { replace: true })
    }
  })

  const logout = async () => {
    try {
      const refreshToken = tokenService.getRefreshToken()
      if (refreshToken) await api.post('/auth/logout', { refreshToken })
    } catch (e) {
      // ignore server errors
    }
    tokenService.clearTokens()
    setUser(null)
    navigate('/login', { replace: true })
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loginMutation, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
