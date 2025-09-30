import React, { useState } from 'react'
import api from '../services/api'

const Signup = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('cashier')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setMsg('')
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/signup', { name, email, password, role })
      setMsg('Account created! You can now login.')
      setName(''); setEmail(''); setPassword(''); setRole('cashier')
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <form onSubmit={onSubmit} className="bg-white dark:bg-gray-800 p-6 rounded shadow w-full max-w-sm">
        <h1 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Sign up</h1>
        {msg && <div className="text-green-600 text-sm mb-2">{msg}</div>}
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <label className="block mb-2 text-sm text-gray-700 dark:text-gray-200">Name</label>
        <input className="w-full mb-4 p-2 border rounded dark:bg-gray-700 dark:text-gray-100" value={name} onChange={e => setName(e.target.value)} required />
        <label className="block mb-2 text-sm text-gray-700 dark:text-gray-200">Email</label>
        <input className="w-full mb-4 p-2 border rounded dark:bg-gray-700 dark:text-gray-100" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <label className="block mb-2 text-sm text-gray-700 dark:text-gray-200">Password</label>
        <input className="w-full mb-4 p-2 border rounded dark:bg-gray-700 dark:text-gray-100" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <label className="block mb-2 text-sm text-gray-700 dark:text-gray-200">Role</label>
        <select className="w-full mb-4 p-2 border rounded dark:bg-gray-700 dark:text-gray-100" value={role} onChange={e => setRole(e.target.value)}>
          <option value="cashier">Cashier</option>
          <option value="manager">Manager</option>
        </select>
        <button disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-60">
          {loading ? 'Creating...' : 'Create account'}
        </button>
      </form>
    </div>
  )
}

export default Signup
