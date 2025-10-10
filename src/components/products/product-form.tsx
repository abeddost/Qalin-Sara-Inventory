'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { productFormSchema, type ProductFormData } from '@/lib/validations'
import { CARPET_SIZES } from '@/lib/constants'
import { toast } from 'sonner'
import { Loader2, Upload, X } from 'lucide-react'
import { STORAGE_BUCKET } from '@/lib/constants'

interface ProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: any
  onSuccess: () => void
}

export function ProductForm({ open, onOpenChange, product, onSuccess }: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(product?.photo_url || null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const supabase = createClient()

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      code: product?.code || '',
      sizes: product?.product_sizes?.map((size: any) => ({
        size: size.size,
        count: size.count,
        purchase_price: size.purchase_price,
        selling_price: size.selling_price,
      })) || CARPET_SIZES.map(size => ({
        size,
        count: 0,
        purchase_price: 0,
        selling_price: 0,
      })),
    },
  })

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setPhotoPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    form.setValue('photo', null)
  }

  const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `public/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Error uploading photo:', error)
      return null
    }
  }

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true)

    try {
      let photoUrl = product?.photo_url || null

      // Upload new photo if provided
      if (photoFile) {
        photoUrl = await uploadPhoto(photoFile)
        if (!photoUrl) {
          toast.error('Failed to upload photo')
          return
        }
      }

      if (product) {
        // Update existing product
        const { error: productError } = await supabase
          .from('products')
          .update({
            code: data.code,
            photo_url: photoUrl,
          })
          .eq('id', product.id)

        if (productError) throw productError

        // Delete existing sizes
        await supabase
          .from('product_sizes')
          .delete()
          .eq('product_id', product.id)

        // Insert new sizes
        const sizesToInsert = data.sizes
          .filter(size => size.count > 0 || size.purchase_price > 0 || size.selling_price > 0)
          .map(size => ({
            product_id: product.id,
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

        toast.success('Product updated successfully')
      } else {
        // Create new product
        const { data: newProduct, error: productError } = await supabase
          .from('products')
          .insert({
            code: data.code,
            photo_url: photoUrl,
          })
          .select()
          .single()

        if (productError) throw productError

        // Insert sizes
        const sizesToInsert = data.sizes
          .filter(size => size.count > 0 || size.purchase_price > 0 || size.selling_price > 0)
          .map(size => ({
            product_id: newProduct.id,
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

        toast.success('Product created successfully')
      }

      onSuccess()
      onOpenChange(false)
      form.reset()
      setPhotoPreview(null)
      setPhotoFile(null)
    } catch (error: any) {
      console.error('Error saving product:', error)
      toast.error(error.message || 'Failed to save product')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogDescription>
            {product ? 'Update product information and sizes' : 'Add a new carpet product with multiple sizes'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Product Code */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Code *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Photo Upload */}
            <div className="space-y-2">
              <Label>Product Photo</Label>
              <div className="space-y-4">
                {photoPreview ? (
                  <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                    <img
                      src={photoPreview}
                      alt="Product preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removePhoto}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">Upload a product photo</p>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="cursor-pointer"
                />
              </div>
            </div>

            {/* Size Entries */}
            <div className="space-y-4">
              <Label>Size Entries</Label>
              <div className="grid gap-4">
                {CARPET_SIZES.map((size, index) => (
                  <div key={size} className="grid grid-cols-5 gap-4 items-center p-4 border rounded-lg">
                    <Badge variant="secondary" className="w-fit">
                      {size}
                    </Badge>
                    
                    <FormField
                      control={form.control}
                      name={`sizes.${index}.count`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Count</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`sizes.${index}.purchase_price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Purchase Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`sizes.${index}.selling_price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Selling Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  product ? 'Update Product' : 'Create Product'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
