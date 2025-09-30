import React from 'react'
import { useQuery } from 'react-query'
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  TrendingUp,
  Phone,
  Utensils,
  CreditCard
} from 'lucide-react'
import { ordersAPI } from '../services/api'
import { format } from 'date-fns'
import { useLanguage } from '../contexts/LanguageContext'

const Dashboard = () => {
  const today = format(new Date(), 'yyyy-MM-dd')
  const { t } = useLanguage()
  
  const { data: dailyRevenue, isLoading: revenueLoading } = useQuery(
    ['dailyRevenue', today],
    () => ordersAPI.getDailyRevenue(today),
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  )

  const { data: salesAnalysis, isLoading: analysisLoading } = useQuery(
    ['salesAnalysis', today],
    () => ordersAPI.getSalesAnalysis(today, today),
    {
      refetchInterval: 60000, // Refetch every minute
    }
  )

  const stats = [
    {
      name: t('dashboard.dailyRevenue'),
      value: dailyRevenue?.data?.totalRevenue || 0,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      format: 'currency'
    },
    {
      name: t('dashboard.todayOrders'),
      value: dailyRevenue?.data?.orderCount || 0,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      format: 'number'
    },
    {
      name: t('dashboard.cashPayments'),
      value: dailyRevenue?.data?.cashRevenue || 0,
      icon: CreditCard,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      format: 'currency'
    },
    {
      name: t('dashboard.cardPayments'),
      value: dailyRevenue?.data?.cardRevenue || 0,
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      format: 'currency'
    },
  ]

  const serviceStats = [
    {
      name: t('dashboard.takeAway'),
      value: dailyRevenue?.data?.takeawayRevenue || 0,
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      name: t('dashboard.dining'),
      value: dailyRevenue?.data?.diningRevenue || 0,
      icon: Utensils,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      name: t('dashboard.phoneOrders'),
      value: dailyRevenue?.data?.phoneRevenue || 0,
      icon: Phone,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100'
    },
  ]

  const formatValue = (value, format) => {
    if (format === 'currency') {
      return `Rs. ${value.toLocaleString()}`
    }
    return value.toLocaleString()
  }

  if (revenueLoading || analysisLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {format(new Date(), 'EEEE, MMMM do, yyyy')} - {t('dashboard.subtitle')}
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatValue(stat.value, stat.format)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Service Type Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {serviceStats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-xl font-semibold text-gray-900">
                    Rs. {stat.value.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Top Selling Products */}
      {salesAnalysis?.data?.productSales && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('dashboard.topSelling')}</h3>
          <div className="space-y-3">
            {salesAnalysis.data.productSales
              .sort((a, b) => b.quantity - a.quantity)
              .slice(0, 5)
              .map((product, index) => (
                <div key={product.name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                    <span className="ml-2 text-sm font-medium text-gray-900">{product.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{product.quantity} units</div>
                    <div className="text-xs text-gray-500">Rs. {product.revenue.toLocaleString()}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('dashboard.quickActions')}</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button className="btn btn-primary">
            <ShoppingCart className="h-4 w-4 mr-2" />
            {t('dashboard.newOrder')}
          </button>
          <button className="btn btn-secondary">
            <Package className="h-4 w-4 mr-2" />
            {t('dashboard.addProduct')}
          </button>
          <button className="btn btn-secondary">
            <Users className="h-4 w-4 mr-2" />
            {t('dashboard.addCustomer')}
          </button>
          <button className="btn btn-secondary">
            <TrendingUp className="h-4 w-4 mr-2" />
            {t('dashboard.viewReports')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
