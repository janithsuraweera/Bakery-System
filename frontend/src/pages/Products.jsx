import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { productsAPI } from '../services/api'
import toast from 'react-hot-toast'
import NewProductModal from '../components/NewProductModal'

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [lowStockFilter, setLowStockFilter] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const queryClient = useQueryClient()

  const { data: products, isLoading } = useQuery(
    ['products', { searchTerm, categoryFilter, lowStockFilter }],
    () => productsAPI.getAll({
      search: searchTerm,
      category: categoryFilter,
      lowStock: lowStockFilter
    })
  )

  const deleteMutation = useMutation(
    (id) => productsAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products')
        toast.success('Product deactivated successfully')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete product')
      }
    }
  )

  const updateStockMutation = useMutation(
    ({ id, quantity }) => productsAPI.updateStock(id, quantity),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products')
        toast.success('Stock updated successfully')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update stock')
      }
    }
  )

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'bread', label: 'Bread' },
    { value: 'cake', label: 'Cake' },
    { value: 'pastry', label: 'Pastry' },
    { value: 'beverage', label: 'Beverage' },
    { value: 'other', label: 'Other' }
  ]

  const getCategoryColor = (category) => {
    const colors = {
      bread: 'bg-yellow-100 text-yellow-800',
      cake: 'bg-pink-100 text-pink-800',
      pastry: 'bg-purple-100 text-purple-800',
      beverage: 'bg-blue-100 text-blue-800',
      other: 'bg-gray-100 text-gray-800'
    }
    return colors[category] || colors.other
  }

  const getStockStatus = (stock, minStock) => {
    if (stock === 0) return { color: 'text-red-600', icon: AlertTriangle, text: 'Out of Stock' }
    if (stock <= minStock) return { color: 'text-yellow-600', icon: AlertTriangle, text: 'Low Stock' }
    return { color: 'text-green-600', icon: TrendingUp, text: 'In Stock' }
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to deactivate this product?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleStockUpdate = (id, currentStock) => {
    const newStock = prompt('Enter new stock quantity:', currentStock)
    if (newStock !== null && !isNaN(newStock) && newStock >= 0) {
      updateStockMutation.mutate({ id, quantity: parseInt(newStock) })
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your bakery products and inventory</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
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
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="label">Category</label>
            <select
              className="input"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
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
                setCategoryFilter('')
                setLowStockFilter(false)
              }}
              className="btn btn-secondary w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products?.data?.map((product) => {
          const stockStatus = getStockStatus(product.stock, product.minStock)
          const StockIcon = stockStatus.icon
          
          return (
            <div key={product._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Package className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(product.category)}`}>
                      {product.category}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Price</span>
                  <span className="text-lg font-semibold text-gray-900">
                    Rs. {product.price.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cost</span>
                  <span className="text-sm text-gray-900">
                    Rs. {product.cost.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Profit</span>
                  <span className="text-sm font-medium text-green-600">
                    Rs. {(product.price - product.cost).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Stock</span>
                  <div className="flex items-center">
                    <StockIcon className={`h-4 w-4 mr-1 ${stockStatus.color}`} />
                    <span className={`text-sm font-medium ${stockStatus.color}`}>
                      {product.stock}
                    </span>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleStockUpdate(product._id, product.stock)}
                    className="btn btn-secondary w-full text-sm"
                  >
                    Update Stock
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {(!products?.data || products.data.length === 0) && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || categoryFilter || lowStockFilter 
              ? 'Try adjusting your filters' 
              : 'Get started by adding your first product'
            }
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </button>
          </div>
        </div>
      )}
      {/* Add Product Modal */}
      <NewProductModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  )
}

export default Products
