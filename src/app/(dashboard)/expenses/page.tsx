'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/providers/theme-provider'
import { 
  Plus, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Receipt,
  PieChart,
  Calendar
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ExpenseWithCategory } from '@/types/database'
import ExpenseForm from '@/components/expenses/expense-form'
import ExpenseTable from '@/components/expenses/expense-table'
import { toast } from 'sonner'

export default function ExpensesPage() {
  const { theme } = useTheme()
  const [expenses, setExpenses] = useState<ExpenseWithCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<ExpenseWithCategory | undefined>()
  
  const supabase = createClient()

  useEffect(() => {
    fetchExpenses()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .order('name')
      
      if (error) throw error
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchExpenses = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          expense_categories!category_id (*)
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setExpenses(data || [])
    } catch (error) {
      console.error('Error fetching expenses:', error)
      toast.error('Failed to fetch expenses')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddExpense = () => {
    setEditingExpense(undefined)
    setIsFormOpen(true)
  }

  const handleEditExpense = (expense: ExpenseWithCategory) => {
    setEditingExpense(expense)
    setIsFormOpen(true)
  }

  const handleFormSuccess = () => {
    fetchExpenses()
    setIsFormOpen(false)
    setEditingExpense(undefined)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingExpense(undefined)
  }

  // Calculate summary statistics
  const totalExpenses = expenses.length
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const confirmedAmount = expenses.filter(exp => exp.status === 'confirmed').reduce((sum, exp) => sum + exp.amount, 0)
  const pendingAmount = expenses.filter(exp => exp.status === 'pending').reduce((sum, exp) => sum + exp.amount, 0)
  
  // Calculate monthly spending
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
  const monthlyAmount = expenses
    .filter(exp => exp.expense_date.startsWith(currentMonth))
    .reduce((sum, exp) => sum + exp.amount, 0)

  return (
    <div className="min-h-screen p-3 sm:p-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 
              className="text-3xl font-bold"
              style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
            >
              Expense Management
            </h1>
            <p 
              className="mt-2"
              style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
            >
              Track and manage business expenses with full categorization and reporting
            </p>
          </div>
          <Button 
            onClick={handleAddExpense}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-4 sm:p-6">
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
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">€{totalAmount.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">€{monthlyAmount.toLocaleString()}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-gray-900">€{pendingAmount.toLocaleString()}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Categories */}
      <div className="mb-8">
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Top Categories</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(
                expenses.reduce((acc, expense) => {
                  const category = expense.expense_categories?.name || 'Uncategorized'
                  acc[category] = (acc[category] || 0) + expense.amount
                  return acc
                }, {} as Record<string, number>)
              )
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{category}</span>
                    <span className="text-sm font-medium text-gray-900">€{amount.toFixed(2)}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Table */}
      {isLoading ? (
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading expenses...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ExpenseTable 
          expenses={expenses}
          onEdit={handleEditExpense}
          onRefresh={fetchExpenses}
          onExpenseUpdate={(expenseId, updates) => {
            console.log('onExpenseUpdate called:', { expenseId, updates })
            setExpenses(prevExpenses => 
              prevExpenses.map(expense => 
                expense.id === expenseId 
                  ? { ...expense, ...updates }
                  : expense
              )
            )
          }}
        />
      )}

      {/* Expense Form Modal */}
      <ExpenseForm
        open={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        expense={editingExpense}
      />
    </div>
  )
}

