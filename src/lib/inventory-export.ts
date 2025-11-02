import type { ProductWithSizes } from '@/types/database'

export interface ExportableProduct {
  code: string
  photo_url: string | null
  sizes: {
    size: string
    count: number
    purchase_price: number
    selling_price: number
  }[]
}

/**
 * Convert products to exportable format
 */
export function prepareProductsForExport(products: ProductWithSizes[]): ExportableProduct[] {
  return products.map(product => ({
    code: product.code,
    photo_url: product.photo_url,
    sizes: product.product_sizes.map(size => ({
      size: size.size,
      count: size.count,
      purchase_price: size.purchase_price,
      selling_price: size.selling_price,
    })),
  }))
}

/**
 * Export products to JSON format
 */
export function exportToJSON(products: ProductWithSizes[], filename?: string): void {
  const exportData = {
    metadata: {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      totalProducts: products.length,
      totalSizes: products.reduce((sum, p) => sum + p.product_sizes.length, 0),
    },
    data: prepareProductsForExport(products),
  }

  const dataStr = JSON.stringify(exportData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename || `inventory-export-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export products to CSV format
 */
export function exportToCSV(products: ProductWithSizes[], filename?: string): void {
  // Create CSV header
  const headers = [
    'Product Code',
    'Photo URL',
    'Size',
    'Count',
    'Purchase Price',
    'Selling Price',
  ]
  
  // Create CSV rows - one row per product size
  const rows: string[] = []
  
  products.forEach(product => {
    if (product.product_sizes.length === 0) {
      // Product with no sizes
      rows.push([
        product.code,
        product.photo_url || '',
        '',
        '0',
        '0',
        '0',
      ].join(','))
    } else {
      product.product_sizes.forEach(size => {
        rows.push([
          product.code,
          product.photo_url || '',
          size.size,
          size.count.toString(),
          size.purchase_price.toString(),
          size.selling_price.toString(),
        ].join(','))
      })
    }
  })

  // Escape CSV values (handle commas and quotes)
  const escapeCSV = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.split(',').map(escapeCSV).join(','))
  ].join('\n')

  const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(dataBlob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename || `inventory-export-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Parse JSON import file
 */
export function parseJSONImport(fileContent: string): ExportableProduct[] {
  try {
    const parsed = JSON.parse(fileContent)
    
    // Handle both direct array and wrapped format
    if (Array.isArray(parsed)) {
      return parsed
    } else if (parsed.data && Array.isArray(parsed.data)) {
      return parsed.data
    } else {
      throw new Error('Invalid JSON format: expected array or object with data array')
    }
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Simple CSV parser that handles quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  // Add last field
  result.push(current.trim())
  return result
}

/**
 * Parse CSV import file
 */
export function parseCSVImport(fileContent: string): ExportableProduct[] {
  const lines = fileContent.split(/\r?\n/).filter(line => line.trim())
  if (lines.length === 0) {
    throw new Error('CSV file is empty')
  }

  // Parse header
  const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim())
  const expectedHeaders = ['Product Code', 'Photo URL', 'Size', 'Count', 'Purchase Price', 'Selling Price']
  
  const headerIndices = expectedHeaders.map(expectedHeader => {
    const index = headers.findIndex(h => h.toLowerCase() === expectedHeader.toLowerCase())
    if (index === -1) {
      throw new Error(`Missing required column: ${expectedHeader}`)
    }
    return index
  })

  // Group rows by product code
  const productMap = new Map<string, ExportableProduct>()

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue // Skip empty lines
    
    const values = parseCSVLine(line).map(v => v.replace(/^"|"$/g, '').trim())
    
    if (values.length < headerIndices.length) {
      continue // Skip malformed rows
    }

    const code = values[headerIndices[0]] || ''
    const photoUrl = values[headerIndices[1]] || null
    const size = values[headerIndices[2]] || ''
    const count = parseInt(values[headerIndices[3]] || '0', 10) || 0
    const purchasePrice = parseFloat(values[headerIndices[4]] || '0') || 0
    const sellingPrice = parseFloat(values[headerIndices[5]] || '0') || 0

    if (!code) {
      continue // Skip rows without product code
    }

    if (!productMap.has(code)) {
      productMap.set(code, {
        code,
        photo_url: photoUrl,
        sizes: [],
      })
    }

    const product = productMap.get(code)!
    if (size && (count > 0 || purchasePrice > 0 || sellingPrice > 0)) {
      product.sizes.push({
        size,
        count,
        purchase_price: purchasePrice,
        selling_price: sellingPrice,
      })
    }
  }

  return Array.from(productMap.values())
}

/**
 * Validate imported products
 */
export function validateImportedProducts(products: ExportableProduct[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (products.length === 0) {
    errors.push('No products found in import file')
    return { valid: false, errors }
  }

  products.forEach((product, index) => {
    if (!product.code || product.code.trim() === '') {
      errors.push(`Product at index ${index}: Missing product code`)
    }

    if (!product.sizes || !Array.isArray(product.sizes)) {
      errors.push(`Product "${product.code}": Missing or invalid sizes array`)
    } else {
      product.sizes.forEach((size, sizeIndex) => {
        if (!size.size) {
          errors.push(`Product "${product.code}", size at index ${sizeIndex}: Missing size`)
        }
        if (typeof size.count !== 'number' || size.count < 0) {
          errors.push(`Product "${product.code}", size ${size.size}: Invalid count`)
        }
        if (typeof size.purchase_price !== 'number' || size.purchase_price < 0) {
          errors.push(`Product "${product.code}", size ${size.size}: Invalid purchase price`)
        }
        if (typeof size.selling_price !== 'number' || size.selling_price < 0) {
          errors.push(`Product "${product.code}", size ${size.size}: Invalid selling price`)
        }
      })
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}

