'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import { MetricsOverview } from '@/components/dashboard/metrics-overview'
import { ProductTable } from '@/components/products/product-table'
import { ProductFormWizard } from '@/components/products/product-form-wizard'
import { useTheme } from '@/components/providers/theme-provider'
import { Button } from '@/components/ui/button'
import { 
  exportToJSON, 
  exportToCSV, 
  parseJSONImport, 
  parseCSVImport, 
  validateImportedProducts,
  type ExportableProduct 
} from '@/lib/inventory-export'
import { toast } from 'sonner'
import { Upload, FileJson, FileSpreadsheet } from 'lucide-react'
import type { ProductWithSizes } from '@/types/database'

export default function ProductsPage() {
  const { theme } = useTheme()
  const [products, setProducts] = useState<ProductWithSizes[]>([])
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalInvoices, setTotalInvoices] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [user, setUser] = useState<import('@supabase/supabase-js').User | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
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
    }
  }

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch all data in parallel
      const [productsResult, ordersResult, invoicesResult, expensesResult] = await Promise.all([
        supabase.from('products').select('*, product_sizes (*)').order('created_at', { ascending: false }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('invoices').select('id', { count: 'exact', head: true }),
        supabase.from('expenses').select('id', { count: 'exact', head: true })
      ])

      if (productsResult.error) throw productsResult.error
      if (ordersResult.error) throw ordersResult.error
      if (invoicesResult.error) throw invoicesResult.error
      if (expensesResult.error) throw expensesResult.error

      setProducts(productsResult.data || [])
      setTotalOrders(ordersResult.count || 0)
      setTotalInvoices(invoicesResult.count || 0)
      setTotalExpenses(expensesResult.count || 0)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleExportJSON = () => {
    try {
      setIsExporting(true)
      exportToJSON(products)
      toast.success('Inventory exported to JSON successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export inventory'
      console.error('Export error:', error)
      toast.error(errorMessage)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportCSV = () => {
    try {
      setIsExporting(true)
      exportToCSV(products)
      toast.success('Inventory exported to CSV successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export inventory'
      console.error('Export error:', error)
      toast.error(errorMessage)
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      const fileContent = await file.text()
      const fileExtension = file.name.split('.').pop()?.toLowerCase()

      let importedProducts: ExportableProduct[]

      if (fileExtension === 'json') {
        importedProducts = parseJSONImport(fileContent)
      } else if (fileExtension === 'csv') {
        importedProducts = parseCSVImport(fileContent)
      } else {
        throw new Error('Unsupported file format. Please use JSON or CSV files.')
      }

      // Validate imported data
      const validation = validateImportedProducts(importedProducts)
      if (!validation.valid) {
        toast.error(`Import validation failed: ${validation.errors.join(', ')}`)
        return
      }

      // Confirm import
      const confirmed = window.confirm(
        `Import ${importedProducts.length} products? This will create new products if they don't exist, or update existing ones.`
      )

      if (!confirmed) {
        return
      }

      // Import products
      let successCount = 0
      let errorCount = 0

      for (const productData of importedProducts) {
        try {
          // Check if product exists by code
          const { data: existingProducts } = await supabase
            .from('products')
            .select('id')
            .eq('code', productData.code)
            .limit(1)

          let productId: string

          if (existingProducts && existingProducts.length > 0) {
            // Update existing product
            const { error: updateError } = await supabase
              .from('products')
              .update({
                photo_url: productData.photo_url,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existingProducts[0].id)

            if (updateError) throw updateError
            productId = existingProducts[0].id

            // Delete existing sizes
            await supabase
              .from('product_sizes')
              .delete()
              .eq('product_id', productId)
          } else {
            // Create new product
            const { data: newProduct, error: insertError } = await supabase
              .from('products')
              .insert({
                code: productData.code,
                photo_url: productData.photo_url,
              })
              .select()
              .single()

            if (insertError) throw insertError
            productId = newProduct.id
          }

          // Insert sizes
          if (productData.sizes && productData.sizes.length > 0) {
            const sizesToInsert = productData.sizes
              .filter(size => size.count > 0 || size.purchase_price > 0 || size.selling_price > 0)
              .map(size => ({
                product_id: productId,
                size: size.size,
                count: size.count,
                purchase_price: size.purchase_price,
                selling_price: size.selling_price,
              }))

            if (sizesToInsert.length > 0) {
              const { error: sizesError } = await supabase
                .from('product_sizes')
                .insert(sizesToInsert)

              if (sizesError) throw sizesError
            }
          }

          successCount++
        } catch (error) {
          console.error(`Error importing product ${productData.code}:`, error)
          errorCount++
        }
      }

      // Reset file input
      event.target.value = ''

      if (errorCount > 0) {
        toast.warning(`Imported ${successCount} products with ${errorCount} errors`)
      } else {
        toast.success(`Successfully imported ${successCount} products`)
      }

      // Refresh data
      fetchDashboardData()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import inventory'
      console.error('Import error:', error)
      toast.error(errorMessage)
      event.target.value = ''
    } finally {
      setIsImporting(false)
    }
  }

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
    <div className="min-h-screen w-full max-w-full overflow-x-hidden">
      <Header onAddProduct={() => setIsFormOpen(true)} user={user} />
      
      <div className="p-3 sm:p-6 w-full max-w-full overflow-x-hidden">
        {/* Key Metrics */}
        <MetricsOverview 
          products={products} 
          totalOrders={totalOrders}
          totalInvoices={totalInvoices}
          totalExpenses={totalExpenses}
        />

        {/* Export/Import Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Inventory Data Management</h3>
              <p className="text-sm text-gray-600">Export your inventory data or import from a file</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-3">
              {/* Export Buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleExportJSON}
                  disabled={isExporting || products.length === 0}
                  variant="outline"
                  className="flex items-center space-x-2 flex-1 sm:flex-initial"
                >
                  <FileJson className="h-4 w-4" />
                  <span className="text-sm sm:text-base">Export JSON</span>
                </Button>
                <Button
                  onClick={handleExportCSV}
                  disabled={isExporting || products.length === 0}
                  variant="outline"
                  className="flex items-center space-x-2 flex-1 sm:flex-initial"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span className="text-sm sm:text-base">Export CSV</span>
                </Button>
              </div>

              {/* Import Button */}
              <div className="w-full sm:w-auto">
                <input
                  id="import-file"
                  type="file"
                  accept=".json,.csv"
                  onChange={handleImportFile}
                  className="hidden"
                  disabled={isImporting}
                />
                <Button
                  variant="default"
                  disabled={isImporting}
                  className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                  onClick={() => document.getElementById('import-file')?.click()}
                >
                  <Upload className="h-4 w-4" />
                  <span className="text-sm sm:text-base">{isImporting ? 'Importing...' : 'Import Data'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 w-full max-w-full overflow-x-hidden">
          <ProductTable products={products} onRefresh={fetchDashboardData} />
        </div>

        {/* Add Product Form */}
        <ProductFormWizard
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSuccess={fetchDashboardData}
        />
      </div>
    </div>
  )
}
