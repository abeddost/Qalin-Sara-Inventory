'use client'

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InvoiceWithItems } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Download, X, FileText, Calendar, User, Mail, Phone, MapPin } from 'lucide-react'

interface InvoiceViewProps {
  open: boolean
  onClose: () => void
  invoice: InvoiceWithItems | null
}

export default function InvoiceView({ open, onClose, invoice }: InvoiceViewProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [orderData, setOrderData] = useState<any>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const invoiceRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Fetch order data if invoice is linked to an order
  useEffect(() => {
    if (invoice?.order_id) {
      fetchOrderData(invoice.order_id)
    } else {
      setOrderData(null)
    }
  }, [invoice])

  const fetchOrderData = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            product_size,
            quantity,
            unit_price,
            total_price
          )
        `)
        .eq('id', orderId)
        .single()

      if (error) throw error
      setOrderData(data)
    } catch (error) {
      console.error('Error fetching order data:', error)
      setOrderData(null)
    }
  }

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const updateInvoiceStatus = async (newStatus: string) => {
    if (!invoice) return

    setIsUpdatingStatus(true)
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', invoice.id)

      if (error) throw error

      toast.success(`Invoice status updated to ${newStatus}`)
      // Update the local invoice state
      invoice.status = newStatus as any
    } catch (error: any) {
      console.error('Error updating invoice status:', error)
      toast.error('Failed to update invoice status')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const generatePDF = async () => {
    if (!invoice || !invoiceRef.current) return

    setIsGeneratingPDF(true)
    try {
      // First try with html2canvas
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        allowTaint: true,
        foreignObjectRendering: false,
        ignoreElements: (element) => {
          // Skip elements that might have problematic CSS
          return element.classList.contains('no-print') || 
                 element.tagName === 'SCRIPT' || 
                 element.tagName === 'STYLE'
        },
        onclone: (clonedDoc) => {
          // Remove any problematic CSS from the cloned document
          const clonedStyles = clonedDoc.querySelectorAll('style')
          clonedStyles.forEach(style => {
            if (style.textContent?.includes('lab(')) {
              style.remove()
            }
          })
        }
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`invoice-${invoice.invoice_number}.pdf`)
      toast.success('PDF generated successfully')
    } catch (error) {
      console.error('Error generating PDF with html2canvas:', error)
      
      // Fallback: Generate a simple text-based PDF
      try {
        const pdf = new jsPDF('p', 'mm', 'a4')
        
        // Add invoice header
        pdf.setFontSize(20)
        pdf.text('INVOICE', 20, 30)
        
        pdf.setFontSize(12)
        pdf.text(`Invoice #: ${invoice.invoice_number}`, 20, 45)
        pdf.text(`Issue Date: ${new Date(invoice.issue_date || '').toLocaleDateString()}`, 20, 55)
        pdf.text(`Due Date: ${new Date(invoice.due_date || '').toLocaleDateString()}`, 20, 65)
        
        // Customer information
        pdf.text('Bill To:', 20, 85)
        pdf.text(invoice.customer_name, 20, 95)
        if (invoice.customer_email) pdf.text(invoice.customer_email, 20, 105)
        if (invoice.customer_phone) pdf.text(invoice.customer_phone, 20, 115)
        if (invoice.customer_address) pdf.text(invoice.customer_address, 20, 125)
        
        // Invoice items
        let yPosition = 150
        pdf.text('Description', 20, yPosition)
        pdf.text('Quantity', 100, yPosition)
        pdf.text('Unit Price', 130, yPosition)
        pdf.text('Total', 160, yPosition)
        
        yPosition += 10
        invoice.invoice_items.forEach(item => {
          pdf.text(item.description || 'Item', 20, yPosition)
          pdf.text(item.quantity.toString(), 100, yPosition)
          pdf.text(`$${item.unit_price.toFixed(2)}`, 130, yPosition)
          pdf.text(`$${item.total_price.toFixed(2)}`, 160, yPosition)
          yPosition += 10
        })
        
        // Totals
        yPosition += 10
        pdf.text(`Subtotal: $${invoice.total_amount.toFixed(2)}`, 130, yPosition)
        if (invoice.tax_amount) {
          yPosition += 10
          pdf.text(`Tax: $${invoice.tax_amount.toFixed(2)}`, 130, yPosition)
        }
        if (invoice.discount_amount) {
          yPosition += 10
          pdf.text(`Discount: -$${invoice.discount_amount.toFixed(2)}`, 130, yPosition)
        }
        yPosition += 10
        pdf.text(`Total: $${invoice.total_amount.toFixed(2)}`, 130, yPosition)
        
        pdf.save(`invoice-${invoice.invoice_number}.pdf`)
        toast.success('PDF generated successfully (fallback method)')
      } catch (fallbackError) {
        console.error('Error generating fallback PDF:', fallbackError)
        toast.error('Failed to generate PDF. Please try again.')
      }
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  if (!invoice) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-gray-900 flex items-center justify-between">
            <span className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Invoice {invoice.invoice_number}
            </span>
            <div className="flex items-center space-x-2">
              <select
                value={invoice.status}
                onChange={(e) => updateInvoiceStatus(e.target.value)}
                disabled={isUpdatingStatus}
                className={`px-3 py-1 rounded-full text-xs font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(invoice.status)}`}
              >
                <option value="draft">DRAFT</option>
                <option value="sent">SENT</option>
                <option value="paid">PAID</option>
                <option value="overdue">OVERDUE</option>
                <option value="cancelled">CANCELLED</option>
              </select>
              <Button
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="h-4 w-4 mr-1" />
                {isGeneratingPDF ? 'Generating...' : 'PDF'}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div ref={invoiceRef} className="bg-white p-8 space-y-8">
          {/* Header */}
          <div className="flex justify-between items-start border-b pb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
              <p className="text-gray-600 mt-2">Invoice #{invoice.invoice_number}</p>
              {orderData && (
                <p className="text-blue-600 text-sm mt-1">
                  Linked to Order: {orderData.order_number}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center text-gray-600 mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Issue Date: {formatDate(invoice.issue_date)}</span>
              </div>
              {invoice.due_date && (
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Due Date: {formatDate(invoice.due_date)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill To:</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="font-medium text-gray-900">{invoice.customer_name}</span>
                </div>
                {invoice.customer_email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-gray-700">{invoice.customer_email}</span>
                  </div>
                )}
                {invoice.customer_phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-gray-700">{invoice.customer_phone}</span>
                  </div>
                )}
                {invoice.customer_address && (
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500 mt-1" />
                    <span className="text-gray-700">{invoice.customer_address}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details:</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <select
                    value={invoice.status}
                    onChange={(e) => updateInvoiceStatus(e.target.value)}
                    disabled={isUpdatingStatus}
                    className={`px-2 py-1 rounded-full text-xs font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(invoice.status)}`}
                  >
                    <option value="draft">DRAFT</option>
                    <option value="sent">SENT</option>
                    <option value="paid">PAID</option>
                    <option value="overdue">OVERDUE</option>
                    <option value="cancelled">CANCELLED</option>
                  </select>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${invoice.subtotal.toFixed(2)}</span>
                </div>
                {invoice.discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium">-${invoice.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                {invoice.tax_rate > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax ({invoice.tax_rate}%):</span>
                    <span className="font-medium">${invoice.tax_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold text-gray-900">Total:</span>
                  <span className="font-bold text-lg">${invoice.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Items:</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.invoice_items.map((item, index) => (
                    <tr key={item.id || index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{item.product_code || 'Product'}</div>
                          {item.description && (
                            <div className="text-gray-500">{item.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.product_size || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.unit_price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${item.total_price.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Information (if linked) */}
          {orderData && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Order Information:</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order Number:</p>
                    <p className="font-medium">{orderData.order_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Status:</p>
                    <Badge className="bg-blue-100 text-blue-800">
                      {orderData.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Date:</p>
                    <p className="font-medium">{formatDate(orderData.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Total:</p>
                    <p className="font-medium">${orderData.final_amount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{invoice.notes}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t pt-6 text-center text-gray-500 text-sm">
            <p>Thank you for your business!</p>
            <p className="mt-2">This invoice was generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button onClick={onClose} variant="outline" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
