/**
 * @fileoverview Utility functions used throughout the application
 * @module lib/utils
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges Tailwind CSS classes with proper conflict resolution
 * Combines clsx for conditional classes with tailwind-merge for deduplication
 * 
 * @param inputs - Class values to merge (strings, objects, arrays)
 * @returns Merged class string with conflicts resolved
 * 
 * @example
 * cn('px-4 py-2', 'px-6') // Returns 'py-2 px-6'
 * cn('bg-red-500', isActive && 'bg-blue-500') // Conditional classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as currency with the Euro symbol
 * 
 * @param amount - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string
 * 
 * @example
 * formatCurrency(1234.5) // Returns '€1,234.50'
 */
export function formatCurrency(amount: number, decimals: number = 2): string {
  return `€${amount.toLocaleString('en-US', { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  })}`
}

/**
 * Formats a date string to a localized date format
 * 
 * @param dateString - ISO date string or Date object
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 * 
 * @example
 * formatDate('2024-01-15') // Returns '15/01/2024' or localized equivalent
 */
export function formatDate(
  dateString: string | Date, 
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  }
): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  return date.toLocaleDateString(undefined, options)
}

/**
 * Calculates the relative time from a given date
 * 
 * @param date - The date to calculate from
 * @returns Human-readable relative time string
 * 
 * @example
 * getRelativeTime(new Date(Date.now() - 3600000)) // Returns '1 hour ago'
 */
export function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return formatDate(date)
}
