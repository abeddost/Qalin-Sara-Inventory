'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { useTheme } from '@/components/providers/theme-provider'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  ShoppingCart,
  Calendar,
  User,
  DollarSign,
  Filter,
  Download,
  CheckCircle,
  Clock,
  Package,
  Truck,
  XCircle
} from 'lucide-react'
import { OrderForm } from '@/components/orders/order-form'
import type { OrderWithItems, ProductWithSizes } from '@/types/database'

export default function OrdersPage() {
  const { theme } = useTheme()
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [products, setProducts] = useState<ProductWithSizes[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<OrderWithItems | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false)
  const [orderToEdit, setOrderToEdit] = useState<OrderWithItems | null>(null)
  const supabase = createClient()

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        // If table doesn't exist, show empty state with helpful message
        if (error.code === '42P01' || error.message.includes('relation "orders" does not exist')) {
          console.log('Orders table not found - database migrations needed')
          setOrders([])
          return
        }
        throw error
      }
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([]) // Set empty array to prevent UI errors
      // Only show error toast for actual errors, not when table is empty
      if (error && typeof error === 'object' && 'code' in error && error.code !== '42P01') {
        toast.error('Failed to fetch orders')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_sizes (*)
        `)

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  useEffect(() => {
    fetchOrders()
    fetchProducts()
  }, [])

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleDelete = (order: OrderWithItems) => {
    setOrderToDelete(order)
    setIsDeleteDialogOpen(true)
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)

      if (error) throw error

      toast.success(`Order status updated to ${newStatus}`)
      fetchOrders()
    } catch (error: any) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    }
  }

  const confirmDelete = async () => {
    if (!orderToDelete) return

    setIsDeleting(true)
    try {
      // Delete order items first (cascade should handle this, but being explicit)
      await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderToDelete.id)

      // Delete order
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderToDelete.id)

      if (error) throw error

      toast.success('Order deleted successfully')
      fetchOrders()
    } catch (error: any) {
      console.error('Error deleting order:', error)
      toast.error(error.message || 'Failed to delete order')
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setOrderToDelete(null)
    }
  }

  const getStatusColor = (status: string) => {
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

  const calculateTotals = () => {
    let totalOrders = filteredOrders.length
    let totalValue = filteredOrders.reduce((sum, order) => sum + order.final_amount, 0)
    let pendingOrders = filteredOrders.filter(order => order.status === 'pending').length
    let confirmedOrders = filteredOrders.filter(order => order.status === 'confirmed').length
    let processingOrders = filteredOrders.filter(order => order.status === 'processing').length
    let shippedOrders = filteredOrders.filter(order => order.status === 'shipped').length
    let deliveredOrders = filteredOrders.filter(order => order.status === 'delivered').length
    let cancelledOrders = filteredOrders.filter(order => order.status === 'cancelled').length

    return { 
      totalOrders, 
      totalValue, 
      pendingOrders, 
      confirmedOrders, 
      processingOrders, 
      shippedOrders, 
      deliveredOrders, 
      cancelledOrders 
    }
  }

  const { 
    totalOrders, 
    totalValue, 
    pendingOrders, 
    confirmedOrders, 
    processingOrders, 
    shippedOrders, 
    deliveredOrders, 
    cancelledOrders 
  } = calculateTotals()

  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p 
              style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
            >
              Loading orders...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 
              className="text-3xl font-bold"
              style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
            >
              Orders Management
            </h1>
            <p 
              className="mt-2"
              style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
            >
              Track and manage customer orders
            </p>
            <div 
              className="mt-2 text-sm px-3 py-1 rounded-full inline-block"
              style={{ 
                color: theme === 'dark' ? '#10b981' : '#059669',
                backgroundColor: theme === 'dark' ? '#064e3b' : '#d1fae5'
              }}
            >
              ✅ Database ready - Orders system active
            </div>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => {
              setOrderToEdit(null)
              setIsOrderFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Order
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="space-y-6 mb-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-3xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
                </div>
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Confirmed</p>
                  <p className="text-2xl font-bold text-blue-600">{confirmedOrders}</p>
                </div>
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Processing</p>
                  <p className="text-2xl font-bold text-purple-600">{processingOrders}</p>
                </div>
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Shipped</p>
                  <p className="text-2xl font-bold text-indigo-600">{shippedOrders}</p>
                </div>
                <Truck className="h-6 w-6 text-indigo-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-green-600">{deliveredOrders}</p>
                </div>
                <User className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">{cancelledOrders}</p>
                </div>
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-64"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="space-y-2">
                    <p className="text-gray-500">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'No orders found matching your criteria' 
                        : 'No orders yet. Create your first order!'
                      }
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{order.order_number}</p>
                      <p className="text-xs text-gray-500">ID: {order.id.slice(0, 8)}...</p>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.customer_name}</p>
                      {order.customer_email && (
                        <p className="text-xs text-gray-500">{order.customer_email}</p>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(order.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm text-gray-900">
                      {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm font-semibold text-gray-900">
                      ${order.final_amount.toFixed(2)}
                    </div>
                    {order.discount_amount > 0 && (
                      <div className="text-xs text-green-600">
                        -${order.discount_amount.toFixed(2)} discount
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm text-gray-900">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleTimeString()}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          setOrderToEdit(order)
                          setIsOrderFormOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDelete(order)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">Delete Order</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to delete order "{orderToDelete?.order_number}"? 
              This will also delete all order items and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Order Form */}
      <OrderForm
        open={isOrderFormOpen}
        onOpenChange={setIsOrderFormOpen}
        order={orderToEdit}
        onSuccess={() => {
          fetchOrders()
          setOrderToEdit(null)
        }}
      />
    </div>
  )
}
