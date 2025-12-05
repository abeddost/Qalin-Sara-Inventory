'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OrderWithItems } from '@/types/database'
import { useTheme } from '@/components/providers/theme-provider'
import { 
  X, 
  FileText, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Package,
  DollarSign,
  ShoppingCart
} from 'lucide-react'

interface OrderViewProps {
  open: boolean
  onClose: () => void
  order: OrderWithItems | null
}

export function OrderView({ open, onClose, order }: OrderViewProps) {
  const { theme } = useTheme()

  if (!order) return null

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-gray-900 flex items-center justify-between">
            <span className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Order Details
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Header */}
          <div className="flex justify-between items-start border-b pb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ORDER</h1>
              <p className="text-gray-600 mt-2">Order #{order.order_number}</p>
              <p className="text-gray-500 text-sm mt-1">ID: {order.id.slice(0, 8)}...</p>
            </div>
            <div className="text-right">
              <Badge className={`${getStatusColor(order.status)} text-sm px-3 py-1`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
              <div className="flex items-center text-gray-600 mt-2">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-sm">
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900">{order.customer_name}</p>
                </div>
                {order.customer_email && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </label>
                    <p className="text-gray-900">{order.customer_email}</p>
                  </div>
                )}
                {order.customer_phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      Phone
                    </label>
                    <p className="text-gray-900">{order.customer_phone}</p>
                  </div>
                )}
                {order.customer_address && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      Address
                    </label>
                    <p className="text-gray-900">{order.customer_address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items:</span>
                  <span className="text-gray-900">{order.order_items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">€{order.total_amount.toFixed(2)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span className="text-red-600">-€{order.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                {order.tax_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="text-gray-900">€{order.tax_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold text-gray-900">Total:</span>
                  <span className="font-semibold text-gray-900">€{order.final_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Order Items
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Product
                    </th>
                    <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Size
                    </th>
                    <th className="border border-gray-200 px-4 py-2 text-center text-sm font-medium text-gray-700">
                      Quantity
                    </th>
                    <th className="border border-gray-200 px-4 py-2 text-right text-sm font-medium text-gray-700">
                      Unit Price
                    </th>
                    <th className="border border-gray-200 px-4 py-2 text-right text-sm font-medium text-gray-700">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.order_items.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">
                        {item.product_id}
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">
                        {item.product_size}
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-center text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-right text-sm text-gray-900">
                        €{item.unit_price.toFixed(2)}
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-right text-sm text-gray-900">
                        €{item.total_price.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{order.notes}</p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
            <div>
              <span className="font-medium">Created:</span> {new Date(order.created_at).toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Updated:</span> {new Date(order.updated_at).toLocaleString()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
