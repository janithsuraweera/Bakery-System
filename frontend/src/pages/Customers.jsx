import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  Users,
  Phone,
  Mail,
  MapPin,
  ShoppingCart,
  DollarSign,
  Calendar
} from 'lucide-react'
import { customersAPI } from '../services/api'
import { format } from 'date-fns'

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('lastOrderDate')
  const [sortOrder, setSortOrder] = useState('desc')

  const { data: customers, isLoading } = useQuery(
    ['customers', { searchTerm, sortBy, sortOrder }],
    () => customersAPI.getAll({
      search: searchTerm,
      sortBy,
      order: sortOrder
    })
  )

  const sortOptions = [
    { value: 'lastOrderDate', label: 'Last Order Date' },
    { value: 'totalSpent', label: 'Total Spent' },
    { value: 'totalOrders', label: 'Total Orders' },
    { value: 'name', label: 'Name' }
  ]

  const getCustomerLevel = (totalSpent) => {
    if (totalSpent >= 10000) return { level: 'VIP', color: 'bg-purple-100 text-purple-800' }
    if (totalSpent >= 5000) return { level: 'Gold', color: 'bg-yellow-100 text-yellow-800' }
    if (totalSpent >= 1000) return { level: 'Silver', color: 'bg-gray-100 text-gray-800' }
    return { level: 'New', color: 'bg-green-100 text-green-800' }
  }

  if (isLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customer database</p>
        </div>
        <button className="btn btn-primary mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label className="label">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                className="input pl-10"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="label">Sort By</label>
            <select
              className="input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="label">Order</label>
            <select
              className="input"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setSortBy('lastOrderDate')
                setSortOrder('desc')
              }}
              className="btn btn-secondary w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-semibold text-gray-900">
                {customers?.data?.length || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-green-100">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                Rs. {customers?.data?.reduce((sum, customer) => sum + customer.totalSpent, 0).toLocaleString() || 0}
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
                {customers?.data?.reduce((sum, customer) => sum + customer.totalOrders, 0) || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-purple-100">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-semibold text-gray-900">
                Rs. {customers?.data?.length > 0 ? 
                  Math.round(customers.data.reduce((sum, customer) => sum + customer.totalSpent, 0) / customers.data.length).toLocaleString() : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Customers List */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {customers?.data?.map((customer) => {
          const customerLevel = getCustomerLevel(customer.totalSpent)
          
          return (
            <div key={customer._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Users className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">{customer.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customerLevel.color}`}>
                      {customerLevel.level}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button className="text-gray-400 hover:text-gray-600">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {customer.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                
                {customer.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{customer.email}</span>
                  </div>
                )}
                
                {customer.address && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="truncate">{customer.address}</span>
                  </div>
                )}
                
                <div className="pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Orders</span>
                      <div className="font-medium text-gray-900">{customer.totalOrders}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Spent</span>
                      <div className="font-medium text-gray-900">
                        Rs. {customer.totalSpent.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  {customer.lastOrderDate && (
                    <div className="mt-3 text-xs text-gray-500">
                      Last order: {format(new Date(customer.lastOrderDate), 'MMM dd, yyyy')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {(!customers?.data || customers.data.length === 0) && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Get started by adding your first customer'
            }
          </p>
          <div className="mt-6">
            <button className="btn btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Customers
