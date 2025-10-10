import { z } from 'zod'
import { CARPET_SIZES } from './constants'

// Product validation schema
export const productSchema = z.object({
  code: z.string().min(1, 'Product code is required').max(100, 'Code too long'),
  photo: z.any().optional(), // File object
})

// Size entry validation schema
export const sizeEntrySchema = z.object({
  size: z.enum(CARPET_SIZES),
  count: z.number().int().min(0, 'Count cannot be negative'),
  purchase_price: z.number().min(0, 'Purchase price cannot be negative'),
  selling_price: z.number().min(0, 'Selling price cannot be negative'),
})

// Complete product form schema
export const productFormSchema = z.object({
  code: z.string().min(1, 'Product code is required').max(100, 'Code too long'),
  photo: z.any().optional(),
  sizes: z.array(sizeEntrySchema).min(1, 'At least one size is required'),
})

// Login validation schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type ProductFormData = z.infer<typeof productFormSchema>
export type SizeEntry = z.infer<typeof sizeEntrySchema>
export type LoginFormData = z.infer<typeof loginSchema>
