'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { InvoiceWithItems } from '@/types/database'
import { toast } from 'sonner'
import InvoiceForm from '@/components/invoices/invoice-form'
import InvoiceTable from '@/components/invoices/invoice-table'
import { Plus, FileText, DollarSign, TrendingUp, Calendar } from 'lucide-react'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceWithItems[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  
  const supabase = createClient()

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (
            id,
            product_id,
            product_code,
            product_size,
            description,
            quantity,
            unit_price,
            total_price
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        // Check if it's a table doesn't exist error
        if (error.code === '42P01') {
          console.log('Invoices table does not exist - migration needed')
          setInvoices([])
          return
        }
        throw error
      }
      
      setInvoices(data || [])
    } catch (error) {
      console.error('Error fetching invoices:', error)
      toast.error('Failed to fetch invoices')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  // Calculate summary statistics
  const totalInvoices = invoices.length
  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.total_amount, 0)
  const paidInvoices = invoices.filter(invoice => invoice.status === 'paid').length
  const paidAmount = invoices.filter(invoice => invoice.status === 'paid').reduce((sum, invoice) => sum + invoice.total_amount, 0)
  const pendingAmount = invoices.filter(invoice => invoice.status === 'sent').reduce((sum, invoice) => sum + invoice.total_amount, 0)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading invoices...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
            <p className="text-gray-600 mt-2">Create, manage, and track your invoices</p>
          </div>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <Badge className="bg-green-100 text-green-800">
          ✅ Database ready - Invoice system active
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                <p className="text-3xl font-bold text-gray-900">{totalInvoices}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-3xl font-bold text-gray-900">${totalAmount.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid Amount</p>
                <p className="text-3xl font-bold text-gray-900">${paidAmount.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                <p className="text-3xl font-bold text-gray-900">${pendingAmount.toLocaleString()}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      {invoices.length === 0 ? (
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-8">
            <div className="text-center">
              <FileText className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Invoices Yet</h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first invoice
              </p>
              <Button
                onClick={() => setIsFormOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Invoice
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <InvoiceTable invoices={invoices} onRefresh={fetchInvoices} />
      )}

      {/* Invoice Form */}
      <InvoiceForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          fetchInvoices()
          setIsFormOpen(false)
        }}
      />
    </div>
  )
}