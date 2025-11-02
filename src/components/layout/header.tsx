'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { UserMenu } from './user-menu'
import { Bell, Settings, Plus, AlertCircle, Package, DollarSign, User, Shield, Palette } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface HeaderProps {
  onAddProduct: () => void
  user: User
}

export function Header({ onAddProduct, user }: HeaderProps) {
  const router = useRouter()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)

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

  // Sample notifications data - in a real app, this would come from an API
  const notifications = [
    {
      id: 1,
      type: 'low_stock',
      title: 'Low Stock Alert',
      message: 'Persian Carpet 3x5 has only 2 units remaining',
      time: '2 hours ago',
      icon: Package,
      unread: true
    },
    {
      id: 2,
      type: 'sale',
      title: 'New Sale',
      message: 'Sale completed: $450 for Turkish Rug 4x6',
      time: '4 hours ago',
      icon: DollarSign,
      unread: true
    },
    {
      id: 3,
      type: 'alert',
      title: 'System Alert',
      message: 'Database backup completed successfully',
      time: '1 day ago',
      icon: AlertCircle,
      unread: false
    }
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  const handleNotificationClick = (notification: any) => {
    // Handle notification click - could navigate to relevant page
    console.log('Notification clicked:', notification)
    // Mark as read
    // In a real app, you'd update this in the database
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
                            notification.type === 'sale' ? 'bg-green-100 text-green-600' :
                            'bg-blue-100 text-blue-600'
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
                {notifications.length > 0 && (
                  <div className="p-4 border-t border-gray-200">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setShowNotifications(false)}
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
                      <User className="h-4 w-4" />
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
