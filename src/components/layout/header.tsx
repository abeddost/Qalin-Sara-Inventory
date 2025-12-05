'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { UserMenu } from './user-menu'
import { Bell, Settings, Plus, AlertCircle, Package, DollarSign, FileText, User as UserIcon, Shield, Palette } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface HeaderProps {
  onAddProduct: () => void
  user: User
}

interface Notification {
  id: string
  type: 'low_stock' | 'order' | 'invoice' | 'alert'
  title: string
  message: string
  time: string
  icon: any
  unread: boolean
  link?: string
}

// Helper function to format relative time
function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return date.toLocaleDateString()
}

export function Header({ onAddProduct, user }: HeaderProps) {
  const router = useRouter()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set())
  const notificationsRef = useRef<HTMLDivElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Load read notifications from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('readNotifications')
    if (stored) {
      try {
        setReadNotifications(new Set(JSON.parse(stored)))
      } catch (e) {
        console.error('Error parsing read notifications:', e)
      }
    }
  }, [])

  // Fetch real notifications from database
  const fetchNotifications = useCallback(async () => {
    try {
      const notificationsList: Notification[] = []

      // 1. Fetch low stock products (total count < 5)
      const { data: products } = await supabase
        .from('products')
        .select('id, code, product_sizes(count)')

      if (products) {
        products.forEach((product: any) => {
          const totalStock = product.product_sizes?.reduce((sum: number, size: any) => sum + (size.count || 0), 0) || 0
          if (totalStock > 0 && totalStock < 5) {
            notificationsList.push({
              id: `low_stock_${product.id}`,
              type: 'low_stock',
              title: 'Low Stock Alert',
              message: `Product ${product.code} has only ${totalStock} unit${totalStock > 1 ? 's' : ''} remaining`,
              time: 'Now',
              icon: Package,
              unread: !readNotifications.has(`low_stock_${product.id}`),
              link: '/products'
            })
          }
        })
      }

      // 2. Fetch recent orders (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const { data: orders } = await supabase
        .from('orders')
        .select('id, order_number, customer_name, final_amount, created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(5)

      if (orders) {
        orders.forEach((order: any) => {
          notificationsList.push({
            id: `order_${order.id}`,
            type: 'order',
            title: 'New Order',
            message: `Order ${order.order_number} from ${order.customer_name} - €${order.final_amount?.toFixed(2) || '0.00'}`,
            time: getRelativeTime(new Date(order.created_at)),
            icon: DollarSign,
            unread: !readNotifications.has(`order_${order.id}`),
            link: '/orders'
          })
        })
      }

      // 3. Fetch recent invoices (last 7 days)
      const { data: invoices } = await supabase
        .from('invoices')
        .select('id, invoice_number, customer_name, total_amount, created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(5)

      if (invoices) {
        invoices.forEach((invoice: any) => {
          notificationsList.push({
            id: `invoice_${invoice.id}`,
            type: 'invoice',
            title: 'New Invoice',
            message: `Invoice ${invoice.invoice_number} for ${invoice.customer_name} - €${invoice.total_amount?.toFixed(2) || '0.00'}`,
            time: getRelativeTime(new Date(invoice.created_at)),
            icon: FileText,
            unread: !readNotifications.has(`invoice_${invoice.id}`),
            link: '/invoices'
          })
        })
      }

      // Sort by unread first, then by most recent
      notificationsList.sort((a, b) => {
        if (a.unread && !b.unread) return -1
        if (!a.unread && b.unread) return 1
        return 0
      })

      setNotifications(notificationsList)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }, [supabase, readNotifications])

  // Fetch notifications on mount and when dropdown opens
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    if (showNotifications) {
      fetchNotifications()
    }
  }, [showNotifications, fetchNotifications])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false)
      }
    }

    if (showNotifications || showSettings) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications, showSettings])

  const unreadCount = notifications.filter(n => n.unread).length

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    const newReadNotifications = new Set(readNotifications)
    newReadNotifications.add(notification.id)
    setReadNotifications(newReadNotifications)
    localStorage.setItem('readNotifications', JSON.stringify([...newReadNotifications]))
    
    // Update notification state
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, unread: false } : n)
    )
    
    // Navigate to relevant page
    if (notification.link) {
      router.push(notification.link)
      setShowNotifications(false)
    }
  }

  const handleMarkAllAsRead = () => {
    const newReadNotifications = new Set(readNotifications)
    notifications.forEach(n => newReadNotifications.add(n.id))
    setReadNotifications(newReadNotifications)
    localStorage.setItem('readNotifications', JSON.stringify([...newReadNotifications]))
    
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
    setShowNotifications(false)
  }

  const handleSettingsClick = () => {
    router.push('/settings')
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <Button 
            onClick={onAddProduct}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2 px-4 py-2 rounded-md transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="font-medium">Add Product</span>
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative flex items-center space-x-2 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-4 w-4" />
              <span className="text-sm font-medium">Notifications</span>
              {unreadCount > 0 && (
                <span className="h-5 w-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          notification.unread ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full ${
                            notification.type === 'low_stock' ? 'bg-orange-100 text-orange-600' :
                            notification.type === 'order' ? 'bg-green-100 text-green-600' :
                            notification.type === 'invoice' ? 'bg-blue-100 text-blue-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            <notification.icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${
                              notification.unread ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.time}
                            </p>
                          </div>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No notifications</p>
                    </div>
                  )}
                </div>
                {notifications.length > 0 && unreadCount > 0 && (
                  <div className="p-4 border-t border-gray-200">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={handleMarkAllAsRead}
                    >
                      Mark all as read
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="relative" ref={settingsRef}>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center space-x-2 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors"
              title="Quick Settings"
            >
              <Settings className="h-4 w-4" />
              <span className="text-sm font-medium">Quick Settings</span>
            </Button>

            {/* Settings Dropdown */}
            {showSettings && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.user_metadata?.first_name || 'User'} {user?.user_metadata?.last_name || ''}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Menu Options */}
                <div className="p-2">
                  <button
                    onClick={() => {
                      router.push('/settings')
                      setShowSettings(false)
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <UserIcon className="h-4 w-4" />
                      <span>My Profile</span>
                    </div>
                    <span className="text-xs text-gray-400 group-hover:text-gray-600">Edit personal info</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      router.push('/users')
                      setShowSettings(false)
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <Shield className="h-4 w-4" />
                      <span>Manage Users</span>
                    </div>
                    <span className="text-xs text-gray-400 group-hover:text-gray-600">Admin only</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      router.push('/settings')
                      setShowSettings(false)
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <Palette className="h-4 w-4" />
                      <span>Preferences</span>
                    </div>
                    <span className="text-xs text-gray-400 group-hover:text-gray-600">Theme & language</span>
                  </button>
                </div>
              </div>
            )}
          </div>

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
