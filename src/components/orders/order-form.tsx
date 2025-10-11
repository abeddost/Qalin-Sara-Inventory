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
  unit_price: number
  total_price: number
}

export function OrderForm({ open, onOpenChange, order, onSuccess }: OrderFormProps) {
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
    discount_amount: 0,
    tax_amount: 0
  })
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [renderKey, setRenderKey] = useState(0)
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
      discount_amount: 0,
      tax_amount: 0
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
      unit_price: 0,
      total_price: 0
    }])
  }

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  const updateOrderItem = (index: number, field: keyof OrderItem, value: any) => {
    console.log('updateOrderItem called:', { index, field, value })
    
    setOrderItems(prevItems => {
      console.log('Current orderItems:', prevItems)
      
      const updatedItems = [...prevItems]
      updatedItems[index] = { ...updatedItems[index], [field]: value }
      
      // Recalculate total price when quantity or unit price changes
      if (field === 'quantity' || field === 'unit_price') {
        updatedItems[index].total_price = updatedItems[index].quantity * updatedItems[index].unit_price
      }
      
      console.log('Updated orderItems:', updatedItems)
      return updatedItems
    })
    
    setRenderKey(prev => prev + 1)  // Force re-render
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

  const calculateTotals = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + item.total_price, 0)
    const discount = formData.discount_amount
    const tax = formData.tax_amount
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
            discount_amount: formData.discount_amount,
            tax_amount: formData.tax_amount,
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
            unit_price: item.unit_price,
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
            discount_amount: formData.discount_amount,
            tax_amount: formData.tax_amount,
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
            unit_price: item.unit_price,
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
    } catch (error: any) {
      console.error('Error saving order:', error)
      toast.error(error.message || 'Failed to save order')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-gray-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {order ? 'Edit Order' : 'Create New Order'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6" key={renderKey}>
          {/* Order Details */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Order Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="order_number">Order Number</Label>
                  <Input
                    id="order_number"
                    value={formData.order_number}
                    onChange={(e) => setFormData({...formData, order_number: e.target.value})}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => {
                      console.log('Status selected:', e.target.value)
                      setFormData({...formData, status: e.target.value as any})
                    }}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Customer Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_name">Customer Name *</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="customer_email">Email</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="customer_phone">Phone</Label>
                  <Input
                    id="customer_phone"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="customer_address">Address</Label>
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
          <Card className="bg-white border-gray-200">
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
                  <p className="text-sm">Click "Add Item" to start building your order</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderItems.map((item, index) => (
                    <div key={item.temp_id || `order-item-${index}`} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                        <div>
                          <Label>Product</Label>
                          <button 
                            type="button" 
                            onClick={() => {
                              console.log('Test button clicked')
                              updateOrderItem(index, 'product_id', 'test')
                            }}
                            className="mb-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                          >
                            Test Set Product
                          </button>
                          <select
                            value={item.product_id}
                            onChange={(e) => {
                              console.log('Product dropdown changed:', e.target.value)
                              console.log('Index:', index)
                              console.log('Current orderItems before update:', orderItems)
                              updateOrderItem(index, 'product_id', e.target.value)
                              updateOrderItem(index, 'product_size', '')
                              updateOrderItem(index, 'unit_price', 0)
                            }}
                            onClick={(e) => {
                              console.log('Product dropdown clicked')
                            }}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                          <Label>Size</Label>
                          <select
                            value={item.product_size}
                            onChange={(e) => {
                              updateOrderItem(index, 'product_size', e.target.value)
                              const price = getProductSizePrice(item.product_id, e.target.value)
                              updateOrderItem(index, 'unit_price', price)
                            }}
                            disabled={!item.product_id}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
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
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label>Unit Price</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => updateOrderItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label>Total</Label>
                          <Input
                            value={`$${item.total_price.toFixed(2)}`}
                            readOnly
                            className="mt-1 bg-gray-50"
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
          <Card className="bg-white border-gray-200">
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
                    <Label htmlFor="discount_amount">Discount Amount</Label>
                    <Input
                      id="discount_amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.discount_amount}
                      onChange={(e) => setFormData({...formData, discount_amount: parseFloat(e.target.value) || 0})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tax_amount">Tax Amount</Label>
                    <Input
                      id="tax_amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.tax_amount}
                      onChange={(e) => setFormData({...formData, tax_amount: parseFloat(e.target.value) || 0})}
                      className="mt-1"
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
                  <Label htmlFor="notes">Notes</Label>
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
