import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../auth/AuthProvider'

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { email: '', password: '' } })
  const { loginMutation } = useAuth()
  const [serverError, setServerError] = useState(null)

  const onSubmit = data => {
    setServerError(null)
    loginMutation.mutate(data, {
      onError: err => {
        setServerError(err?.response?.data?.message || 'Login failed')
      }
    })
  }

  return (
    <div className="center">
      <form onSubmit={handleSubmit(onSubmit)} className="card">
        <h2>Login</h2>

        <label>Email</label>
  <input {...register('email', { required: 'Email required', pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: 'Invalid email' } })} onChange={() => serverError && setServerError(null)} />
        {errors.email && <p className="error">{errors.email.message}</p>}

        <label>Password</label>
  <input type="password" {...register('password', { required: 'Password required' })} onChange={() => serverError && setServerError(null)} />
        {errors.password && <p className="error">{errors.password.message}</p>}

        <button type="submit" disabled={loginMutation.isLoading}>
          {loginMutation.isLoading ? 'Logging in...' : 'Login'}
        </button>

        {serverError && <p className="error">{serverError}</p>}
      </form>
    </div>
  )
}
