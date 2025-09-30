import React, { useEffect, useState } from 'react'
import api from '../services/api'

const AuditLogs = () => {
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/audit', { params: { q, limit: 100 } })
      setItems(data.items || [])
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search" className="border p-2 rounded" />
        <button onClick={fetchData} className="bg-gray-700 text-white px-3 py-2 rounded">Search</button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2">Time</th>
                <th className="text-left p-2">Actor</th>
                <th className="text-left p-2">Role</th>
                <th className="text-left p-2">Action</th>
                <th className="text-left p-2">Resource</th>
                <th className="text-left p-2">Resource ID</th>
                <th className="text-left p-2">Meta</th>
              </tr>
            </thead>
            <tbody>
              {items.map((log) => (
                <tr key={log._id} className="border-t">
                  <td className="p-2 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="p-2">{log.actorName || log.user?.name || '-'}</td>
                  <td className="p-2">{log.role}</td>
                  <td className="p-2">{log.action}</td>
                  <td className="p-2">{log.resource}</td>
                  <td className="p-2">{log.resourceId || '-'}</td>
                  <td className="p-2">
                    <pre className="text-xs max-w-xs overflow-auto">{JSON.stringify(log.metadata || {}, null, 2)}</pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AuditLogs
