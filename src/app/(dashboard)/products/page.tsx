'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import { MetricsOverview } from '@/components/dashboard/metrics-overview'
import { ProductTable } from '@/components/products/product-table'
import { ProductFormWizard } from '@/components/products/product-form-wizard'
import { useTheme } from '@/components/providers/theme-provider'
import type { ProductWithSizes } from '@/types/database'

export default function ProductsPage() {
  const { theme } = useTheme()
  const [products, setProducts] = useState<ProductWithSizes[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  // Get user data from layout
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase.auth])

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

  useEffect(() => {
    fetchProducts()
  }, [])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto mb-4"></div>
              <p 
                style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
              >
                Loading dashboard...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header onAddProduct={() => setIsFormOpen(true)} user={user} />
      
      <div className="p-6">
        {/* Key Metrics */}
        <MetricsOverview products={products} />

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <ProductTable products={products} onRefresh={fetchProducts} />
        </div>

        {/* Add Product Form */}
        <ProductFormWizard
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSuccess={fetchProducts}
        />
      </div>
    </div>
  )
}
