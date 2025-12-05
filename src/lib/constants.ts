/**
 * @fileoverview Application constants and configuration values
 * @module lib/constants
 */

/**
 * Available carpet size options
 * Sizes are in meters, representing standard carpet dimensions
 */
export const CARPET_SIZES = ['12m', '9m', '6m', '4m', '3m', '2m'] as const

/**
 * Type representing valid carpet sizes
 */
export type CarpetSize = typeof CARPET_SIZES[number]

/**
 * Maximum allowed file size for uploads (in bytes)
 * @constant {number} 5MB
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024

/**
 * Allowed MIME types for image uploads
 */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/**
 * Supabase storage bucket name for carpet product photos
 */
export const STORAGE_BUCKET = 'carpet-photos'

/**
 * Application display name
 */
export const APP_NAME = 'Qalin Sara Inventory'

/**
 * Currency symbol used throughout the application
 */
export const CURRENCY_SYMBOL = '€'

/**
 * Default tax rate percentage (for VAT-inclusive pricing)
 */
export const DEFAULT_TAX_RATE = 0

/**
 * Low stock threshold for notifications
 * Products with stock below this trigger alerts
 */
export const LOW_STOCK_THRESHOLD = 5

/**
 * Number of days to look back for recent activity notifications
 */
export const NOTIFICATION_DAYS_LOOKBACK = 7
