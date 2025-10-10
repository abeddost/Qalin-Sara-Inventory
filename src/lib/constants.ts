// Carpet size options
export const CARPET_SIZES = ['12m', '9m', '6m', '4m', '3m', '2m'] as const

export type CarpetSize = typeof CARPET_SIZES[number]

// File upload configuration
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Storage bucket name
export const STORAGE_BUCKET = 'carpet-photos'

// Application constants
export const APP_NAME = 'Qalin Sara Inventory'
