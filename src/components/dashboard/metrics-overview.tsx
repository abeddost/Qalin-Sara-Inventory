'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Users, Package, Building2, FileText } from 'lucide-react'
import type { ProductWithSizes } from '@/types/database'

interface MetricsOverviewProps {
  products: ProductWithSizes[]
}

export function MetricsOverview({ products }: MetricsOverviewProps) {
  // Calculate metrics
  const totalProducts = products.length
  const totalCount = products.reduce((sum, product) => 
    sum + product.product_sizes.reduce((sizeSum, size) => sizeSum + size.count, 0), 0
  )
  const totalPurchaseValue = products.reduce((sum, product) => 
    sum + product.product_sizes.reduce((sizeSum, size) => 
      sizeSum + (size.count * size.purchase_price), 0), 0
  )
  const totalSellingValue = products.reduce((sum, product) => 
    sum + product.product_sizes.reduce((sizeSum, size) => 
      sizeSum + (size.count * size.selling_price), 0), 0
  )

  const metrics = [
    {
      title: 'Total Customer',
      value: '160',
      icon: Users,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      trend: '+12%'
    },
    {
      title: 'Total Product',
      value: totalProducts.toString(),
      icon: Package,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100',
      trend: '+8%'
    },
    {
      title: 'Total Supplier',
      value: '24',
      icon: Users,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      trend: '+15%'
    },
    {
      title: 'Total Invoice',
      value: '684',
      icon: Building2,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      trend: '+18%'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <Card key={index} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</p>
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
