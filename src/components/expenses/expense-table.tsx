'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ExpenseWithCategory } from '@/types/database'
import { useTheme } from '@/components/providers/theme-provider'
import { 
  Eye, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Calendar,
  DollarSign,
  Receipt,
  Download,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface ExpenseTableProps {
  expenses: ExpenseWithCategory[]
  onEdit: (expense: ExpenseWithCategory) => void
  onRefresh: () => void
  onExpenseUpdate?: (expenseId: string, updates: Partial<ExpenseWithCategory>) => void
}

// Custom Status Dropdown Component
function StatusDropdown({ currentStatus, onStatusChange }: { currentStatus: string, onStatusChange: (newStatus: string) => void }) {
  const { theme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const getStatusColor = (status: string) => {
    if (theme === 'dark') {
      switch (status) {
        case 'confirmed': return 'bg-green-900 text-green-200 border-green-700'
        case 'pending': return 'bg-yellow-900 text-yellow-200 border-yellow-700'
        case 'rejected': return 'bg-red-900 text-red-200 border-red-700'
        default: return 'bg-gray-800 text-gray-200 border-gray-600'
      }
    } else {
      switch (status) {
        case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
        case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
        default: return 'bg-gray-100 text-gray-800 border-gray-200'
      }
    }
  }

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'rejected', label: 'Rejected' }
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

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Badge className={`${getStatusColor(currentStatus)} hover:opacity-80 transition-opacity flex items-center gap-1`}>
          {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
          <ChevronDown className="h-3 w-3" />
        </Badge>
      </div>
      
      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]"
          style={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
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
              onClick={() => {
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

export default function ExpenseTable({ expenses, onEdit, onRefresh, onExpenseUpdate }: ExpenseTableProps) {
  const { theme } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'expense_name' | 'category' | 'amount' | 'date' | 'status' | 'payment_method'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  const supabase = createClient()

  const handleSort = (column: 'expense_name' | 'category' | 'amount' | 'date' | 'status' | 'payment_method') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const getStatusColor = (status: string) => {
    if (theme === 'dark') {
      switch (status) {
        case 'confirmed': return 'bg-green-900 text-green-200 border-green-700'
        case 'pending': return 'bg-yellow-900 text-yellow-200 border-yellow-700'
        case 'rejected': return 'bg-red-900 text-red-200 border-red-700'
        default: return 'bg-gray-800 text-gray-200 border-gray-600'
      }
    } else {
      switch (status) {
        case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
        case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
        default: return 'bg-gray-100 text-gray-800 border-gray-200'
      }
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return '💰'
      case 'card': return '💳'
      case 'bank_transfer': return '🏦'
      case 'check': return '📄'
      default: return '💵'
    }
  }

  const filteredExpenses = expenses
    .filter(expense => {
      const matchesSearch = 
        expense.expense_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.expense_categories?.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || expense.status === statusFilter
      const matchesCategory = categoryFilter === 'all' || expense.category_id === categoryFilter
      
      return matchesSearch && matchesStatus && matchesCategory
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'expense_name':
          comparison = (a.expense_name || '').localeCompare(b.expense_name || '')
          break
        case 'category':
          comparison = (a.category?.name || '').localeCompare(b.category?.name || '')
          break
        case 'amount':
          comparison = a.amount - b.amount
          break
        case 'date':
          comparison = new Date(a.expense_date).getTime() - new Date(b.expense_date).getTime()
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        case 'payment_method':
          comparison = (a.payment_method || '').localeCompare(b.payment_method || '')
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const updateExpenseStatus = async (expenseId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', expenseId)

      if (error) throw error

      // Update local state if callback is provided, otherwise refresh
      if (onExpenseUpdate) {
        onExpenseUpdate(expenseId, { status: newStatus as any, updated_at: new Date().toISOString() })
      } else {
        onRefresh()
      }

      toast.success(`Expense status updated to ${newStatus}`)
    } catch (error: any) {
      console.error('Error updating expense status:', error)
      toast.error('Failed to update expense status')
    }
  }

  const handleDelete = async (expense: ExpenseWithCategory) => {
    if (!confirm('Are you sure you want to delete this expense?')) return

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expense.id)

      if (error) throw error

      toast.success('Expense deleted successfully')
      onRefresh()
    } catch (error: any) {
      console.error('Error deleting expense:', error)
      toast.error('Failed to delete expense')
    }
  }

  const handleExport = async () => {
    try {
      const csvData = [
        ['Expense Number', 'Date', 'Description', 'Amount', 'Category', 'Vendor', 'Status', 'Payment Method'],
        ...filteredExpenses.map(expense => [
          expense.expense_number,
          expense.expense_date,
          expense.description,
          expense.amount.toString(),
          expense.expense_categories?.name || 'N/A',
          expense.vendor_name || 'N/A',
          expense.status,
          expense.payment_method
        ])
      ]

      const csvContent = csvData.map(row => row.join(',')).join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success('Expenses exported successfully')
    } catch (error) {
      console.error('Error exporting expenses:', error)
      toast.error('Failed to export expenses')
    }
  }

  const uniqueCategories = [...new Set(expenses.map(exp => exp.expense_categories?.name).filter(Boolean))]

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="search" className="mb-2">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status-filter" className="mb-2">Status</Label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <Label htmlFor="category-filter" className="mb-2">Category</Label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="sort" className="mb-2">Sort By</Label>
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="vendor">Vendor</option>
              </select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing {filteredExpenses.length} of {expenses.length} expenses
          </div>
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className={`rounded-lg border overflow-hidden ${
        theme === 'dark' 
          ? 'bg-gray-900 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`border-b ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <tr>
                <th 
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  onClick={() => handleSort('expense_name')}
                >
                  <div className="flex items-center gap-1">
                    Expense
                    {sortBy === 'expense_name' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th 
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center gap-1">
                    Category
                    {sortBy === 'category' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th 
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center gap-1">
                    Amount
                    {sortBy === 'amount' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th 
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-1">
                    Date
                    {sortBy === 'date' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th 
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    {sortBy === 'status' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th 
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  onClick={() => handleSort('payment_method')}
                >
                  <div className="flex items-center gap-1">
                    Payment
                    {sortBy === 'payment_method' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              theme === 'dark' 
                ? 'bg-gray-900 divide-gray-700' 
                : 'bg-white divide-gray-200'
            }`}>
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className={`${
                  theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                }`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                        theme === 'dark' ? 'bg-green-900' : 'bg-green-100'
                      }`}>
                        <Receipt className={`h-5 w-5 ${
                          theme === 'dark' ? 'text-green-300' : 'text-green-600'
                        }`} />
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                        }`}>
                          {expense.expense_number}
                        </div>
                        <div className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          {expense.description}
                        </div>
                        {expense.vendor_name && (
                          <div className={`text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                          }`}>
                            {expense.vendor_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge 
                      variant="outline" 
                      className={`${
                        theme === 'dark' 
                          ? 'bg-gray-800 text-gray-200 border-gray-600' 
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}
                    >
                      {expense.expense_categories?.name || 'Uncategorized'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }`}>
                      ${expense.amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center text-sm ${
                      theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }`}>
                      <Calendar className={`h-4 w-4 mr-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                      }`} />
                      {new Date(expense.expense_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusDropdown 
                      currentStatus={expense.status}
                      onStatusChange={(newStatus) => updateExpenseStatus(expense.id, newStatus)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <span className="mr-1">{getPaymentMethodIcon(expense.payment_method)}</span>
                      {expense.payment_method.replace('_', ' ').toUpperCase()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {expense.receipt_url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(expense.receipt_url!, '_blank')}
                          title="View Receipt"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(expense)}
                        title="Edit Expense"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(expense)}
                        title="Delete Expense"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredExpenses.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by adding your first expense.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
