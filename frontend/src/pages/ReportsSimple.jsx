import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { 
  Calendar, 
  Download, 
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package
} from 'lucide-react'
import { ordersAPI } from '../services/api'
import { format, subDays } from 'date-fns'

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  })
  const [reportType, setReportType] = useState('daily')

  const { data: salesAnalysis, isLoading } = useQuery(
    ['salesAnalysis', dateRange],
    () => ordersAPI.getSalesAnalysis(dateRange.startDate, dateRange.endDate),
    {
      enabled: !!dateRange.startDate && !!dateRange.endDate
    }
  )

  const { data: dailyRevenue, isLoading: revenueLoading } = useQuery(
    ['dailyRevenue', dateRange.endDate],
    () => ordersAPI.getDailyRevenue(dateRange.endDate)
  )

  const reportTypes = [
    { value: 'daily', label: 'Daily Sales', icon: Calendar },
    { value: 'products', label: 'Product Analysis', icon: Package },
    { value: 'revenue', label: 'Revenue Analysis', icon: DollarSign },
    { value: 'customers', label: 'Customer Analysis', icon: Users }
  ]

  if (isLoading || revenueLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive sales and business analytics</p>
        </div>
        <button className="btn btn-primary mt-4 sm:mt-0">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Date Range Selector */}
      <div className="card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Start Date</label>
            <input
              type="date"
              className="input"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="label">End Date</label>
            <input
              type="date"
              className="input"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => setDateRange({
                startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
                endDate: format(new Date(), 'yyyy-MM-dd')
              })}
              className="btn btn-secondary w-full"
            >
              Last 7 Days
            </button>
          </div>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="card">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {reportTypes.map((type) => {
            const Icon = type.icon
            return (
              <button
                key={type.value}
                onClick={() => setReportType(type.value)}
                className={`flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  reportType === type.value
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {type.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-green-100">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                Rs. {salesAnalysis?.data?.totalRevenue?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-blue-100">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Profit</p>
              <p className="text-2xl font-semibold text-gray-900">
                Rs. {salesAnalysis?.data?.totalProfit?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-yellow-100">
              <ShoppingCart className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dailyRevenue?.data?.orderCount || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-purple-100">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-semibold text-gray-900">
                Rs. {dailyRevenue?.data?.orderCount > 0 ? 
                  Math.round(dailyRevenue.data.totalRevenue / dailyRevenue.data.orderCount).toLocaleString() : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Service Type Analysis */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Service Type Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Take Away</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                Rs. {dailyRevenue?.data?.takeawayRevenue?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Dining</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                Rs. {dailyRevenue?.data?.diningRevenue?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Phone Orders</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                Rs. {dailyRevenue?.data?.phoneRevenue?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Cash</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                Rs. {dailyRevenue?.data?.cashRevenue?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Card</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                Rs. {dailyRevenue?.data?.cardRevenue?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Orders</span>
              <span className="text-sm font-medium text-gray-900">
                {dailyRevenue?.data?.orderCount || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Order Value</span>
              <span className="text-sm font-medium text-gray-900">
                Rs. {dailyRevenue?.data?.orderCount > 0 ? 
                  Math.round(dailyRevenue.data.totalRevenue / dailyRevenue.data.orderCount).toLocaleString() : 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Profit Margin</span>
              <span className="text-sm font-medium text-gray-900">
                {salesAnalysis?.data?.totalRevenue > 0 ? 
                  ((salesAnalysis.data.totalProfit / salesAnalysis.data.totalRevenue) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Sales Table */}
      {reportType === 'products' && salesAnalysis?.data?.productSales && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Product Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit Margin
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salesAnalysis.data.productSales.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Rs. {product.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Rs. {product.cost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Rs. {product.profit.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.revenue > 0 ? ((product.profit / product.revenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reports
