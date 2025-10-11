'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Receipt,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'

export default function ExpensesPage() {
  // Mock data for demonstration
  const mockExpenses = [
    {
      id: '1',
      expenseNumber: 'EXP-001',
      description: 'Office rent payment',
      amount: 1500.00,
      category: 'Rent',
      date: '2024-01-15',
      status: 'confirmed',
      vendor: 'ABC Properties'
    },
    {
      id: '2',
      expenseNumber: 'EXP-002',
      description: 'Marketing campaign',
      amount: 750.50,
      category: 'Marketing',
      date: '2024-01-20',
      status: 'pending',
      vendor: 'Digital Marketing Co.'
    },
    {
      id: '3',
      expenseNumber: 'EXP-003',
      description: 'Office supplies',
      amount: 125.75,
      category: 'Office Supplies',
      date: '2024-01-25',
      status: 'confirmed',
      vendor: 'Stationery Store'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalExpenses = mockExpenses.length
  const totalAmount = mockExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  const confirmedAmount = mockExpenses.filter(exp => exp.status === 'confirmed').reduce((sum, exp) => sum + exp.amount, 0)
  const pendingAmount = mockExpenses.filter(exp => exp.status === 'pending').reduce((sum, exp) => sum + exp.amount, 0)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Expense Tracking</h1>
            <p className="text-gray-600 mt-2">Track and manage business expenses</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-3xl font-bold text-gray-900">{totalExpenses}</p>
              </div>
              <Receipt className="h-8 w-8 text-blue-600" />
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
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-3xl font-bold text-gray-900">${confirmedAmount.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-gray-900">${pendingAmount.toLocaleString()}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Notice */}
      <Card className="bg-white border-0 shadow-sm mb-8">
        <CardContent className="p-8">
          <div className="text-center">
            <Receipt className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Expense Management Coming Soon</h3>
            <p className="text-gray-600 mb-6">
              We're building a comprehensive expense tracking system with features like:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm text-gray-700">Categorize expenses</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm text-gray-700">Receipt photo upload</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm text-gray-700">Expense approval workflow</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm text-gray-700">Monthly/yearly reports</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm text-gray-700">Budget tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm text-gray-700">Tax preparation exports</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sample Expenses Table */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Receipt className="h-5 w-5" />
            <span>Recent Expenses (Sample Data)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Receipt className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{expense.expenseNumber}</p>
                    <p className="text-sm text-gray-600">{expense.description}</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <Badge variant="outline" className="bg-gray-100 text-gray-800">
                    {expense.category}
                  </Badge>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${expense.amount.toFixed(2)}</p>
                  <Badge className={getStatusColor(expense.status)}>
                    {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-600">{expense.vendor}</p>
                  <p className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                </div>
                
                <div className="flex space-x-2">
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Trash2 className="h-4 w-4" />
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

