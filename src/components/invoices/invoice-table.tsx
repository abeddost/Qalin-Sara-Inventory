'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InvoiceWithItems } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { useTheme } from '@/components/providers/theme-provider'
import InvoiceForm from './invoice-form'
import InvoiceView from './invoice-view'

interface InvoiceTableProps {
  invoices: InvoiceWithItems[]
  onRefresh: () => void
}

export default function InvoiceTable({ invoices, onRefresh }: InvoiceTableProps) {
  const { theme } = useTheme()
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithItems | undefined>(undefined)
  const [viewInvoice, setViewInvoice] = useState<InvoiceWithItems | undefined>(undefined)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState<InvoiceWithItems | null>(null)
  
  const supabase = createClient()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
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

      toast.success(`Invoice status updated to ${newStatus}`)
      onRefresh()
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
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                >
                  Invoice #
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                >
                  Customer
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                >
                  Status
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                >
                  Issue Date
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                >
                  Due Date
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                >
                  Total
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
              {invoices.map((invoice) => (
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
                    <select
                      value={invoice.status}
                      onChange={(e) => updateInvoiceStatus(invoice.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(invoice.status)}`}
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
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
              Are you sure you want to delete invoice "{invoiceToDelete.invoice_number}"? 
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
          setViewInvoice(undefined)
        }}
        invoice={viewInvoice}
      />
    </>
  )
}
