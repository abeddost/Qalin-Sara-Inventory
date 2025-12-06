'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { productFormSchema, type ProductFormData } from '@/lib/validations'
import { z } from 'zod'
import { CARPET_SIZES } from '@/lib/constants'
import { toast } from 'sonner'
import { Loader2, Upload, X, Plus, Trash2, ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { STORAGE_BUCKET } from '@/lib/constants'

interface ProductFormWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: any
  onSuccess: () => void
}

interface SizeEntry {
  id: string
  size: string
  count: number | null
  purchase_price: number | null
  selling_price: number | null
}

const steps = [
  { id: 1, title: "Basic Info", description: "Product code and photo" },
  { id: 2, title: "Sizes", description: "Add available sizes" },
  { id: 3, title: "Review", description: "Confirm details" }
]

export function ProductFormWizard({ open, onOpenChange, product, onSuccess }: ProductFormWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(product?.photo_url || null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [sizeEntries, setSizeEntries] = useState<SizeEntry[]>(
    product?.product_sizes?.map((size: any, index: number) => ({
      id: `size-${index}`,
      size: size.size,
      count: size.count,
      purchase_price: size.purchase_price,
      selling_price: size.selling_price,
    })) || []
  )
  // Snapshot data for review step
  const [reviewSnapshot, setReviewSnapshot] = useState<{
    formData: any
    sizeEntries: SizeEntry[]
    photoPreview: string | null
  } | null>(null)
  const supabase = createClient()

  // Create a custom validation schema that doesn't require sizes array
  const customProductSchema = z.object({
    code: z.string().min(1, 'Product code is required').max(100, 'Code too long'),
    photo: z.any().optional(),
  })

  type CustomProductFormData = z.infer<typeof customProductSchema>

  const form = useForm<CustomProductFormData>({
    resolver: zodResolver(customProductSchema),
    defaultValues: {
      code: product?.code || '',
    },
  })

  // Reset form when product changes or dialog opens/closes
  useEffect(() => {
    if (open) {
      // Reset to step 1 when opening
      setCurrentStep(1)
      
      // Set form values based on whether we're editing or creating
      if (product) {
        // Editing existing product
        form.reset({
          code: product.code || '',
        })
        setPhotoPreview(product.photo_url || null)
        setPhotoFile(null)
        setSizeEntries(
          product.product_sizes?.map((size: any, index: number) => ({
            id: `size-${index}`,
            size: size.size,
            count: size.count,
            purchase_price: size.purchase_price,
            selling_price: size.selling_price,
          })) || []
        )
      } else {
        // Creating new product
        form.reset({
          code: '',
        })
        setPhotoPreview(null)
        setPhotoFile(null)
        setSizeEntries([])
      }
      } else {
        // Reset everything when dialog is closed
        setCurrentStep(1)
        setPhotoPreview(null)
        setPhotoFile(null)
        setSizeEntries([])
        setReviewSnapshot(null)
        form.reset()
      }
  }, [open, product])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (650KB = 650 * 1024 bytes)
      const maxSize = 650 * 1024
      if (file.size > maxSize) {
        toast.error(`File size must be less than 650KB. Current size: ${(file.size / 1024).toFixed(1)}KB`)
        return
      }
      
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        // Check file size (650KB = 650 * 1024 bytes)
        const maxSize = 650 * 1024
        if (file.size > maxSize) {
          toast.error(`File size must be less than 650KB. Current size: ${(file.size / 1024).toFixed(1)}KB`)
          return
        }
        
        setPhotoFile(file)
        const reader = new FileReader()
        reader.onload = (e) => {
          setPhotoPreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const removePhoto = () => {
    setPhotoPreview(null)
    setPhotoFile(null)
  }

  const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `public/${fileName}` // Upload to public folder as required by storage policy

      console.log('Uploading photo to path:', filePath)
      
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }

      const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath)

      console.log('Photo uploaded successfully:', data.publicUrl)
      return data.publicUrl
    } catch (error) {
      console.error('Error uploading photo:', error)
      return null
    }
  }

  const addSizeEntry = () => {
    const newSize: SizeEntry = {
      id: `size-${Date.now()}`,
      size: '',
      count: null,
      purchase_price: null,
      selling_price: null,
    }
    setSizeEntries([...sizeEntries, newSize])
  }

  const removeSizeEntry = (id: string) => {
    setSizeEntries(sizeEntries.filter(entry => entry.id !== id))
  }

  const updateSizeEntry = (id: string, field: keyof Omit<SizeEntry, 'id'>, value: string | number) => {
    console.log('🔄 UPDATE SIZE ENTRY:', { id, field, value, currentStep, hasSnapshot: !!reviewSnapshot })
    setSizeEntries(sizeEntries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ))
  }

  const onSubmit = async (data: CustomProductFormData) => {
    console.log('🚨 FORM SUBMISSION TRIGGERED! 🚨', {
      currentStep,
      isEditing: !!product,
      productId: product?.id,
      formData: data,
      sizeEntries: sizeEntries,
      stackTrace: new Error().stack
    })
    
    // GUARD: Only allow submission on step 3
    if (currentStep !== 3) {
      console.log('❌ BLOCKING SUBMISSION - Not on step 3, current step:', currentStep)
      return
    }
    
    setIsLoading(true)

    try {
      // Check if product code already exists (only for new products or when code is changed)
      if (!product || data.code !== product.code) {
        const { data: existingProduct } = await supabase
          .from('products')
          .select('id')
          .eq('code', data.code)
          .single()

        if (existingProduct) {
          // Suggest next available code
          const { data: allCodes } = await supabase
            .from('products')
            .select('code')
            .order('code')
          
          const numericCodes = allCodes?.map(p => p.code).filter(code => /^\d+€/.test(code)) || []
          const nextNumeric = numericCodes.length > 0 ? Math.max(...numericCodes.map(Number)) + 1 : 1
          
          toast.error(`Product code "${data.code}" already exists. Try using "${nextNumeric}" or "${data.code}-1"`)
          setIsLoading(false)
          return
        }
      }
      let photoUrl = product?.photo_url || null

      // Upload new photo if provided
      if (photoFile) {
        photoUrl = await uploadPhoto(photoFile)
        if (!photoUrl) {
          toast.error('Failed to upload photo')
          setIsLoading(false)
          return
        }
      }

      // Filter out empty size entries
      const validSizeEntries = sizeEntries.filter(entry => 
        entry.size && ((entry.count !== null && entry.count > 0) || (entry.purchase_price !== null && entry.purchase_price > 0) || (entry.selling_price !== null && entry.selling_price > 0))
      )

      // Check if we have valid sizes
      if (validSizeEntries.length === 0) {
        toast.error('Please add at least one size entry')
        setIsLoading(false)
        return
      }

      if (product) {
        // Update existing product
        console.log('Updating product:', {
          id: product.id,
          oldCode: product.code,
          newCode: data.code,
          oldPhoto: product.photo_url,
          newPhoto: photoUrl,
          sizeEntries: validSizeEntries
        })
        
        const { error: productError } = await supabase
          .from('products')
          .update({
            code: data.code,
            photo_url: photoUrl,
          })
          .eq('id', product.id)

        if (productError) {
          console.error('Product update error:', productError)
          throw new Error(`Failed to update product: ${productError.message}`)
        }

        // Delete existing sizes
        await supabase
          .from('product_sizes')
          .delete()
          .eq('product_id', product.id)

        // Insert new sizes
        if (validSizeEntries.length > 0) {
          const sizesToInsert = validSizeEntries.map(entry => ({
            product_id: product.id,
            size: entry.size,
            count: entry.count || 0,
            purchase_price: entry.purchase_price || 0,
            selling_price: entry.selling_price || 0,
          }))

          const { error: sizesError } = await supabase
            .from('product_sizes')
            .insert(sizesToInsert)

          if (sizesError) {
            console.error('Size update error:', sizesError)
            throw new Error(`Failed to update size entries: ${sizesError.message}`)
          }
        }

        toast.success('Product updated successfully')
      } else {
        // Create new product
        console.log('Attempting to create product with:', { code: data.code, photo_url: photoUrl })
        const { data: newProduct, error: productError } = await supabase
          .from('products')
          .insert({
            code: data.code,
            photo_url: photoUrl,
          })
          .select()
          .single()

        if (productError) {
          console.error('Product creation error:', productError)
          if (productError.code === '23505' || productError.message.includes('duplicate key')) {
            throw new Error(`Product code "${data.code}" already exists. Please use a different code.`)
          }
          throw new Error(`Failed to create product: ${productError.message}`)
        }

        // Insert sizes
        if (validSizeEntries.length > 0) {
          const sizesToInsert = validSizeEntries.map(entry => ({
            product_id: newProduct.id,
            size: entry.size,
            count: entry.count || 0,
            purchase_price: entry.purchase_price || 0,
            selling_price: entry.selling_price || 0,
          }))

          const { error: sizesError } = await supabase
            .from('product_sizes')
            .insert(sizesToInsert)

          if (sizesError) {
            console.error('Size insertion error:', sizesError)
            throw new Error(`Failed to create size entries: ${sizesError.message}`)
          }
        }

        toast.success('Product created successfully')
      }

      onSuccess()
      onOpenChange(false)
      // Form reset is handled by useEffect when dialog opens/closes
    } catch (error: any) {
      console.error('Error saving product:', error)
      toast.error(`Failed to save product: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = async () => {
    if (currentStep < 3) {
      // Validate current step before proceeding
      if (currentStep === 1) {
        const isValid = await form.trigger('code')
        if (!isValid) return
      }
      
      if (currentStep === 2) {
        const hasValidSizes = sizeEntries.length > 0 && sizeEntries.some(entry => 
          entry.size && ((entry.count !== null && entry.count > 0) || (entry.purchase_price !== null && entry.purchase_price > 0) || (entry.selling_price !== null && entry.selling_price > 0))
        )
        if (!hasValidSizes) {
          toast.error('Please add at least one valid size entry.')
          return
        }
      }
      
      // Capture snapshot when moving to step 3 (review) - regardless of current step
      if (currentStep + 1 === 3) {
        const snapshotData = {
          formData: form.getValues(),
          sizeEntries: JSON.parse(JSON.stringify(sizeEntries)), // Deep copy
          photoPreview: photoPreview
        }
        console.log('📸 CAPTURING REVIEW SNAPSHOT:', snapshotData)
        setReviewSnapshot(snapshotData)
      }
      
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      // Clear snapshot when going back from review step
      if (currentStep === 3) {
        setReviewSnapshot(null)
      }
    }
  }

  const canProceed = () => {
    const formData = form.getValues()
    switch (currentStep) {
      case 1:
        return formData.code.trim() !== ''
      case 2:
        return sizeEntries.length > 0 && sizeEntries.some(entry => entry.size && entry.count !== null && entry.count > 0)
      case 3:
        return true
      default:
        return false
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6 p-6 bg-gray-50 rounded-lg">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Basic Product Information</h3>
        <p className="text-gray-600">Start by entering the product code and uploading a photo</p>
      </div>

      <FormField
        control={form.control}
        name="code"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold text-gray-800">Product Code *</FormLabel>
            <FormControl>
              <Input 
                placeholder="e.g., CARP-001, RUG-2024-01" 
                {...field}
                className="h-12 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                onChange={(e) => {
                  console.log('📝 FORM CODE CHANGE:', { value: e.target.value, currentStep, hasSnapshot: !!reviewSnapshot })
                  field.onChange(e)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    console.log('Enter key prevented on product code input')
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-3">
        <Label className="text-base font-semibold text-gray-800">Product Photo (Optional)</Label>
        <div className="space-y-4">
          {photoPreview ? (
            <div className="relative w-full h-48 border-2 border-gray-200 rounded-lg overflow-hidden">
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
            <label htmlFor="photo-upload" className="cursor-pointer">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-16 w-16 text-blue-400 mb-4" />
                <p className="text-lg font-semibold text-gray-700 mb-2">Upload a product photo</p>
                <p className="text-sm text-gray-500">Drag and drop or click to browse</p>
                <p className="text-xs text-gray-400 mt-1">Maximum file size: 650KB</p>
              </div>
            </label>
          )}
          <Input
            id="photo-upload"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="cursor-pointer hidden"
          />
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6 p-6 bg-gray-50 rounded-lg">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Product Sizes</h3>
        <p className="text-gray-600">Add the available sizes and their details</p>
      </div>

      <div className="space-y-4">
        {sizeEntries.map((entry, index) => (
          <Card key={entry.id} className="p-4 bg-white border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div>
                <Label className="text-sm font-semibold text-gray-800">Size</Label>
                <select
                  value={entry.size}
                  onChange={(e) => updateSizeEntry(entry.id, 'size', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select size</option>
                  {CARPET_SIZES.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label className="text-sm font-semibold text-gray-800">Count</Label>
                <Input
                  type="number"
                  min="0"
                  value={entry.count === null ? '' : entry.count}
                  placeholder="0"
                  onChange={(e) => updateSizeEntry(entry.id, 'count', e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                  className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      console.log('Enter key prevented on count input')
                    }
                  }}
                />
              </div>
              
              <div>
                <Label className="text-sm font-semibold text-gray-800">Purchase Price</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={entry.purchase_price === null ? '' : entry.purchase_price}
                  placeholder="0"
                  onChange={(e) => updateSizeEntry(entry.id, 'purchase_price', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                  className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      console.log('Enter key prevented on purchase price input')
                    }
                  }}
                />
              </div>
              
              <div>
                <Label className="text-sm font-semibold text-gray-800">Selling Price</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={entry.selling_price === null ? '' : entry.selling_price}
                  placeholder="0"
                  onChange={(e) => updateSizeEntry(entry.id, 'selling_price', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                  className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      console.log('Enter key prevented on selling price input')
                    }
                  }}
                />
              </div>
              
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeSizeEntry(entry.id)}
                className="h-10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addSizeEntry}
          className="w-full h-12 border-dashed border-2 border-gray-300 hover:border-gray-400"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Size Entry
        </Button>
      </div>
    </div>
  )

  // Create a memoized review component that only updates when snapshot changes
  const ReviewComponent = React.useMemo(() => {
    if (!reviewSnapshot) {
      return (
        <div className="space-y-6 p-6 bg-gray-50 rounded-lg">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-red-600 mb-2">Error: No snapshot data</h3>
            <p className="text-gray-600">Please go back and try again</p>
          </div>
        </div>
      )
    }

    const displayData = reviewSnapshot
    const validSizes = displayData.sizeEntries.filter(entry => 
      entry.size && ((entry.count !== null && entry.count > 0) || (entry.purchase_price !== null && entry.purchase_price > 0) || (entry.selling_price !== null && entry.selling_price > 0))
    )

    return (
      <div className="space-y-6 p-6 bg-gray-50 rounded-lg">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Review & Confirm</h3>
          <p className="text-gray-600">Please review your product details before saving</p>
          <div className="mt-2 p-2 bg-blue-100 border border-blue-300 rounded text-sm text-blue-800">
            📸 Displaying snapshot data (frozen at step 3 entry)
          </div>
        </div>

        <div className="grid gap-6">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-semibold text-gray-800">Product Code:</span>
                <span className="ml-2 text-gray-600">{displayData.formData.code}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-800">Photo:</span>
                <span className="ml-2 text-gray-600">{displayData.photoPreview ? 'Uploaded' : 'No photo'}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Size Entries ({validSizes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {validSizes.length > 0 ? (
                <div className="space-y-3">
                  {validSizes.map((entry) => (
                    <div key={entry.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">{entry.size}</Badge>
                      <div className="text-xs sm:text-sm text-gray-700 font-medium flex flex-wrap gap-2 sm:gap-0 sm:block">
                        <span>Count: {entry.count || 0}</span>
                        <span className="hidden sm:inline"> | </span>
                        <span>Purchase: €{entry.purchase_price || 0}</span>
                        <span className="hidden sm:inline"> | </span>
                        <span>Selling: €{entry.selling_price || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic text-center py-4">No size entries added</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }, [reviewSnapshot]) // Only re-create when snapshot changes

  const renderStep3 = () => {
    console.log('🔍 RENDER STEP 3 DEBUG:', {
      hasSnapshot: !!reviewSnapshot,
      currentStep,
      snapshotCode: reviewSnapshot?.formData?.code,
      liveCode: form.getValues().code,
      snapshotSizes: reviewSnapshot?.sizeEntries,
      liveSizes: sizeEntries,
      codesMatch: reviewSnapshot?.formData?.code === form.getValues().code,
      sizesMatch: JSON.stringify(reviewSnapshot?.sizeEntries) === JSON.stringify(sizeEntries)
    })
    
    return ReviewComponent
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1()
      case 2:
        return renderStep2()
      case 3:
        return renderStep3()
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-gray-200 shadow-xl mx-2 sm:mx-0">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-8 p-4 bg-gray-50 rounded-lg">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium
                ${currentStep >= step.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-300 text-gray-600'
                }
              `}>
                {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <div className="ml-3 hidden sm:block">
                <p className={`text-sm font-semibold ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-700'}`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-600">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <Form {...form}>
          <form key={`form-step-${currentStep}`} onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            console.log('Form submit prevented - current step:', currentStep)
            // Only allow submission on the final step (Step 3)
            if (currentStep === 3) {
              console.log('Allowing form submission on step 3')
              form.handleSubmit(onSubmit)(e)
            } else {
              console.log('Blocking form submission - not on step 3')
            }
          }} className="space-y-8">
            <div key={`step-content-${currentStep}`}>
              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceed()}
                    className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading || !canProceed()}
                    className="px-6 py-2 bg-green-600 text-white hover:bg-green-700"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    {product ? 'Update Product' : 'Create Product'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
