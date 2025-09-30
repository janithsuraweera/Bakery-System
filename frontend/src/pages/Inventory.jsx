import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { 
  Plus, 
  Search, 
  AlertTriangle, 
  Package,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from 'lucide-react'
import { inventoryAPI, productsAPI } from '../services/api'
import toast from 'react-hot-toast'

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [lowStockFilter, setLowStockFilter] = useState(false)
  const [showAddStockModal, setShowAddStockModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [stockQuantity, setStockQuantity] = useState('')
  const queryClient = useQueryClient()

  const { data: inventory, isLoading } = useQuery(
    ['inventory', { searchTerm, lowStockFilter }],
    () => inventoryAPI.getAll({
      search: searchTerm,
      lowStock: lowStockFilter
    })
  )

  const { data: products } = useQuery(
    ['products'],
    () => productsAPI.getAll()
  )

  const addStockMutation = useMutation(
    ({ productId, quantity }) => inventoryAPI.addStock(productId, quantity),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('inventory')
        queryClient.invalidateQueries('products')
        toast.success('Stock added successfully')
        setShowAddStockModal(false)
        setSelectedProduct(null)
        setStockQuantity('')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to add stock')
      }
    }
  )

  const updateQuantityMutation = useMutation(
    ({ id, quantity }) => inventoryAPI.updateQuantity(id, quantity),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('inventory')
        queryClient.invalidateQueries('products')
        toast.success('Stock quantity updated successfully')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update stock')
      }
    }
  )

  const initializeInventoryMutation = useMutation(
    () => inventoryAPI.initialize(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('inventory')
        toast.success('Inventory initialized successfully')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to initialize inventory')
      }
    }
  )

  const getStockStatus = (quantity, minQuantity) => {
    if (quantity === 0) return { 
      color: 'text-red-600', 
      bgColor: 'bg-red-100',
      icon: AlertTriangle, 
      text: 'Out of Stock' 
    }
    if (quantity <= minQuantity) return { 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-100',
      icon: AlertTriangle, 
      text: 'Low Stock' 
    }
    return { 
      color: 'text-green-600', 
      bgColor: 'bg-green-100',
      icon: TrendingUp, 
      text: 'In Stock' 
    }
  }

  const handleAddStock = () => {
    if (!selectedProduct || !stockQuantity || isNaN(stockQuantity) || stockQuantity <= 0) {
      toast.error('Please enter a valid quantity')
      return
    }
    addStockMutation.mutate({ 
      productId: selectedProduct, 
      quantity: parseInt(stockQuantity) 
    })
  }

  const handleUpdateQuantity = (id, currentQuantity) => {
    const newQuantity = prompt('Enter new stock quantity:', currentQuantity)
    if (newQuantity !== null && !isNaN(newQuantity) && newQuantity >= 0) {
      updateQuantityMutation.mutate({ id, quantity: parseInt(newQuantity) })
    }
  }

  const lowStockItems = inventory?.data?.filter(item => 
    item.quantity <= item.minQuantity
  ) || []

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
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600">Manage your stock levels and inventory</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => initializeInventoryMutation.mutate()}
            className="btn btn-secondary"
            disabled={initializeInventoryMutation.isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${initializeInventoryMutation.isLoading ? 'animate-spin' : ''}`} />
            Initialize
          </button>
          <button 
            onClick={() => setShowAddStockModal(true)}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Stock
          </button>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Low Stock Alert
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} running low on stock:
                </p>
                <ul className="mt-1 list-disc list-inside">
                  {lowStockItems.slice(0, 5).map(item => (
                    <li key={item._id}>
                      {item.product?.name} ({item.quantity} remaining)
                    </li>
                  ))}
                  {lowStockItems.length > 5 && (
                    <li>...and {lowStockItems.length - 5} more</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                className="input pl-10"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                checked={lowStockFilter}
                onChange={(e) => setLowStockFilter(e.target.checked)}
              />
              <span className="ml-2 text-sm text-gray-700">Low Stock Only</span>
            </label>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setLowStockFilter(false)
              }}
              className="btn btn-secondary w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventory?.data?.map((item) => {
                const stockStatus = getStockStatus(item.quantity, item.minQuantity)
                const StatusIcon = stockStatus.icon
                
                return (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-primary-100 rounded-lg">
                          <Package className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {item.product?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.product?.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.minQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.bgColor} ${stockStatus.color}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {stockStatus.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleUpdateQuantity(item._id, item.quantity)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {(!inventory?.data || inventory.data.length === 0) && (
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No inventory found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || lowStockFilter 
                ? 'Try adjusting your filters' 
                : 'Initialize inventory to get started'
              }
            </p>
          </div>
        )}
      </div>

      {/* Add Stock Modal */}
      {showAddStockModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddStockModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Stock</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="label">Product</label>
                    <select
                      className="input"
                      value={selectedProduct || ''}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                    >
                      <option value="">Select a product</option>
                      {products?.data?.map(product => (
                        <option key={product._id} value={product._id}>
                          {product.name} (Current: {product.stock || 0})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="label">Quantity to Add</label>
                    <input
                      type="number"
                      className="input"
                      placeholder="Enter quantity"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      min="1"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleAddStock}
                  disabled={addStockMutation.isLoading}
                  className="btn btn-primary w-full sm:w-auto sm:ml-3"
                >
                  {addStockMutation.isLoading ? 'Adding...' : 'Add Stock'}
                </button>
                <button
                  onClick={() => setShowAddStockModal(false)}
                  className="btn btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Inventory
