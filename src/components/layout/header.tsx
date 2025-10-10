'use client'

import { Button } from '@/components/ui/button'
import { UserMenu } from './user-menu'
import { Bell, Receipt, CreditCard, ShoppingCart, Settings } from 'lucide-react'
import { User } from '@supabase/supabase-js'

interface HeaderProps {
  onAddProduct: () => void
  user: User
}

export function Header({ onAddProduct, user }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <Button className="bg-slate-900 hover:bg-slate-800 text-white">
            <Receipt className="h-4 w-4 mr-2" />
            Sell
          </Button>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white">
            <CreditCard className="h-4 w-4 mr-2" />
            Receipt
          </Button>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white">
            <CreditCard className="h-4 w-4 mr-2" />
            Payment
          </Button>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Purchase
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">84</span>
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="sm">
            <Settings className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <UserMenu user={user} />
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="mt-2">
        <nav className="text-sm text-gray-500">
          Home / Dashboard
        </nav>
      </div>
    </header>
  )
}
