'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { Expense, ExpenseInsert, ExpenseCategory } from '@/types/database'
import { toast } from 'sonner'
import { useTheme } from '@/components/providers/theme-provider'
import { Upload, Receipt, Calendar, DollarSign, Tag } from 'lucide-react'

interface ExpenseFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  expense?: Expense
}

export default function ExpenseForm({ open, onClose, onSuccess, expense }: ExpenseFormProps) {
  const { theme } = useTheme()
  const [formData, setFormData] = useState({
    expense_number: '',
    category_id: '',
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash' as 'cash' | 'card' | 'bank_transfer' | 'check' | 'other',
    vendor_name: '',
    notes: '',
    status: 'confirmed' as 'pending' | 'confirmed' | 'rejected'
  })
  
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      fetchCategories()
      if (expense) {
        // Editing existing expense
        setFormData({
          expense_number: expense.expense_number,
          category_id: expense.category_id || '',
          description: expense.description,
          amount: expense.amount.toString(),
          expense_date: expense.expense_date,
          payment_method: expense.payment_method,
          vendor_name: expense.vendor_name || '',
          notes: expense.notes || '',
          status: expense.status
        })
        setReceiptPreview(expense.receipt_url)
      } else {
        // Creating new expense
        const newExpenseNumber = `EXP-${Date.now()}`
        setFormData({
          expense_number: newExpenseNumber,
          category_id: '',
          description: '',
          amount: '',
          expense_date: new Date().toISOString().split('T')[0],
          payment_method: 'cash',
          vendor_name: '',
          notes: '',
          status: 'confirmed'
        })
        setReceiptFile(null)
        setReceiptPreview(null)
      }
    }
  }, [open, expense])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .order('name')
      
      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to fetch categories')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReceiptFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setReceiptPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadReceipt = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('receipts')
        .upload(fileName, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Error uploading receipt:', error)
      toast.error('Failed to upload receipt')
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let receiptUrl = expense?.receipt_url || null
      
      // Upload new receipt if provided
      if (receiptFile) {
        receiptUrl = await uploadReceipt(receiptFile)
      }

      const expenseData: ExpenseInsert = {
        expense_number: formData.expense_number,
        category_id: formData.category_id || null,
        description: formData.description,
        amount: parseFloat(formData.amount),
        expense_date: formData.expense_date,
        payment_method: formData.payment_method,
        vendor_name: formData.vendor_name || null,
        receipt_url: receiptUrl,
        notes: formData.notes || null,
        status: formData.status
      }

      if (expense) {
        // Update existing expense
        const { error } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', expense.id)

        if (error) throw error
        toast.success('Expense updated successfully')
      } else {
        // Create new expense
        const { error } = await supabase
          .from('expenses')
          .insert(expenseData)

        if (error) throw error
        toast.success('Expense created successfully')
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error saving expense:', error)
      toast.error(error.message || 'Failed to save expense')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
        style={{
          backgroundColor: theme === 'dark' ? '#111827' : '#ffffff',
          borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
        }}
      >
        <DialogHeader>
          <DialogTitle 
            className="flex items-center space-x-2"
            style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
          >
            <Receipt className="h-5 w-5" />
            <span>{expense ? 'Edit Expense' : 'Add New Expense'}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expense_number" className="mb-2">Expense Number</Label>
              <Input
                id="expense_number"
                value={formData.expense_number}
                onChange={(e) => setFormData(prev => ({ ...prev, expense_number: e.target.value }))}
                required
                className="bg-white"
              />
            </div>

            <div>
              <Label htmlFor="category_id" className="mb-2">Category</Label>
              <select
                id="category_id"
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description" className="mb-2">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                className="bg-white"
                placeholder="Enter expense description"
              />
            </div>

            <div>
              <Label htmlFor="amount" className="mb-2">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
                className="bg-white"
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="expense_date" className="mb-2">Date</Label>
              <Input
                id="expense_date"
                type="date"
                value={formData.expense_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expense_date: e.target.value }))}
                required
                className="bg-white"
              />
            </div>

            <div>
              <Label htmlFor="payment_method" className="mb-2">Payment Method</Label>
              <select
                id="payment_method"
                value={formData.payment_method}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="check">Check</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <Label htmlFor="vendor_name" className="mb-2">Vendor</Label>
              <Input
                id="vendor_name"
                value={formData.vendor_name}
                onChange={(e) => setFormData(prev => ({ ...prev, vendor_name: e.target.value }))}
                className="bg-white"
                placeholder="Vendor name (optional)"
              />
            </div>

            <div>
              <Label htmlFor="status" className="mb-2">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Receipt Upload */}
          <div>
            <Label className="mb-2">Receipt</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
                id="receipt-upload"
              />
              <label
                htmlFor="receipt-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {receiptPreview ? 'Change receipt' : 'Upload receipt (optional)'}
                </span>
                <span className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</span>
              </label>
              
              {receiptPreview && (
                <div className="mt-4">
                  <img
                    src={receiptPreview}
                    alt="Receipt preview"
                    className="max-w-xs max-h-32 mx-auto rounded border"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="mb-2">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="bg-white"
              rows={3}
              placeholder="Additional notes (optional)"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white">
              {isLoading ? 'Saving...' : (expense ? 'Update Expense' : 'Create Expense')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
