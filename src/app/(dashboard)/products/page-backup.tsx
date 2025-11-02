'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import { MetricsOverview } from '@/components/dashboard/metrics-overview'
import { ProductTable } from '@/components/products/product-table'
import { ProductForm } from '@/components/products/product-form'
import type { ProductWithSizes } from '@/types/database'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithSizes[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const supabase = createClient()

  // Get user data
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
      <div className="min-h-screen bg-gray-50">
        {user ? <Header onAddProduct={() => setIsFormOpen(true)} user={user} /> : null}
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading inventory...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAddProduct={() => setIsFormOpen(true)} user={user as any} />
      
      <div className="p-6 space-y-6">
        {/* Dashboard Metrics */}
        <MetricsOverview products={products} />

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <ProductTable products={products} onRefresh={fetchProducts} />
        </div>

        {/* Add Product Form */}
        <ProductForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSuccess={fetchProducts}
        />
      </div>
    </div>
  )
}
