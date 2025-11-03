import React from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import { useAuth } from '../auth/AuthProvider'

export default function Dashboard() {
  const { logout } = useAuth()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const resp = await api.get('/protected/user')
      return resp.data
    }
  })

  if (isLoading) return <div className="center">Loading...</div>
  if (isError) return <div className="center error">Failed to load user</div>

  return (
    <div className="center">
      <div className="card">
        <h2>Welcome, {data.name}</h2>
        <p>Email: {data.email}</p>
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  )
}
