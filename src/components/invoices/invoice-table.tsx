'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InvoiceWithItems } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Eye, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useTheme } from '@/components/providers/theme-provider'
import InvoiceForm from './invoice-form'
import InvoiceView from './invoice-view'

interface InvoiceTableProps {
  invoices: InvoiceWithItems[]
  onRefresh: () => void
  onInvoiceUpdate?: (invoiceId: string, updates: Partial<InvoiceWithItems>) => void
}

// Custom Status Dropdown Component
function StatusDropdown({ currentStatus, onStatusChange }: { currentStatus: string, onStatusChange: (newStatus: string) => void }) {
  const { theme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  const getStatusColor = (status: string) => {
    if (theme === 'dark') {
      switch (status) {
        case 'draft': return 'bg-gray-800 text-gray-200'
        case 'sent': return 'bg-blue-900 text-blue-200'
        case 'paid': return 'bg-green-900 text-green-200'
        case 'overdue': return 'bg-red-900 text-red-200'
        case 'cancelled': return 'bg-gray-800 text-gray-200'
        default: return 'bg-gray-800 text-gray-200'
      }
    } else {
      switch (status) {
        case 'draft': return 'bg-gray-100 text-gray-800'
        case 'sent': return 'bg-blue-100 text-blue-800'
        case 'paid': return 'bg-green-100 text-green-800'
        case 'overdue': return 'bg-red-100 text-red-800'
        case 'cancelled': return 'bg-gray-100 text-gray-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }
  }

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleToggle = () => {
    console.log('Invoice StatusDropdown toggle clicked, current isOpen:', isOpen)
    setIsOpen(!isOpen)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        ref={triggerRef}
        className="cursor-pointer"
        onClick={handleToggle}
      >
        <Badge className={`${getStatusColor(currentStatus)} hover:opacity-80 transition-opacity flex items-center gap-1`}>
          {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
          <ChevronDown className="h-3 w-3" />
        </Badge>
      </div>
      
      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-xl z-[9999] min-w-[120px]"
          style={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            maxHeight: '200px',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
        >
          {statusOptions.map((option) => (
            <div
              key={option.value}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 first:rounded-t-md last:rounded-b-md"
              style={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                color: theme === 'dark' ? '#ffffff' : '#111827'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1f2937' : '#ffffff'
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('Invoice StatusDropdown option clicked:', option.value)
                onStatusChange(option.value)
                setIsOpen(false)
              }}
            >
              <Badge className={`${getStatusColor(option.value)} text-xs`}>
                {option.label}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function InvoiceTable({ invoices, onRefresh, onInvoiceUpdate }: InvoiceTableProps) {
  const { theme } = useTheme()
  const [sortBy, setSortBy] = useState<'invoice_number' | 'customer_name' | 'status' | 'issue_date' | 'due_date' | 'total_amount'>('issue_date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithItems | undefined>(undefined)
  const [viewInvoice, setViewInvoice] = useState<InvoiceWithItems | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState<InvoiceWithItems | null>(null)
  
  const supabase = createClient()

  const getStatusColor = (status: string) => {
    if (theme === 'dark') {
      switch (status) {
        case 'draft': return 'bg-gray-800 text-gray-200'
        case 'sent': return 'bg-blue-900 text-blue-200'
        case 'paid': return 'bg-green-900 text-green-200'
        case 'overdue': return 'bg-red-900 text-red-200'
        case 'cancelled': return 'bg-gray-800 text-gray-200'
        default: return 'bg-gray-800 text-gray-200'
      }
    } else {
      switch (status) {
        case 'draft': return 'bg-gray-100 text-gray-800'
        case 'sent': return 'bg-blue-100 text-blue-800'
        case 'paid': return 'bg-green-100 text-green-800'
        case 'overdue': return 'bg-red-100 text-red-800'
        case 'cancelled': return 'bg-gray-100 text-gray-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }
  }

  const handleEdit = (invoice: InvoiceWithItems) => {
    setSelectedInvoice(invoice)
    setIsFormOpen(true)
  }

  const handleView = (invoice: InvoiceWithItems) => {
    setViewInvoice(invoice)
    setIsViewOpen(true)
  }

  const updateInvoiceStatus = async (invoiceId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', invoiceId)

      if (error) throw error

      // Update local state if callback is provided, otherwise refresh
      if (onInvoiceUpdate) {
        onInvoiceUpdate(invoiceId, { status: newStatus as any, updated_at: new Date().toISOString() })
      } else {
        onRefresh()
      }

      toast.success(`Invoice status updated to ${newStatus}`)
    } catch (error: any) {
      console.error('Error updating invoice status:', error)
      toast.error('Failed to update invoice status')
    }
  }

  const handleDelete = async (invoice: InvoiceWithItems) => {
    setInvoiceToDelete(invoice)
  }

  const confirmDelete = async () => {
    if (!invoiceToDelete) return

    setIsDeleting(true)
    try {
      // Delete invoice items first (due to foreign key constraint)
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', invoiceToDelete.id)

      if (itemsError) throw itemsError

      // Delete the invoice
      const { error: invoiceError } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceToDelete.id)

      if (invoiceError) throw invoiceError

      toast.success('Invoice deleted successfully')
      onRefresh()
    } catch (error) {
      console.error('Error deleting invoice:', error)
      toast.error('Failed to delete invoice')
    } finally {
      setIsDeleting(false)
      setInvoiceToDelete(null)
    }
  }

  const handleSort = (column: 'invoice_number' | 'customer_name' | 'status' | 'issue_date' | 'due_date' | 'total_amount') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const sortedInvoices = [...invoices].sort((a, b) => {
    let aValue: any, bValue: any
    
    switch (sortBy) {
      case 'invoice_number':
        aValue = a.invoice_number
        bValue = b.invoice_number
        break
      case 'customer_name':
        aValue = a.customer_name
        bValue = b.customer_name
        break
      case 'status':
        aValue = a.status
        bValue = b.status
        break
      case 'issue_date':
        aValue = new Date(a.issue_date || '').getTime()
        bValue = new Date(b.issue_date || '').getTime()
        break
      case 'due_date':
        aValue = new Date(a.due_date || '').getTime()
        bValue = new Date(b.due_date || '').getTime()
        break
      case 'total_amount':
        aValue = a.total_amount
        bValue = b.total_amount
        break
      default:
        return 0
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }
    
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
  })

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <>
      <div 
        className="rounded-lg shadow"
        style={{
          backgroundColor: theme === 'dark' ? '#111827' : '#ffffff',
          border: theme === 'dark' ? '1px solid #374151' : 'none'
        }}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y" style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
            <thead style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb' }}>
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  style={{ 
                    color: theme === 'dark' ? '#d1d5db' : '#6b7280',
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb'
                  }}
                  onClick={() => handleSort('invoice_number')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1f2937' : '#f9fafb'
                  }}
                >
                  <div className="flex items-center gap-1">
                    Invoice #
                    {sortBy === 'invoice_number' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  style={{ 
                    color: theme === 'dark' ? '#d1d5db' : '#6b7280',
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb'
                  }}
                  onClick={() => handleSort('customer_name')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1f2937' : '#f9fafb'
                  }}
                >
                  <div className="flex items-center gap-1">
                    Customer
                    {sortBy === 'customer_name' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  style={{ 
                    color: theme === 'dark' ? '#d1d5db' : '#6b7280',
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb'
                  }}
                  onClick={() => handleSort('status')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1f2937' : '#f9fafb'
                  }}
                >
                  <div className="flex items-center gap-1">
                    Status
                    {sortBy === 'status' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  style={{ 
                    color: theme === 'dark' ? '#d1d5db' : '#6b7280',
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb'
                  }}
                  onClick={() => handleSort('issue_date')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1f2937' : '#f9fafb'
                  }}
                >
                  <div className="flex items-center gap-1">
                    Issue Date
                    {sortBy === 'issue_date' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  style={{ 
                    color: theme === 'dark' ? '#d1d5db' : '#6b7280',
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb'
                  }}
                  onClick={() => handleSort('due_date')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1f2937' : '#f9fafb'
                  }}
                >
                  <div className="flex items-center gap-1">
                    Due Date
                    {sortBy === 'due_date' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  style={{ 
                    color: theme === 'dark' ? '#d1d5db' : '#6b7280',
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb'
                  }}
                  onClick={() => handleSort('total_amount')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1f2937' : '#f9fafb'
                  }}
                >
                  <div className="flex items-center gap-1">
                    Total
                    {sortBy === 'total_amount' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
              {sortedInvoices.map((invoice) => (
                <tr 
                  key={invoice.id}
                  className="hover:bg-opacity-80 transition-colors"
                  style={{ 
                    backgroundColor: theme === 'dark' ? '#111827' : '#ffffff',
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1f2937' : '#f9fafb'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#111827' : '#ffffff'
                  }}
                >
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                    style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
                  >
                    {invoice.invoice_number}
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
                  >
                    <div>
                      <div 
                        className="font-medium"
                        style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
                      >
                        {invoice.customer_name}
                      </div>
                      {invoice.customer_email && (
                        <div 
                          className="text-sm"
                          style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                        >
                          {invoice.customer_email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusDropdown 
                      currentStatus={invoice.status}
                      onStatusChange={(newStatus) => updateInvoiceStatus(invoice.id, newStatus)}
                    />
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
                  >
                    {formatDate(invoice.issue_date)}
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
                  >
                    {formatDate(invoice.due_date)}
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
                  >
                    ${invoice.total_amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(invoice)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(invoice)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(invoice)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {invoiceToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
          <div 
            className="rounded-lg p-6 max-w-md w-full mx-4"
            style={{
              backgroundColor: theme === 'dark' ? '#111827' : '#ffffff',
              border: theme === 'dark' ? '1px solid #374151' : 'none'
            }}
          >
            <h3 
              className="text-lg font-semibold mb-2"
              style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
            >
              Delete Invoice
            </h3>
            <p 
              className="mb-4"
              style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
            >
              Are you sure you want to delete invoice &quot;{invoiceToDelete.invoice_number}&quot;? 
              This will also delete all invoice items and cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setInvoiceToDelete(null)}
                disabled={isDeleting}
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Form */}
      <InvoiceForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedInvoice(undefined)
        }}
        onSuccess={() => {
          onRefresh()
          setIsFormOpen(false)
          setSelectedInvoice(undefined)
        }}
        invoice={selectedInvoice}
      />

      {/* Invoice View */}
      <InvoiceView
        open={isViewOpen}
        onClose={() => {
          setIsViewOpen(false)
          setViewInvoice(null)
        }}
        invoice={viewInvoice}
      />
    </>
  )
}
