'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { Invoice, InvoiceItem, Product, Order } from '@/types/database'
import { toast } from 'sonner'

interface InvoiceFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  invoice?: Invoice
}

interface InvoiceItemWithTemp extends InvoiceItem {
  temp_id?: string
}

export default function InvoiceForm({ open, onClose, onSuccess, invoice }: InvoiceFormProps) {
  const [formData, setFormData] = useState({
    invoice_number: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    status: 'draft' as 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled',
    discount_amount: 0,
    tax_rate: 0,
    due_date: '',
    issue_date: new Date().toISOString().split('T')[0],
    notes: ''
  })
  
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItemWithTemp[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [renderKey, setRenderKey] = useState(0)
  
  const supabase = createClient()

  // Debug: Log when invoiceItems changes
  useEffect(() => {
    console.log('invoiceItems state changed:', invoiceItems)
  }, [invoiceItems])

  // Fetch products and orders when form opens
  useEffect(() => {
    if (open) {
      fetchProducts()
      fetchOrders()
      if (invoice) {
        // Editing existing invoice
        setFormData({
          invoice_number: invoice.invoice_number,
          customer_name: invoice.customer_name,
          customer_email: invoice.customer_email || '',
          customer_phone: invoice.customer_phone || '',
          customer_address: invoice.customer_address || '',
          status: invoice.status,
          discount_amount: invoice.discount_amount,
          tax_rate: invoice.tax_rate,
          due_date: invoice.due_date || '',
          issue_date: invoice.issue_date || new Date().toISOString().split('T')[0],
          notes: invoice.notes || ''
        })
        setSelectedOrderId(invoice.order_id || '')
        fetchInvoiceItems(invoice.id)
      } else {
        // Creating new invoice
        const newInvoiceNumber = `INV-${Date.now()}`
        setFormData({
          invoice_number: newInvoiceNumber,
          customer_name: '',
          customer_email: '',
          customer_phone: '',
          customer_address: '',
          status: 'draft',
          discount_amount: 0,
          tax_rate: 0,
          due_date: '',
          issue_date: new Date().toISOString().split('T')[0],
          notes: ''
        })
        setSelectedOrderId('')
        setInvoiceItems([])
      }
    }
  }, [open, invoice])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_sizes (
            id,
            size,
            count,
            purchase_price,
            selling_price
          )
        `)
      
      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to fetch products')
    }
  }

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to fetch orders')
    }
  }

  const fetchInvoiceItems = async (invoiceId: string) => {
    try {
      const { data, error } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId)
      
      if (error) throw error
      
      const itemsWithTempId = (data || []).map((item, index) => ({
        ...item,
        temp_id: item.temp_id || `temp-${Date.now()}-${index}`
      }))
      
      setInvoiceItems(itemsWithTempId)
    } catch (error) {
      console.error('Error fetching invoice items:', error)
      toast.error('Failed to fetch invoice items')
    }
  }

  const addInvoiceItem = () => {
    const newItem: InvoiceItemWithTemp = {
      temp_id: `temp-${Date.now()}-${Math.random()}`,
      invoice_id: '',
      product_id: '',
      product_code: '',
      product_size: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0
    }
    setInvoiceItems([...invoiceItems, newItem])
    setRenderKey(prev => prev + 1)
  }

  const removeInvoiceItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index))
    setRenderKey(prev => prev + 1)
  }

  const updateInvoiceItem = (index: number, field: keyof InvoiceItemWithTemp, value: any) => {
    console.log('updateInvoiceItem called:', { index, field, value })
    
    setInvoiceItems(prevItems => {
      console.log('Current invoiceItems:', prevItems)
      
      const updatedItems = [...prevItems]
      updatedItems[index] = { ...updatedItems[index], [field]: value }
      
      // Recalculate total price when quantity or unit price changes
      if (field === 'quantity' || field === 'unit_price') {
        updatedItems[index].total_price = updatedItems[index].quantity * updatedItems[index].unit_price
      }
      
      console.log('Updated invoiceItems:', updatedItems)
      return updatedItems
    })
    
    setRenderKey(prev => prev + 1)  // Force re-render
  }

  const getProductSizes = (productId: string) => {
    const product = products.find(p => p.id === productId)
    return product?.product_sizes || []
  }

  const calculateTotals = () => {
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.total_price, 0)
    const discountAmount = formData.discount_amount
    const taxableAmount = subtotal - discountAmount
    const taxAmount = (taxableAmount * formData.tax_rate) / 100
    const totalAmount = taxableAmount + taxAmount
    
    return { subtotal, discountAmount, taxAmount, totalAmount }
  }

  const handleOrderChange = async (orderId: string) => {
    setSelectedOrderId(orderId)
    if (orderId) {
      const selectedOrder = orders.find(o => o.id === orderId)
      if (selectedOrder) {
        setFormData(prev => ({
          ...prev,
          customer_name: selectedOrder.customer_name,
          customer_email: selectedOrder.customer_email || '',
          customer_phone: selectedOrder.customer_phone || '',
          customer_address: selectedOrder.customer_address || ''
        }))
        
        // Fetch order items and convert them to invoice items
        try {
          const { data: orderItems, error } = await supabase
            .from('order_items')
            .select(`
              *,
              products (
                id,
                code
              )
            `)
            .eq('order_id', orderId)

          if (error) throw error

          if (orderItems && orderItems.length > 0) {
            const convertedItems: InvoiceItemWithTemp[] = orderItems.map((item, index) => ({
              temp_id: `temp-${Date.now()}-${index}`,
              invoice_id: '',
              product_id: item.product_id,
              product_code: item.products?.code || '',
              product_size: item.product_size,
              description: '',
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.total_price
            }))
            
            setInvoiceItems(convertedItems)
            setRenderKey(prev => prev + 1)
            toast.success(`Loaded ${convertedItems.length} items from order`)
          } else {
            setInvoiceItems([])
            toast.info('No items found in selected order')
          }
        } catch (error) {
          console.error('Error fetching order items:', error)
          toast.error('Failed to load order items')
          setInvoiceItems([])
        }
      }
    } else {
      setInvoiceItems([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { subtotal, discountAmount, taxAmount, totalAmount } = calculateTotals()

      if (invoice) {
        // Update existing invoice
        const { error: invoiceError } = await supabase
          .from('invoices')
          .update({
            invoice_number: formData.invoice_number,
            order_id: selectedOrderId || null,
            customer_name: formData.customer_name,
            customer_email: formData.customer_email || null,
            customer_phone: formData.customer_phone || null,
            customer_address: formData.customer_address || null,
            status: formData.status,
            subtotal,
            discount_amount: discountAmount,
            tax_rate: formData.tax_rate,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            due_date: formData.due_date || null,
            issue_date: formData.issue_date,
            notes: formData.notes || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', invoice.id)

        if (invoiceError) throw invoiceError

        // Delete existing invoice items
        await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', invoice.id)

        // Insert new invoice items
        const itemsToInsert = invoiceItems.map(item => ({
          invoice_id: invoice.id,
          product_id: item.product_id || null,
          product_code: item.product_code || null,
          product_size: item.product_size || null,
          description: item.description || null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        }))

        if (itemsToInsert.length > 0) {
          const { error: itemsError } = await supabase
            .from('invoice_items')
            .insert(itemsToInsert)

          if (itemsError) throw itemsError
        }

        toast.success('Invoice updated successfully')
      } else {
        // Create new invoice
        const { data: invoiceData, error: invoiceError } = await supabase
          .from('invoices')
          .insert({
            invoice_number: formData.invoice_number,
            order_id: selectedOrderId || null,
            customer_name: formData.customer_name,
            customer_email: formData.customer_email || null,
            customer_phone: formData.customer_phone || null,
            customer_address: formData.customer_address || null,
            status: formData.status,
            subtotal,
            discount_amount: discountAmount,
            tax_rate: formData.tax_rate,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            due_date: formData.due_date || null,
            issue_date: formData.issue_date,
            notes: formData.notes || null
          })
          .select()
          .single()

        if (invoiceError) throw invoiceError

        // Insert invoice items
        const itemsToInsert = invoiceItems.map(item => ({
          invoice_id: invoiceData.id,
          product_id: item.product_id || null,
          product_code: item.product_code || null,
          product_size: item.product_size || null,
          description: item.description || null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        }))

        if (itemsToInsert.length > 0) {
          const { error: itemsError } = await supabase
            .from('invoice_items')
            .insert(itemsToInsert)

          if (itemsError) throw itemsError
        }

        toast.success('Invoice created successfully')
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving invoice:', error)
      toast.error('Failed to save invoice')
    } finally {
      setIsLoading(false)
    }
  }

  const { subtotal, discountAmount, taxAmount, totalAmount } = calculateTotals()

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            {invoice ? 'Edit Invoice' : 'Create New Invoice'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6" key={renderKey}>
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoice_number" className="mb-2">Invoice Number</Label>
              <Input
                id="invoice_number"
                value={formData.invoice_number}
                onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
                required
                className="bg-white"
              />
            </div>

            <div>
              <Label htmlFor="order_id" className="mb-2">Related Order (Optional)</Label>
              <div className="flex space-x-2">
                <select
                  id="order_id"
                  value={selectedOrderId}
                  onChange={(e) => handleOrderChange(e.target.value)}
                  className="mt-1 flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an order</option>
                  {orders.map(order => (
                    <option key={order.id} value={order.id}>
                      {order.order_number} - {order.customer_name}
                    </option>
                  ))}
                </select>
                {selectedOrderId && (
                  <Button
                    type="button"
                    onClick={() => handleOrderChange('')}
                    variant="outline"
                    size="sm"
                    className="mt-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Clear
                  </Button>
                )}
              </div>
              {selectedOrderId && (
                <p className="text-sm text-blue-600 mt-1">
                  ✓ Order selected - Customer details and items loaded
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="status" className="mb-2">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <Label htmlFor="issue_date" className="mb-2">Issue Date</Label>
              <Input
                id="issue_date"
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                required
                className="bg-white"
              />
            </div>

            <div>
              <Label htmlFor="due_date" className="mb-2">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                className="bg-white"
              />
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer_name" className="mb-2">Customer Name</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                  required
                  className="bg-white"
                />
              </div>

              <div>
                <Label htmlFor="customer_email" className="mb-2">Customer Email</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                  className="bg-white"
                />
              </div>

              <div>
                <Label htmlFor="customer_phone" className="mb-2">Customer Phone</Label>
                <Input
                  id="customer_phone"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                  className="bg-white"
                />
              </div>

              <div>
                <Label htmlFor="customer_address" className="mb-2">Customer Address</Label>
                <Textarea
                  id="customer_address"
                  value={formData.customer_address}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_address: e.target.value }))}
                  className="bg-white"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Invoice Items</h3>
              <Button type="button" onClick={addInvoiceItem} variant="outline">
                Add Item
              </Button>
            </div>

            {invoiceItems.map((item, index) => (
              <div key={item.temp_id || `invoice-item-${index}`} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                  <div className="md:col-span-2">
                    <Label className="mb-2">Product</Label>
                    <select
                      value={item.product_id}
                      onChange={(e) => {
                        const productId = e.target.value
                        const product = products.find(p => p.id === productId)
                        updateInvoiceItem(index, 'product_id', productId)
                        updateInvoiceItem(index, 'product_code', product?.code || '')
                        updateInvoiceItem(index, 'product_size', '')
                        updateInvoiceItem(index, 'unit_price', 0)
                      }}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.code}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="mb-2">Size</Label>
                    <select
                      value={item.product_size}
                      onChange={(e) => {
                        const size = e.target.value
                        const product = products.find(p => p.id === item.product_id)
                        const sizeData = product?.product_sizes.find(ps => ps.size === size)
                        updateInvoiceItem(index, 'product_size', size)
                        updateInvoiceItem(index, 'unit_price', sizeData?.selling_price || 0)
                      }}
                      disabled={!item.product_id}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">Select size</option>
                      {getProductSizes(item.product_id).map(size => (
                        <option key={size.size} value={size.size}>
                          {size.size} (${size.selling_price})
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
                      onChange={(e) => updateInvoiceItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="bg-white"
                    />
                  </div>

                  <div>
                    <Label className="mb-2">Unit Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) => updateInvoiceItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      className="bg-white"
                    />
                  </div>

                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label className="mb-2">Total</Label>
                      <Input
                        value={`$${item.total_price.toFixed(2)}`}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => removeInvoiceItem(index)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                </div>

                <div className="mt-2">
                  <Label className="mb-2">Description (Optional)</Label>
                  <Input
                    value={item.description || ''}
                    onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                    placeholder="Additional item description"
                    className="bg-white"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t pt-4">
            <div className="max-w-md ml-auto space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({formData.tax_rate}%):</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="discount_amount" className="mb-2">Discount Amount</Label>
                <Input
                  id="discount_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.discount_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_amount: parseFloat(e.target.value) || 0 }))}
                  className="bg-white"
                />
              </div>

              <div>
                <Label htmlFor="tax_rate" className="mb-2">Tax Rate (%)</Label>
                <Input
                  id="tax_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
                  className="bg-white"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="mb-2">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes or terms..."
              className="bg-white"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isLoading ? 'Saving...' : (invoice ? 'Update Invoice' : 'Create Invoice')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
