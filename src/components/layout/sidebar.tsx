'use client'

import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useTheme } from '@/components/providers/theme-provider'
import { 
  LogOut, 
  Package, 
  BarChart3, 
  Settings, 
  Menu,
  X,
  CheckCircle,
  TrendingUp,
  ShoppingCart,
  Receipt,
  DollarSign,
  Users
} from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { useUserProfile } from '@/lib/hooks/use-user-profile'

interface SidebarProps {
  user: User
}

const baseNavigation = [
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Inventory', href: '/products', icon: Package },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Invoices', href: '/invoices', icon: Receipt },
  { name: 'Expenses', href: '/expenses', icon: DollarSign },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const adminNavigation = [
  { name: 'Users', href: '/users', icon: Users },
]

export function Sidebar({ user }: SidebarProps) {
  const { theme } = useTheme()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const { getUserDisplayName, getUserInitials, getUserRole, isAdmin } = useUserProfile(user)

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        toast.error('Error signing out: ' + error.message)
        return
      }
      
      toast.success('Signed out successfully')
      // Use window.location for a full page refresh to clear any cached state
      window.location.href = '/login'
    } catch (err) {
      toast.error('An unexpected error occurred during sign out')
      console.error('Sign out error:', err)
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 border-r transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}
        `}
        style={{
          backgroundColor: theme === 'dark' ? '#1e3a8a' : '#1e293b',
          borderColor: theme === 'dark' ? '#1e40af' : '#334155'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div 
            className="flex items-center justify-between p-4 border-b"
            style={{ borderColor: theme === 'dark' ? '#1e40af' : '#334155' }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">QALIN SARA</h1>
                <p className="text-xs text-slate-400">Carpet Inventory</p>
              </div>
            </div>
            
            {/* Mobile close button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(true)}
              className="lg:hidden h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* User Status */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-qalin-red to-qalin-red-light rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-white">
                  {getUserInitials()}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{getUserDisplayName()}</p>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-400">{getUserRole()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {[...baseNavigation, ...(isAdmin() ? adminNavigation : [])].map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors group
                    ${isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:text-white'
                    }
                  `}
                  style={{
                    color: isActive ? '#ffffff' : (theme === 'dark' ? '#cbd5e1' : '#94a3b8'),
                    backgroundColor: isActive ? '#2563eb' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1e40af' : '#334155'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                  <TrendingUp className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              )
            })}
          </nav>

          {/* Sign Out */}
          <div 
            className="p-4 border-t"
            style={{ borderColor: theme === 'dark' ? '#1e40af' : '#334155' }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="w-full justify-start"
              style={{
                color: theme === 'dark' ? '#cbd5e1' : '#94a3b8',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1e40af' : '#334155'
                e.currentTarget.style.color = '#ffffff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = theme === 'dark' ? '#cbd5e1' : '#94a3b8'
              }}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(false)}
        className="fixed top-4 left-4 z-50 lg:hidden h-10 w-10 p-0 bg-white shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </Button>
    </>
  )
}
