import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import { LanguageProvider } from './contexts/LanguageContext'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import Products from './pages/Products'
import Customers from './pages/Customers'
import Inventory from './pages/Inventory'
import Reports from './pages/ReportsSimple'
import Login from './pages/Login'
import AuditLogs from './pages/AuditLogs'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Layout>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/orders" element={<ProtectedRoute roles={["admin", "manager", "cashier"]}><Orders /></ProtectedRoute>} />
                  <Route path="/products" element={<ProtectedRoute roles={["admin", "manager"]}><Products /></ProtectedRoute>} />
                  <Route path="/customers" element={<ProtectedRoute roles={["admin", "manager", "cashier"]}><Customers /></ProtectedRoute>} />
                  <Route path="/inventory" element={<ProtectedRoute roles={["admin", "manager"]}><Inventory /></ProtectedRoute>} />
                  <Route path="/reports" element={<ProtectedRoute roles={["admin", "manager"]}><Reports /></ProtectedRoute>} />
                  <Route path="/audit" element={<ProtectedRoute roles={["admin", "manager"]}><AuditLogs /></ProtectedRoute>} />
                </Routes>
              </Layout>
              <Toaster position="top-right" />
            </div>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  )
}

export default App
