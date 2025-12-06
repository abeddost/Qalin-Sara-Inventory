'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTheme } from '@/components/providers/theme-provider'
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  BarChart3,
  PieChart,
  Calendar,
  Target,
  AlertCircle,
  FileText,
  Receipt
} from 'lucide-react'
import type { ProductWithSizes } from '@/types/database'

interface AnalyticsData {
  totalProducts: number
  totalInventory: number
  totalValue: number
  averagePrice: number
  topSellingSize: string
  lowStockItems: number
  inventoryGrowth: number
  valueGrowth: number
  sizeDistribution: Array<{ size: string; count: number; percentage: number }>
  priceRange: {
    min: number
    max: number
    avg: number
  }
}

export default function AnalyticsPage() {
  const { theme } = useTheme()
  const router = useRouter()
  const [products, setProducts] = useState<ProductWithSizes[]>([])
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d')
  const supabase = createClient()

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_sizes (*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateAnalytics = (): AnalyticsData => {
    let totalInventory = 0
    let totalValue = 0
    let totalSellingValue = 0
    const sizeCounts: Record<string, number> = {}
    const allPrices: number[] = []
    let lowStockCount = 0

    products.forEach(product => {
      product.product_sizes.forEach(size => {
        totalInventory += size.count
        totalValue += size.count * size.purchase_price
        totalSellingValue += size.count * size.selling_price
        allPrices.push(size.purchase_price, size.selling_price)
        
        // Count sizes
        sizeCounts[size.size] = (sizeCounts[size.size] || 0) + size.count
        
        // Check for low stock (less than 5 items)
        if (size.count < 5) {
          lowStockCount++
        }
      })
    })

    const totalProducts = products.length
    const averagePrice = allPrices.length > 0 ? allPrices.reduce((a, b) => a + b, 0) / allPrices.length : 0
    const topSellingSize = Object.entries(sizeCounts).reduce((a, b) => sizeCounts[a[0]] > sizeCounts[b[0]] ? a : b)[0]

    // Calculate size distribution
    const totalSizeCount = Object.values(sizeCounts).reduce((a, b) => a + b, 0)
    const sizeDistribution = Object.entries(sizeCounts).map(([size, count]) => ({
      size,
      count,
      percentage: totalSizeCount > 0 ? Math.round((count / totalSizeCount) * 100) : 0
    })).sort((a, b) => b.count - a.count)

    // Calculate price range
    const priceRange = {
      min: allPrices.length > 0 ? Math.min(...allPrices) : 0,
      max: allPrices.length > 0 ? Math.max(...allPrices) : 0,
      avg: averagePrice
    }

    return {
      totalProducts,
      totalInventory,
      totalValue: totalSellingValue, // Use selling value for analytics
      averagePrice,
      topSellingSize,
      lowStockItems: lowStockCount,
      inventoryGrowth: 0, // No historical data available
      valueGrowth: 0, // No historical data available
      sizeDistribution,
      priceRange
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (products.length > 0) {
      setAnalyticsData(calculateAnalytics())
    }
  }, [products])

  if (isLoading) {
    return (
      <div className="min-h-screen p-3 sm:p-6 w-full max-w-full overflow-x-hidden">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p 
              style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
            >
              Loading analytics...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen p-3 sm:p-6 w-full max-w-full overflow-x-hidden">
        <div className="text-center">
          <AlertCircle 
            className="h-12 w-12 mx-auto mb-4"
            style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
          />
          <h3 
            className="text-lg font-semibold mb-2"
            style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
          >
            No Data Available
          </h3>
          <p 
            style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
          >
            Add some products to see analytics
          </p>
        </div>
      </div>
    )
  }

  const metrics = [
    {
      title: 'Total Products',
      value: analyticsData.totalProducts.toString(),
      icon: Package,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      trend: analyticsData.totalProducts > 0 ? 'Active' : 'No Data'
    },
    {
      title: 'Total Inventory',
      value: analyticsData.totalInventory.toString(),
      icon: Package,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      trend: analyticsData.totalInventory > 0 ? 'In Stock' : 'Empty'
    },
    {
      title: 'Total Value',
      value: `€${analyticsData.totalValue.toLocaleString()}`,
      icon: DollarSign,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
      trend: analyticsData.totalValue > 0 ? 'Valued' : 'No Value'
    },
    {
      title: 'Average Price',
      value: `€${analyticsData.averagePrice.toFixed(2)}`,
      icon: Target,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100',
      trend: analyticsData.averagePrice > 0 ? 'Priced' : 'No Price'
    }
  ]

  const alertMetrics = [
    {
      title: 'Low Stock Items',
      value: analyticsData.lowStockItems.toString(),
      icon: AlertCircle,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      description: 'Items with less than 5 units'
    },
    {
      title: 'Top Selling Size',
      value: analyticsData.topSellingSize,
      icon: TrendingUp,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      description: 'Most popular carpet size'
    }
  ]

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
              Analytics Dashboard
            </h1>
            <p 
              className="mt-2"
              style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
            >
              Comprehensive insights into your inventory performance
            </p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d' | '1y' | 'all')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {metrics.map((metric, index) => (
          <Card key={index} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</p>
                  <div className="flex items-center text-blue-600">
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

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {alertMetrics.map((alert, index) => (
          <Card key={index} className="bg-white border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${alert.iconBg}`}>
                  <alert.icon className={`h-8 w-8 ${alert.iconColor}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{alert.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{alert.value}</p>
                  <p className="text-xs text-gray-500">{alert.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Size Distribution */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Size Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.sizeDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {item.size}
                    </Badge>
                    <span className="text-sm text-gray-600">{item.count} units</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Price Range */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Price Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Min Price</p>
                  <p className="text-2xl font-bold text-green-600">
                    €{analyticsData.priceRange.min.toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Average</p>
                  <p className="text-2xl font-bold text-blue-600">
                    €{analyticsData.priceRange.avg.toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Max Price</p>
                  <p className="text-2xl font-bold text-purple-600">
                    €{analyticsData.priceRange.max.toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Price Range Distribution</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Low Range</span>
                    <span className="font-medium">€{analyticsData.priceRange.min.toFixed(2)} - €{(analyticsData.priceRange.avg * 0.7).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Mid Range</span>
                    <span className="font-medium">€{(analyticsData.priceRange.avg * 0.7).toFixed(2)} - €{(analyticsData.priceRange.avg * 1.3).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">High Range</span>
                    <span className="font-medium">€{(analyticsData.priceRange.avg * 1.3).toFixed(2)} - €{analyticsData.priceRange.max.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => router.push('/orders')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <ShoppingCart className="h-6 w-6 text-blue-600 mb-2" />
              <p className="font-medium text-gray-900">Create Order</p>
              <p className="text-sm text-gray-500">Start a new order</p>
            </button>
            <button 
              onClick={() => router.push('/products')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <Package className="h-6 w-6 text-green-600 mb-2" />
              <p className="font-medium text-gray-900">Add Product</p>
              <p className="text-sm text-gray-500">Add new inventory</p>
            </button>
            <button 
              onClick={() => router.push('/invoices')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <FileText className="h-6 w-6 text-purple-600 mb-2" />
              <p className="font-medium text-gray-900">Create Invoice</p>
              <p className="text-sm text-gray-500">Generate new invoice</p>
            </button>
            <button 
              onClick={() => router.push('/expenses')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <Receipt className="h-6 w-6 text-orange-600 mb-2" />
              <p className="font-medium text-gray-900">Expenses</p>
              <p className="text-sm text-gray-500">Track expenses</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

