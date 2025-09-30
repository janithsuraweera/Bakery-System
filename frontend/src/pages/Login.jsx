import React, { useState } from 'react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const Login = () => {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      login(data.token, data.user)
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <form onSubmit={onSubmit} className="bg-white dark:bg-gray-800 p-6 rounded shadow w-full max-w-sm">
        <h1 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Login</h1>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <label className="block mb-2 text-sm text-gray-700 dark:text-gray-200">Email</label>
        <input className="w-full mb-4 p-2 border rounded dark:bg-gray-700 dark:text-gray-100" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <label className="block mb-2 text-sm text-gray-700 dark:text-gray-200">Password</label>
        <input className="w-full mb-4 p-2 border rounded dark:bg-gray-700 dark:text-gray-100" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-60">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}

export default Login
