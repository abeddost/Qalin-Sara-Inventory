'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  FileText, 
  Download, 
  Send, 
  Eye, 
  Edit, 
  Trash2,
  DollarSign,
  Calendar,
  User,
  TrendingUp
} from 'lucide-react'

export default function InvoicesPage() {
  // Mock data for demonstration
  const mockInvoices = [
    {
      id: '1',
      invoiceNumber: 'INV-001',
      customerName: 'John Doe',
      amount: 1250.00,
      status: 'paid',
      dueDate: '2024-02-15',
      issueDate: '2024-01-15'
    },
    {
      id: '2',
      invoiceNumber: 'INV-002',
      customerName: 'Jane Smith',
      amount: 890.50,
      status: 'pending',
      dueDate: '2024-02-20',
      issueDate: '2024-01-20'
    },
    {
      id: '3',
      invoiceNumber: 'INV-003',
      customerName: 'Bob Johnson',
      amount: 2100.00,
      status: 'overdue',
      dueDate: '2024-01-30',
      issueDate: '2024-01-01'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalInvoices = mockInvoices.length
  const totalAmount = mockInvoices.reduce((sum, inv) => sum + inv.amount, 0)
  const paidAmount = mockInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0)
  const pendingAmount = mockInvoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
            <p className="text-gray-600 mt-2">Create, send, and track customer invoices</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
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

      {/* Coming Soon Notice */}
      <Card className="bg-white border-0 shadow-sm mb-8">
        <CardContent className="p-8">
          <div className="text-center">
            <FileText className="h-16 w-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Invoice System Coming Soon</h3>
            <p className="text-gray-600 mb-6">
              We're building a comprehensive invoice management system with features like:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm text-gray-700">Create professional invoices</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm text-gray-700">Send invoices via email</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm text-gray-700">Track payment status</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm text-gray-700">Generate PDF invoices</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm text-gray-700">Payment reminders</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm text-gray-700">Invoice templates</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sample Invoices Table */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Recent Invoices (Sample Data)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-gray-600">{invoice.customerName}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${invoice.amount.toFixed(2)}</p>
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-600">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">Issued: {new Date(invoice.issueDate).toLocaleDateString()}</p>
                </div>
                
                <div className="flex space-x-2">
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

