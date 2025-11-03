'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { ProductFormWizard } from './product-form-wizard'
import { ImagePreview } from './image-preview'
import { CARPET_SIZES } from '@/lib/constants'
import { toast } from 'sonner'
import { Edit, Trash2, Eye, Search, Package, ChevronUp, ChevronDown } from 'lucide-react'
import type { ProductWithSizes } from '@/types/database'

interface ProductTableProps {
  products: ProductWithSizes[]
  onRefresh: () => void
}

export function ProductTable({ products, onRefresh }: ProductTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'code' | 'created_at' | 'total_stock' | 'total_value'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedProduct, setSelectedProduct] = useState<ProductWithSizes | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<ProductWithSizes | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const supabase = createClient()

  const handleSort = (column: 'code' | 'created_at' | 'total_stock' | 'total_value') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const calculateTotalStock = (product: ProductWithSizes) => {
    return product.product_sizes.reduce((total, size) => total + size.count, 0)
  }

  const calculateTotalValue = (product: ProductWithSizes) => {
    return product.product_sizes.reduce((total, size) => total + (size.count * size.selling_price), 0)
  }

  const filteredAndSortedProducts = products
    .filter(product =>
      product.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'code':
          aValue = a.code
          bValue = b.code
          break
        case 'created_at':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        case 'total_stock':
          aValue = calculateTotalStock(a)
          bValue = calculateTotalStock(b)
          break
        case 'total_value':
          aValue = calculateTotalValue(a)
          bValue = calculateTotalValue(b)
          break
        default:
          return 0
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })

  const handleEdit = (product: ProductWithSizes) => {
    setSelectedProduct(product)
    setIsFormOpen(true)
  }

  const handleDelete = (product: ProductWithSizes) => {
    setProductToDelete(product)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!productToDelete) return

    setIsDeleting(true)
    try {
      // Delete photo from storage if exists
      if (productToDelete.photo_url) {
        const fileName = productToDelete.photo_url.split('/').pop()
        if (fileName) {
          await supabase.storage
            .from('carpet-photos')
            .remove([`public/${fileName}`])
        }
      }

      // Delete product (cascade delete will handle sizes)
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete.id)

      if (error) throw error

      toast.success('Product deleted successfully')
      onRefresh()
    } catch (error: any) {
      console.error('Error deleting product:', error)
      toast.error(error.message || 'Failed to delete product')
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  const handleImagePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl)
    setImagePreviewOpen(true)
  }

  const calculateTotals = () => {
    let totalCount = 0
    let totalPurchaseValue = 0
    let totalSellingValue = 0

    filteredAndSortedProducts.forEach(product => {
      product.product_sizes.forEach(size => {
        totalCount += size.count
        totalPurchaseValue += size.count * size.purchase_price
        totalSellingValue += size.count * size.selling_price
      })
    })

    return { totalCount, totalPurchaseValue, totalSellingValue }
  }

  const { totalCount, totalPurchaseValue, totalSellingValue } = calculateTotals()

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products by code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Photo</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 select-none"
                onClick={() => handleSort('code')}
              >
                <div className="flex items-center gap-1">
                  Code
                  {sortBy === 'code' && (
                    sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              {CARPET_SIZES.map(size => (
                <TableHead key={size} className="text-center min-w-32">
                  {size}
                </TableHead>
              ))}
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 select-none"
                onClick={() => handleSort('total_stock')}
              >
                <div className="flex items-center gap-1">
                  Total Stock
                  {sortBy === 'total_stock' && (
                    sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 select-none"
                onClick={() => handleSort('total_value')}
              >
                <div className="flex items-center gap-1">
                  Total Value
                  {sortBy === 'total_value' && (
                    sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No products found matching your search' : 'No products yet. Add your first product!'}
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-muted/50">
                  {/* Photo */}
                  <TableCell>
                    {product.photo_url ? (
                      <div className="relative">
                        <img
                          src={product.photo_url}
                          alt={product.code}
                          className="w-12 h-12 object-cover rounded border cursor-pointer hover:opacity-80"
                          onClick={() => product.photo_url && handleImagePreview(product.photo_url)}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute -top-1 -right-1 h-6 w-6 p-0"
                          onClick={() => product.photo_url && handleImagePreview(product.photo_url)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded border flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">No photo</span>
                      </div>
                    )}
                  </TableCell>

                  {/* Code */}
                  <TableCell className="font-medium">{product.code}</TableCell>

                  {/* Size columns */}
                  {CARPET_SIZES.map(size => {
                    const sizeData = product.product_sizes.find(s => s.size === size)
                    return (
                      <TableCell key={size} className="text-center">
                        {sizeData ? (
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{sizeData.count}</div>
                            <div className="text-xs text-muted-foreground">
                              ${sizeData.purchase_price.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ${sizeData.selling_price.toFixed(2)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    )
                  })}

                  {/* Total Stock */}
                  <TableCell className="text-center">
                    <div className="text-sm font-medium">
                      {calculateTotalStock(product)}
                    </div>
                  </TableCell>

                  {/* Total Value */}
                  <TableCell className="text-center">
                    <div className="text-sm font-medium">
                      ${calculateTotalValue(product).toFixed(2)}
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(product)}
                        className="bg-white border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
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

      {/* Totals Footer */}
      {filteredAndSortedProducts.length > 0 && (
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalCount}</div>
            <div className="text-sm text-muted-foreground">Total Units</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              ${totalPurchaseValue.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Purchase Value</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              ${totalSellingValue.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Selling Value</div>
          </div>
        </div>
      )}

      {/* Product Form */}
      <ProductFormWizard
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        product={selectedProduct}
        onSuccess={() => {
          onRefresh()
          setSelectedProduct(null)
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">Delete Product</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to delete product &quot;{productToDelete?.code}&quot;? 
              This will also delete all size entries and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</AlertDialogCancel>
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

      {/* Image Preview */}
      <ImagePreview
        open={imagePreviewOpen}
        onOpenChange={setImagePreviewOpen}
        imageUrl={previewImage}
      />
    </div>
  )
}
