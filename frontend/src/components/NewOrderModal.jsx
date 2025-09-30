import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { X, Plus, Minus, ShoppingCart } from 'lucide-react'
import { ordersAPI, productsAPI } from '../services/api'
import { useLanguage } from '../contexts/LanguageContext'
import toast from 'react-hot-toast'

const NewOrderModal = ({ isOpen, onClose }) => {
  const [orderData, setOrderData] = useState({
    customerPhone: '',
    paymentMethod: 'cash',
    serviceType: 'takeaway',
    notes: '',
    items: []
  })
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState(1)
  
  const queryClient = useQueryClient()
  const { t } = useLanguage()

  const { data: products } = useQuery(
    ['products'],
    () => productsAPI.getAll()
  )

  const createOrderMutation = useMutation(
    (data) => ordersAPI.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('orders')
        toast.success(t('orders.orderCreated') || 'Order created successfully')
        onClose()
        setOrderData({
          customerPhone: '',
          paymentMethod: 'cash',
          serviceType: 'takeaway',
          notes: '',
          items: []
        })
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create order')
      }
    }
  )

  const addItem = () => {
    if (!selectedProduct || quantity < 1) return
    
    const product = products?.data?.find(p => p._id === selectedProduct)
    if (!product) return

    const existingItem = orderData.items.find(item => item.productId === selectedProduct)
    
    if (existingItem) {
      setOrderData(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.productId === selectedProduct
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }))
    } else {
      setOrderData(prev => ({
        ...prev,
        items: [...prev.items, {
          productId: selectedProduct,
          quantity: quantity,
          price: product.price
        }]
      }))
    }
    
    setSelectedProduct('')
    setQuantity(1)
  }

  const removeItem = (productId) => {
    setOrderData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.productId !== productId)
    }))
  }

  const updateItemQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return
    
    setOrderData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    }))
  }

  const calculateTotal = () => {
    return orderData.items.reduce((total, item) => {
      const product = products?.data?.find(p => p._id === item.productId)
      return total + (product?.price || 0) * item.quantity
    }, 0)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (orderData.items.length === 0) {
      toast.error('Please add at least one item')
      return
    }

    const orderPayload = {
      ...orderData,
      items: orderData.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    }

    createOrderMutation.mutate(orderPayload)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('orders.newOrder')}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Customer Info */}
                <div className="space-y-4">
                  <div>
                    <label className="label">{t('customers.phone')}</label>
                    <input
                      type="text"
                      className="input"
                      value={orderData.customerPhone}
                      onChange={(e) => setOrderData(prev => ({ ...prev, customerPhone: e.target.value }))}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <label className="label">{t('orders.paymentMethod')}</label>
                    <select
                      className="input"
                      value={orderData.paymentMethod}
                      onChange={(e) => setOrderData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    >
                      <option value="cash">{t('orders.cash')}</option>
                      <option value="card">{t('orders.card')}</option>
                      <option value="both">{t('orders.both')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">{t('orders.service')}</label>
                    <select
                      className="input"
                      value={orderData.serviceType}
                      onChange={(e) => setOrderData(prev => ({ ...prev, serviceType: e.target.value }))}
                    >
                      <option value="takeaway">{t('orders.takeaway')}</option>
                      <option value="dining">{t('orders.dining')}</option>
                      <option value="phone">{t('orders.phone')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Notes</label>
                    <textarea
                      className="input"
                      rows="3"
                      value={orderData.notes}
                      onChange={(e) => setOrderData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Order notes..."
                    />
                  </div>
                </div>

                {/* Add Items */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">Add Items</h4>
                  
                  <div className="flex space-x-2">
                    <select
                      className="input flex-1"
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                    >
                      <option value="">Select Product</option>
                      {products?.data?.map(product => (
                        <option key={product._id} value={product._id}>
                          {product.name} - Rs. {product.price}
                        </option>
                      ))}
                    </select>
                    
                    <input
                      type="number"
                      className="input w-20"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    />
                    
                    <button
                      type="button"
                      onClick={addItem}
                      className="btn btn-primary"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {orderData.items.map((item) => {
                      const product = products?.data?.find(p => p._id === item.productId)
                      if (!product) return null
                      
                      return (
                        <div key={item.productId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Rs. {product.price} each
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            
                            <span className="w-8 text-center text-gray-900 dark:text-white">
                              {item.quantity}
                            </span>
                            
                            <button
                              type="button"
                              onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => removeItem(item.productId)}
                              className="p-1 text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Total */}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <div className="flex justify-between items-center text-lg font-semibold text-gray-900 dark:text-white">
                      <span>{t('common.total')}:</span>
                      <span>Rs. {calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={createOrderMutation.isLoading || orderData.items.length === 0}
                className="btn btn-primary w-full sm:w-auto sm:ml-3 disabled:opacity-50"
              >
                {createOrderMutation.isLoading ? 'Creating...' : 'Create Order'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default NewOrderModal
