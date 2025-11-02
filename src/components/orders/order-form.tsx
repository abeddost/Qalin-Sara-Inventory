'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useTheme } from '@/components/providers/theme-provider'
import { 
  Plus, 
  Trash2, 
  ShoppingCart, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Package,
  DollarSign,
  Save,
  X
} from 'lucide-react'
import type { OrderWithItems, ProductWithSizes, OrderInsert, OrderItemInsert } from '@/types/database'

interface OrderFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order?: OrderWithItems
  onSuccess: () => void
}

interface OrderItem {
  id?: string
  temp_id?: string  // For React key purposes
  product_id: string
  product_size: string
  quantity: number
  total_area: number | null  // Total area in m²
  unit_price: number | null  // Price per m²
  total_price: number
}

export function OrderForm({ open, onOpenChange, order, onSuccess }: OrderFormProps) {
  const { theme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState<ProductWithSizes[]>([])
  const [formData, setFormData] = useState({
    order_number: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    status: 'pending' as const,
    notes: '',
    discount_amount: null as number | null,
    tax_amount: null as number | null
  })
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const supabase = createClient()

  // Debug: Log when orderItems changes
  useEffect(() => {
    console.log('orderItems state changed:', orderItems)
  }, [orderItems])

  // Fetch products when form opens
  useEffect(() => {
    if (open) {
      fetchProducts()
      if (order) {
        // Editing existing order
        setFormData({
          order_number: order.order_number,
          customer_name: order.customer_name,
          customer_email: order.customer_email || '',
          customer_phone: order.customer_phone || '',
          customer_address: order.customer_address || '',
          status: order.status,
          notes: order.notes || '',
          discount_amount: order.discount_amount,
          tax_amount: order.tax_amount
        })
        setOrderItems(order.order_items.map((item, index) => ({
          id: item.id,
          temp_id: `edit-${item.id || index}`,
          product_id: item.product_id,
          product_size: item.product_size,
          quantity: item.quantity,
          total_area: null, // Will be calculated if needed, or can be set manually
          unit_price: item.unit_price,
          total_price: item.total_price
        })))
      } else {
        // Creating new order
        resetForm()
      }
    }
  }, [open, order])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_sizes (*)
        `)
        .order('code')

      if (error) throw error
      console.log('Products fetched:', data)
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to fetch products')
    }
  }

  const resetForm = () => {
    setFormData({
      order_number: generateOrderNumber(),
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      customer_address: '',
      status: 'pending',
      notes: '',
      discount_amount: null,
      tax_amount: null
    })
    setOrderItems([])
  }

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString().slice(-6)
    return `ORD-${timestamp}`
  }

  const addOrderItem = () => {
    setOrderItems([...orderItems, {
      temp_id: `temp-${Date.now()}-${Math.random()}`,
      product_id: '',
      product_size: '',
      quantity: 1,
      total_area: null,
      unit_price: null,
      total_price: 0
    }])
  }

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  const updateOrderItem = (index: number, field: keyof OrderItem, value: string | number | null) => {
    console.log('updateOrderItem called:', { index, field, value })
    
    setOrderItems(prevItems => {
      console.log('Current orderItems:', prevItems)
      
      const updatedItems = [...prevItems]
      const currentItem = updatedItems[index]
      
      // Only update if the value actually changed
      if (currentItem[field] === value) {
        console.log('Value unchanged, skipping update')
        return prevItems
      }
      
      updatedItems[index] = { ...currentItem, [field]: value }
      
      // Recalculate total price when total_area or unit_price changes
      if (field === 'total_area' || field === 'unit_price') {
        const area = updatedItems[index].total_area || 0
        const pricePerM2 = updatedItems[index].unit_price || 0
        updatedItems[index].total_price = area * pricePerM2
      }
      
      console.log('Updated orderItems:', updatedItems)
      return updatedItems
    })
  }

  const getProductSizes = (productId: string) => {
    const product = products.find(p => p.id === productId)
    return product?.product_sizes || []
  }

  const getProductSizePrice = (productId: string, size: string) => {
    const product = products.find(p => p.id === productId)
    const productSize = product?.product_sizes.find(ps => ps.size === size)
    return productSize?.selling_price || 0
  }

  const getStatusColor = (status: string) => {
    if (theme === 'dark') {
      switch (status) {
        case 'pending': return 'bg-yellow-900 text-yellow-200'
        case 'confirmed': return 'bg-blue-900 text-blue-200'
        case 'processing': return 'bg-purple-900 text-purple-200'
        case 'shipped': return 'bg-indigo-900 text-indigo-200'
        case 'delivered': return 'bg-green-900 text-green-200'
        case 'cancelled': return 'bg-red-900 text-red-200'
        default: return 'bg-gray-800 text-gray-200'
      }
    } else {
      switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800'
        case 'confirmed': return 'bg-blue-100 text-blue-800'
        case 'processing': return 'bg-purple-100 text-purple-800'
        case 'shipped': return 'bg-indigo-100 text-indigo-800'
        case 'delivered': return 'bg-green-100 text-green-800'
        case 'cancelled': return 'bg-red-100 text-red-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }
  }

  const calculateTotals = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + item.total_price, 0)
    const discount = formData.discount_amount || 0
    const tax = formData.tax_amount || 0
    const total = subtotal - discount + tax
    
    return { subtotal, discount, tax, total }
  }

  const { subtotal, discount, tax, total } = calculateTotals()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.customer_name.trim()) {
      toast.error('Customer name is required')
      return
    }

    if (orderItems.length === 0) {
      toast.error('Please add at least one product to the order')
      return
    }

    setIsLoading(true)

    try {
      if (order) {
        // Update existing order
        const { error: orderError } = await supabase
          .from('orders')
          .update({
            customer_name: formData.customer_name,
            customer_email: formData.customer_email || null,
            customer_phone: formData.customer_phone || null,
            customer_address: formData.customer_address || null,
            status: formData.status,
            notes: formData.notes || null,
            discount_amount: formData.discount_amount || 0,
            tax_amount: formData.tax_amount || 0,
            total_amount: subtotal,
            final_amount: total,
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id)

        if (orderError) throw orderError

        // Delete existing order items
        await supabase
          .from('order_items')
          .delete()
          .eq('order_id', order.id)

        // Insert new order items
        if (orderItems.length > 0) {
          const itemsToInsert = orderItems.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            product_size: item.product_size,
            quantity: item.quantity,
            unit_price: item.unit_price || 0,
            total_price: item.total_price
          }))

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(itemsToInsert)

          if (itemsError) throw itemsError
        }

        toast.success('Order updated successfully')
      } else {
        // Create new order
        const { data: newOrder, error: orderError } = await supabase
          .from('orders')
          .insert({
            order_number: formData.order_number,
            customer_name: formData.customer_name,
            customer_email: formData.customer_email || null,
            customer_phone: formData.customer_phone || null,
            customer_address: formData.customer_address || null,
            status: formData.status,
            notes: formData.notes || null,
            discount_amount: formData.discount_amount || 0,
            tax_amount: formData.tax_amount || 0,
            total_amount: subtotal,
            final_amount: total
          })
          .select()
          .single()

        if (orderError) throw orderError

        // Insert order items
        if (orderItems.length > 0) {
          const itemsToInsert = orderItems.map(item => ({
            order_id: newOrder.id,
            product_id: item.product_id,
            product_size: item.product_size,
            quantity: item.quantity,
            unit_price: item.unit_price || 0,
            total_price: item.total_price
          }))

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(itemsToInsert)

          if (itemsError) throw itemsError
        }

        toast.success('Order created successfully')
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save order'
      console.error('Error saving order:', error)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl"
        style={{
          backgroundColor: theme === 'dark' ? '#111827' : '#ffffff',
          borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
        }}
      >
        <DialogHeader>
          <DialogTitle 
            className="text-2xl font-bold"
            style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
          >
            {order ? 'Edit Order' : 'Create New Order'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Details */}
          <Card 
            style={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Order Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label 
                    htmlFor="order_number" 
                    className="mb-2"
                    style={{ color: theme === 'dark' ? '#f5f5f5' : '#111827' }}
                  >
                    Order Number
                  </Label>
                  <Input
                    id="order_number"
                    value={formData.order_number}
                    onChange={(e) => setFormData({...formData, order_number: e.target.value})}
                    required
                    className="mt-1"
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                      color: theme === 'dark' ? '#f9fafb' : '#111827',
                      borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="status" className="mb-2">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => {
                      console.log('Status selected:', e.target.value)
                      setFormData({...formData, status: e.target.value as any})
                    }}
                    className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${getStatusColor(formData.status)}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card 
            style={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Customer Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label 
                    htmlFor="customer_name" 
                    className="mb-2"
                    style={{ color: theme === 'dark' ? '#f5f5f5' : '#111827' }}
                  >
                    Customer Name *
                  </Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    required
                    className="mt-1"
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                      color: theme === 'dark' ? '#f9fafb' : '#111827',
                      borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                    }}
                  />
                </div>
                <div>
                  <Label 
                    htmlFor="customer_email" 
                    className="mb-2"
                    style={{ color: theme === 'dark' ? '#f5f5f5' : '#111827' }}
                  >
                    Email
                  </Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                    className="mt-1"
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                      color: theme === 'dark' ? '#f9fafb' : '#111827',
                      borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                    }}
                  />
                </div>
                <div>
                  <Label 
                    htmlFor="customer_phone" 
                    className="mb-2"
                    style={{ color: theme === 'dark' ? '#f5f5f5' : '#111827' }}
                  >
                    Phone
                  </Label>
                  <Input
                    id="customer_phone"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                    className="mt-1"
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                      color: theme === 'dark' ? '#f9fafb' : '#111827',
                      borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="customer_address" className="mb-2">Address</Label>
                  <Textarea
                    id="customer_address"
                    value={formData.customer_address}
                    onChange={(e) => setFormData({...formData, customer_address: e.target.value})}
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card 
            style={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Order Items</span>
                </div>
                <Button type="button" onClick={addOrderItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orderItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No items added yet</p>
                  <p className="text-sm">Click &quot;Add Item&quot; to start building your order</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderItems.map((item, index) => (
                    <div key={item.temp_id || `order-item-${index}`} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
                        <div>
                          <Label className="mb-2">Product</Label>
                          <select
                            value={item.product_id}
                            onChange={(e) => {
                              console.log('Product dropdown changed:', e.target.value)
                              console.log('Index:', index)
                              console.log('Current orderItems before update:', orderItems)
                              updateOrderItem(index, 'product_id', e.target.value)
                              updateOrderItem(index, 'product_size', '')
                              updateOrderItem(index, 'total_area', null)
                              updateOrderItem(index, 'unit_price', null)
                            }}
                            onClick={(e) => {
                              console.log('Product dropdown clicked')
                            }}
                            className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                      color: theme === 'dark' ? '#f9fafb' : '#111827',
                      borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                    }}
                          >
                            <option value="">Select product</option>
                            <option value="test">Test Product (Debug)</option>
                            {products.map(product => (
                              <option key={product.id} value={product.id}>
                                {product.code}
                              </option>
                            ))}
                          </select>
                          <div className="mt-1 text-xs text-gray-500">
                            Current: {item.product_id || 'None'}
                          </div>
                        </div>
                        
                        <div>
                          <Label className="mb-2">Size</Label>
                          <select
                            value={item.product_size}
                            onChange={(e) => {
                              updateOrderItem(index, 'product_size', e.target.value)
                              const price = getProductSizePrice(item.product_id, e.target.value)
                              updateOrderItem(index, 'unit_price', price || null)
                              // Optionally calculate area based on size (e.g., if size is "12m", area might be 12*12=144m²)
                              // For now, user will enter area manually
                            }}
                            disabled={!item.product_id}
                            className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                            style={{
                              backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                              color: theme === 'dark' ? '#f9fafb' : '#111827',
                              borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                            }}
                          >
                            <option value="">Select size</option>
                            {getProductSizes(item.product_id).map(size => (
                              <option key={size.size} value={size.size}>
                                {size.size}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <Label className="mb-2">Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="mt-1"
                            style={{
                              backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                              color: theme === 'dark' ? '#f9fafb' : '#111827',
                              borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                            }}
                          />
                        </div>
                        
                        <div>
                          <Label className="mb-2">Total Area (m²)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.total_area === null ? '' : item.total_area}
                            placeholder="0"
                            onChange={(e) => {
                              const value = e.target.value
                              if (value === '') {
                                updateOrderItem(index, 'total_area', null)
                              } else {
                                const numValue = parseFloat(value)
                                if (!isNaN(numValue)) {
                                  updateOrderItem(index, 'total_area', numValue)
                                }
                              }
                            }}
                            className="mt-1"
                            style={{
                              backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                              color: theme === 'dark' ? '#f9fafb' : '#111827',
                              borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                            }}
                          />
                        </div>
                        
                        <div>
                          <Label className="mb-2">Price per m²</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price === null ? '' : item.unit_price}
                            placeholder="0"
                            onChange={(e) => {
                              const value = e.target.value
                              if (value === '') {
                                updateOrderItem(index, 'unit_price', null)
                              } else {
                                const numValue = parseFloat(value)
                                if (!isNaN(numValue)) {
                                  updateOrderItem(index, 'unit_price', numValue)
                                }
                              }
                            }}
                            className="mt-1"
                            style={{
                              backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                              color: theme === 'dark' ? '#f9fafb' : '#111827',
                              borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                            }}
                          />
                        </div>
                        
                        <div>
                          <Label className="mb-2">Total</Label>
                          <Input
                            value={`$${item.total_price.toFixed(2)}`}
                            readOnly
                            className="mt-1"
                            style={{
                              backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
                              color: theme === 'dark' ? '#d1d5db' : '#6b7280',
                              borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                            }}
                          />
                        </div>
                        
                        <div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeOrderItem(index)}
                            className="w-full"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card 
            style={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Order Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discount_amount" className="mb-2">Discount Amount</Label>
                    <Input
                      id="discount_amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.discount_amount === null ? '' : formData.discount_amount}
                      placeholder="0"
                      onChange={(e) => setFormData({...formData, discount_amount: e.target.value === '' ? null : parseFloat(e.target.value) || 0})}
                      className="mt-1"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                        color: theme === 'dark' ? '#f9fafb' : '#111827',
                        borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tax_amount" className="mb-2">Tax Amount</Label>
                    <Input
                      id="tax_amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.tax_amount === null ? '' : formData.tax_amount}
                      placeholder="0"
                      onChange={(e) => setFormData({...formData, tax_amount: e.target.value === '' ? null : parseFloat(e.target.value) || 0})}
                      className="mt-1"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                        color: theme === 'dark' ? '#f9fafb' : '#111827',
                        borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                      }}
                    />
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium">Subtotal:</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span>Discount:</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span>Tax:</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notes" className="mb-2">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="mt-1"
                    rows={3}
                    placeholder="Additional notes for this order..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : (order ? 'Update Order' : 'Create Order')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
