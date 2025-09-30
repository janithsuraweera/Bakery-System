import React, { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { X } from 'lucide-react'
import { productsAPI } from '../services/api'
import toast from 'react-hot-toast'

const defaultForm = {
  name: '',
  price: '',
  cost: '',
  category: 'bread',
  description: '',
  stock: 0,
  minStock: 5,
}

const NewProductModal = ({ isOpen, onClose }) => {
  const [form, setForm] = useState(defaultForm)
  const queryClient = useQueryClient()

  const createMutation = useMutation(
    (data) => productsAPI.create(data),
    {
      onSuccess: () => {
        toast.success('Product created')
        queryClient.invalidateQueries('products')
        setForm(defaultForm)
        onClose()
      },
      onError: (e) => {
        toast.error(e.response?.data?.message || 'Failed to create product')
      }
    }
  )

  const onSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.price || !form.cost) {
      toast.error('Name, price and cost are required')
      return
    }
    createMutation.mutate({
      ...form,
      price: Number(form.price),
      cost: Number(form.cost),
      stock: Number(form.stock),
      minStock: Number(form.minStock)
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form onSubmit={onSubmit}>
            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add Product</h3>
                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Name</label>
                  <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="bread">Bread</option>
                    <option value="cake">Cake</option>
                    <option value="pastry">Pastry</option>
                    <option value="beverage">Beverage</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label">Price (Rs.)</label>
                  <input type="number" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} min="0" />
                </div>
                <div>
                  <label className="label">Cost (Rs.)</label>
                  <input type="number" className="input" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} min="0" />
                </div>
                <div>
                  <label className="label">Initial Stock</label>
                  <input type="number" className="input" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} min="0" />
                </div>
                <div>
                  <label className="label">Min Stock</label>
                  <input type="number" className="input" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} min="0" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Description</label>
                  <textarea className="input" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional" />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="submit" disabled={createMutation.isLoading} className="btn btn-primary w-full sm:w-auto sm:ml-3">
                {createMutation.isLoading ? 'Saving...' : 'Save Product'}
              </button>
              <button type="button" onClick={onClose} className="btn btn-secondary w-full sm:w-auto mt-3 sm:mt-0">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default NewProductModal


