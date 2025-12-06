'use client'

import { useEffect, useState, useRef } from 'react'
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
  XCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { OrderForm } from '@/components/orders/order-form'
import { OrderView } from '@/components/orders/order-view'
import type { OrderWithItems, ProductWithSizes } from '@/types/database'

// Custom Status Dropdown Component
function StatusDropdown({ currentStatus, onStatusChange }: { currentStatus: string, onStatusChange: (newStatus: string) => void }) {
  const { theme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

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

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleToggle = () => {
    console.log('Orders StatusDropdown toggle clicked, current isOpen:', isOpen)
    setIsOpen(!isOpen)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        ref={triggerRef}
        className="cursor-pointer"
        onClick={handleToggle}
      >
        <Badge className={`${getStatusColor(currentStatus)} hover:opacity-80 transition-opacity flex items-center gap-1`}>
          {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
          <ChevronDown className="h-3 w-3" />
        </Badge>
      </div>
      
      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-xl z-[9999] min-w-[120px]"
          style={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            maxHeight: '200px',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
        >
          {statusOptions.map((option) => (
            <div
              key={option.value}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 first:rounded-t-md last:rounded-b-md"
              style={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                color: theme === 'dark' ? '#ffffff' : '#111827'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1f2937' : '#ffffff'
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('Orders StatusDropdown option clicked:', option.value)
                onStatusChange(option.value)
                setIsOpen(false)
              }}
            >
              <Badge className={`${getStatusColor(option.value)} text-xs`}>
                {option.label}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function OrdersPage() {
  const { theme } = useTheme()
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [products, setProducts] = useState<ProductWithSizes[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'order_number' | 'customer_name' | 'status' | 'created_at' | 'final_amount'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<OrderWithItems | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false)
  const [orderToEdit, setOrderToEdit] = useState<OrderWithItems | null>(null)
  const [isOrderViewOpen, setIsOrderViewOpen] = useState(false)
  const [orderToView, setOrderToView] = useState<OrderWithItems | null>(null)
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

  const handleSort = (column: 'order_number' | 'customer_name' | 'status' | 'created_at' | 'final_amount') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const filteredAndSortedOrders = orders
    .filter(order => {
      const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      // Handle string comparisons
      if (sortBy === 'order_number' || sortBy === 'customer_name' || sortBy === 'status') {
        let aStr: string
        let bStr: string
        
        switch (sortBy) {
          case 'order_number':
            aStr = a.order_number
            bStr = b.order_number
            break
          case 'customer_name':
            aStr = a.customer_name
            bStr = b.customer_name
            break
          case 'status':
            aStr = a.status
            bStr = b.status
            break
          default:
            return 0
        }
        
        return sortOrder === 'asc' 
          ? aStr.localeCompare(bStr) 
          : bStr.localeCompare(aStr)
      }
      
      // Handle numeric comparisons
      let aNum: number
      let bNum: number
      
      switch (sortBy) {
        case 'created_at':
          aNum = new Date(a.created_at).getTime()
          bNum = new Date(b.created_at).getTime()
          break
        case 'final_amount':
          aNum = Number(a.final_amount) || 0
          bNum = Number(b.final_amount) || 0
          break
        default:
          return 0
      }
      
      return sortOrder === 'asc' ? aNum - bNum : bNum - aNum
    })

  const handleDelete = (order: OrderWithItems) => {
    setOrderToDelete(order)
    setIsDeleteDialogOpen(true)
  }

  const handleView = (order: OrderWithItems) => {
    setOrderToView(order)
    setIsOrderViewOpen(true)
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    console.log('updateOrderStatus called:', { orderId, newStatus })
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)

      if (error) throw error

      console.log('Database update successful, updating local state:', { orderId, newStatus })
      // Update local state instead of re-fetching all orders
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus as 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled', updated_at: new Date().toISOString() }
            : order
        )
      )

      toast.success(`Order status updated to ${newStatus}`)
    } catch (error) {
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete order'
      console.error('Error deleting order:', error)
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setOrderToDelete(null)
    }
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
    const totalOrders = filteredAndSortedOrders.length
    const totalValue = filteredAndSortedOrders.reduce((sum, order) => sum + order.final_amount, 0)
    const pendingOrders = filteredAndSortedOrders.filter(order => order.status === 'pending').length
    const confirmedOrders = filteredAndSortedOrders.filter(order => order.status === 'confirmed').length
    const processingOrders = filteredAndSortedOrders.filter(order => order.status === 'processing').length
    const shippedOrders = filteredAndSortedOrders.filter(order => order.status === 'shipped').length
    const deliveredOrders = filteredAndSortedOrders.filter(order => order.status === 'delivered').length
    const cancelledOrders = filteredAndSortedOrders.filter(order => order.status === 'cancelled').length

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
      <div className="min-h-screen p-3 sm:p-6 w-full max-w-full overflow-x-hidden">
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
    <div className="min-h-screen p-3 sm:p-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="mb-6 sm:mb-8 w-full max-w-full overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
            >
              Orders Management
            </h1>
            <p 
              className="mt-2 text-sm sm:text-base"
              style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
            >
              Track and manage customer orders
            </p>
            <div 
              className="mt-2 text-xs sm:text-sm px-3 py-1 rounded-full inline-block"
              style={{ 
                color: theme === 'dark' ? '#10b981' : '#059669',
                backgroundColor: theme === 'dark' ? '#064e3b' : '#d1fae5'
              }}
            >
              ✅ Database ready - Orders system active
            </div>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
            onClick={() => {
              setOrderToEdit(null)
              setIsOrderFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Create Order</span>
            <span className="sm:hidden">Create</span>
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
                  <p className="text-3xl font-bold text-gray-900">€{totalValue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 w-full max-w-full overflow-x-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto sm:min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
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

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full max-w-full">
        <div className="overflow-x-auto w-full">
          <Table className="w-full min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 select-none"
                onClick={() => handleSort('order_number')}
              >
                <div className="flex items-center gap-1">
                  Order #
                  {sortBy === 'order_number' && (
                    sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 select-none"
                onClick={() => handleSort('customer_name')}
              >
                <div className="flex items-center gap-1">
                  Customer
                  {sortBy === 'customer_name' && (
                    sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 select-none"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  Status
                  {sortBy === 'status' && (
                    sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead>Items</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 select-none"
                onClick={() => handleSort('final_amount')}
              >
                <div className="flex items-center gap-1">
                  Total
                  {sortBy === 'final_amount' && (
                    sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 select-none"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center gap-1">
                  Date
                  {sortBy === 'created_at' && (
                    sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedOrders.length === 0 ? (
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
              filteredAndSortedOrders.map((order) => (
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
                    <StatusDropdown 
                      currentStatus={order.status}
                      onStatusChange={(newStatus) => updateOrderStatus(order.id, newStatus)}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm text-gray-900">
                      {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm font-semibold text-gray-900">
                      €{order.final_amount.toFixed(2)}
                    </div>
                    {order.discount_amount > 0 && (
                      <div className="text-xs text-green-600">
                        -€{order.discount_amount.toFixed(2)} discount
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
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleView(order)}
                        title="View Order"
                      >
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
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">Delete Order</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to delete order &quot;{orderToDelete?.order_number}&quot;? 
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
        order={orderToEdit || undefined}
        onSuccess={() => {
          fetchOrders()
          setOrderToEdit(null)
        }}
      />

      {/* Order View */}
      <OrderView
        open={isOrderViewOpen}
        onClose={() => {
          setIsOrderViewOpen(false)
          setOrderToView(null)
        }}
        order={orderToView}
      />
    </div>
  )
}
