import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Home, 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart3, 
  Menu,
  X,
  Phone,
  Sun,
  Moon,
  Globe,
  Shield
} from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { t, language, isDarkMode, changeLanguage, toggleDarkMode } = useLanguage()
  const { user, logout } = useAuth()

  const baseNavigation = [
    { name: t('nav.dashboard'), href: '/', icon: Home },
    { name: t('nav.orders'), href: '/orders', icon: ShoppingCart },
    { name: t('nav.products'), href: '/products', icon: Package },
    { name: t('nav.customers'), href: '/customers', icon: Users },
    { name: t('nav.inventory'), href: '/inventory', icon: BarChart3 },
    { name: t('nav.reports'), href: '/reports', icon: BarChart3 },
  ]

  const navigation = [...baseNavigation]
  if (user && (user.role === 'admin' || user.role === 'manager')) {
    navigation.push({ name: 'Audit Logs', href: '/audit', icon: Shield })
  }

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const onLogin = () => navigate('/login')
  const onSignup = () => navigate('/signup')
  const onLogout = () => logout()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-primary-600">Bakery Management System</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive(item.href)
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-bold text-primary-600">Bakery Management System</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive(item.href)
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Top bar */}
        <div className="flex h-16 items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="text-sm bg-transparent border-none text-gray-600 dark:text-gray-400 focus:outline-none"
              >
                <option value="si">සිංහල</option>
                <option value="en">English</option>
              </select>
            </div>
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Phone className="h-4 w-4" />
              <span>011-258-5972</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {new Date().toLocaleDateString('si-LK')}
            </div>
            {!user ? (
              <div className="flex items-center gap-2">
                <button onClick={onLogin} className="ml-2 px-3 py-1.5 rounded bg-blue-600 text-white text-sm">Login</button>
                <button onClick={onSignup} className="ml-2 px-3 py-1.5 rounded bg-gray-200 text-sm">Sign up</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-200">{user.name} ({user.role})</span>
                <button onClick={onLogout} className="px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-700 text-sm">Logout</button>
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
