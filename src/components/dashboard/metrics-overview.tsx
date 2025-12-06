'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Users, Package, Building2, FileText, Receipt } from 'lucide-react'
import type { ProductWithSizes } from '@/types/database'

interface MetricsOverviewProps {
  products: ProductWithSizes[]
  totalOrders?: number
  totalInvoices?: number
  totalExpenses?: number
}

export function MetricsOverview({ products, totalOrders = 0, totalInvoices = 0, totalExpenses = 0 }: MetricsOverviewProps) {
  // Calculate metrics
  const totalProducts = products.length
  const totalCount = products.reduce((sum, product) => 
    sum + product.product_sizes.reduce((sizeSum, size) => sizeSum + (size.count || 0), 0), 0
  )
  const totalPurchaseValue = products.reduce((sum, product) => 
    sum + product.product_sizes.reduce((sizeSum, size) => 
      sizeSum + ((size.count || 0) * (size.purchase_price || 0)), 0), 0
  )
  const totalSellingValue = products.reduce((sum, product) => 
    sum + product.product_sizes.reduce((sizeSum, size) => 
      sizeSum + ((size.count || 0) * (size.selling_price || 0)), 0), 0
  )

  const metrics = [
    {
      title: 'Total Products',
      value: totalProducts.toString(),
      icon: Package,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      trend: '+8%'
    },
    {
      title: 'Total Inventory',
      value: totalCount.toString(),
      icon: Package,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      trend: '+12%'
    },
    {
      title: 'Total Orders',
      value: totalOrders.toString(),
      icon: Building2,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
      trend: '+15%'
    },
    {
      title: 'Total Value',
      value: `€${totalSellingValue.toLocaleString()}`,
      icon: FileText,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100',
      trend: '+18%'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {metrics.map((metric, index) => (
        <Card key={index} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{metric.value}</p>
                <div className="flex items-center text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">{metric.trend}</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${metric.iconBg}`}>
                <metric.icon className={`h-8 w-8 ${metric.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
