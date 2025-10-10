'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Package, 
  UserPlus, 
  BarChart3, 
  ClipboardList, 
  TrendingUp,
  Clock
} from 'lucide-react'

interface QuickActionsProps {
  onAddProduct: () => void
}

export function QuickActions({ onAddProduct }: QuickActionsProps) {
  const actions = [
    {
      title: 'Create New Invoice',
      icon: FileText,
      color: 'bg-green-500',
      onClick: () => console.log('New Invoice')
    },
    {
      title: 'Add Product',
      icon: Package,
      color: 'bg-blue-500',
      onClick: onAddProduct
    },
    {
      title: 'Add Customer',
      icon: UserPlus,
      color: 'bg-purple-500',
      onClick: () => console.log('Add Customer')
    },
    {
      title: 'Sales Report',
      icon: BarChart3,
      color: 'bg-green-500',
      onClick: () => console.log('Sales Report')
    },
    {
      title: 'Purchase Report',
      icon: ClipboardList,
      color: 'bg-blue-500',
      onClick: () => console.log('Purchase Report')
    },
    {
      title: 'Stock Report',
      icon: TrendingUp,
      color: 'bg-green-500',
      onClick: () => console.log('Stock Report')
    },
    {
      title: 'Todays Report',
      icon: Clock,
      color: 'bg-orange-500',
      onClick: () => console.log('Todays Report')
    }
  ]

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <Card key={index} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <Button
                variant="ghost"
                className="w-full h-full p-0 flex flex-col items-center space-y-3 hover:bg-transparent"
                onClick={action.onClick}
              >
                <div className={`p-4 rounded-lg ${action.color}`}>
                  <action.icon className="h-8 w-8 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center">
                  {action.title}
                </span>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
