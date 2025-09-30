import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Orders API
export const ordersAPI = {
  getAll: (params = {}) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  getDailyRevenue: (date) => api.get('/orders/daily-revenue', { params: { date } }),
  getSalesAnalysis: (startDate, endDate) => 
    api.get('/orders/sales-analysis', { params: { startDate, endDate } }),
}

// Products API
export const productsAPI = {
  getAll: (params = {}) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  updateStock: (id, quantity) => api.patch(`/products/${id}/stock`, { quantity }),
  delete: (id) => api.delete(`/products/${id}`),
}

// Customers API
export const customersAPI = {
  getAll: (params = {}) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  getStats: (id) => api.get(`/customers/${id}/stats`),
}

// Inventory API
export const inventoryAPI = {
  getAll: (params = {}) => api.get('/inventory', { params }),
  getByProduct: (productId) => api.get(`/inventory/product/${productId}`),
  updateQuantity: (id, quantity) => api.patch(`/inventory/${id}/quantity`, { quantity }),
  addStock: (productId, quantity) => api.post('/inventory/add-stock', { productId, quantity }),
  getLowStockAlerts: () => api.get('/inventory/alerts/low-stock'),
  initialize: () => api.post('/inventory/initialize'),
}

export default api
