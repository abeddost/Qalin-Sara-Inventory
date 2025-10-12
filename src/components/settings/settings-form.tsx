'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/components/providers/theme-provider'
import { useLocale } from '@/components/providers/locale-provider'
import { useTranslation } from '@/lib/hooks/use-translation'
import { toast } from 'sonner'
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  Database,
  Save,
  Download,
  Upload,
  Moon,
  Sun,
  Mail,
  Phone,
  MapPin,
  Globe,
  DollarSign,
  Percent,
  Package,
  AlertTriangle,
  Eye,
  EyeOff,
  Key,
  Smartphone,
  Clock,
  HardDrive,
  Trash2,
  RefreshCw
} from 'lucide-react'

interface SettingsData {
  // Company Information
  companyName: string
  companyEmail: string
  companyPhone: string
  companyAddress: string
  companyWebsite: string
  
  // Business Settings
  currency: string
  taxRate: number
  invoicePrefix: string
  orderPrefix: string
  expensePrefix: string
  lowStockThreshold: number
  
  // User Profile
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar: string
  
  // Notifications
  emailNotifications: boolean
  smsNotifications: boolean
  lowStockAlerts: boolean
  orderNotifications: boolean
  invoiceNotifications: boolean
  expenseNotifications: boolean
  
  // Security
  twoFactorEnabled: boolean
  sessionTimeout: number
  passwordLastChanged: string
  
  // Appearance
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  dateFormat: string
  currencyPosition: 'before' | 'after'
  
  // Data Management
  autoBackup: boolean
  backupFrequency: string
  dataRetention: number
  exportFormat: string
}

export default function SettingsForm() {
  const { theme, setTheme } = useTheme()
  const { locale, setLocale, timezone, setTimezone, dateFormat, setDateFormat, currencyPosition, setCurrencyPosition } = useLocale()
  const { t } = useTranslation()
  const [htmlClasses, setHtmlClasses] = useState('')

  // Helper functions for dark theme styling
  const getCardStyle = () => ({
    backgroundColor: theme === 'dark' ? '#111827' : '#ffffff'
  })

  const getTextStyle = () => ({
    color: theme === 'dark' ? '#ffffff' : '#111827'
  })

  const getLabelStyle = () => ({
    color: theme === 'dark' ? '#d1d5db' : '#374151'
  })

  const getInputStyle = () => ({
    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
    color: theme === 'dark' ? '#f9fafb' : '#111827',
    borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
  })
  
  const [settings, setSettings] = useState<SettingsData>({
    // Company Information
    companyName: 'Qalin Sara',
    companyEmail: 'info@qalinsara.com',
    companyPhone: '+1 (555) 123-4567',
    companyAddress: '123 Business Street, City, State 12345',
    companyWebsite: 'https://qalinsara.com',
    
    // Business Settings
    currency: 'USD',
    taxRate: 8.5,
    invoicePrefix: 'INV',
    orderPrefix: 'ORD',
    expensePrefix: 'EXP',
    lowStockThreshold: 5,
    
    // User Profile
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@qalinsara.com',
    phone: '+1 (555) 123-4567',
    avatar: '',
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    lowStockAlerts: true,
    orderNotifications: true,
    invoiceNotifications: true,
    expenseNotifications: true,
    
    // Security
    twoFactorEnabled: false,
    sessionTimeout: 30,
    passwordLastChanged: '2024-01-01',
    
    // Appearance - These will be managed by providers
    theme: theme,
    language: locale,
    timezone: timezone,
    dateFormat: dateFormat,
    currencyPosition: currencyPosition,
    
    // Data Management
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: 365,
    exportFormat: 'csv'
  })

  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('company')
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadSettings()
  }, [])

  // Sync appearance settings with providers
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      theme: theme,
      language: locale,
      timezone: timezone,
      dateFormat: dateFormat,
      currencyPosition: currencyPosition
    }))
  }, [theme, locale, timezone, dateFormat, currencyPosition])

  // Track HTML classes for debugging
  useEffect(() => {
    const updateHtmlClasses = () => {
      setHtmlClasses(document.documentElement.className)
    }
    updateHtmlClasses()
    
    // Update classes when theme changes
    const interval = setInterval(updateHtmlClasses, 1000)
    return () => clearInterval(interval)
  }, [theme])

  const loadSettings = async () => {
    try {
      // Load user profile
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setSettings(prev => ({
          ...prev,
          firstName: user.user_metadata?.first_name || '',
          lastName: user.user_metadata?.last_name || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || ''
        }))
      }

      // Load company settings from localStorage or database
      const savedSettings = localStorage.getItem('company-settings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        setSettings(prev => ({ ...prev, ...parsed }))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Save company settings to localStorage
      const companySettings = {
        companyName: settings.companyName,
        companyEmail: settings.companyEmail,
        companyPhone: settings.companyPhone,
        companyAddress: settings.companyAddress,
        companyWebsite: settings.companyWebsite,
        currency: settings.currency,
        taxRate: settings.taxRate,
        invoicePrefix: settings.invoicePrefix,
        orderPrefix: settings.orderPrefix,
        expensePrefix: settings.expensePrefix,
        lowStockThreshold: settings.lowStockThreshold,
        theme: settings.theme,
        language: settings.language,
        timezone: settings.timezone,
        dateFormat: settings.dateFormat,
        currencyPosition: settings.currencyPosition,
        autoBackup: settings.autoBackup,
        backupFrequency: settings.backupFrequency,
        dataRetention: settings.dataRetention,
        exportFormat: settings.exportFormat,
        emailNotifications: settings.emailNotifications,
        smsNotifications: settings.smsNotifications,
        lowStockAlerts: settings.lowStockAlerts,
        orderNotifications: settings.orderNotifications,
        invoiceNotifications: settings.invoiceNotifications,
        expenseNotifications: settings.expenseNotifications
      }
      
      localStorage.setItem('company-settings', JSON.stringify(companySettings))
      
      // Update user profile in Supabase
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: settings.firstName,
          last_name: settings.lastName,
          phone: settings.phone
        }
      })

      if (error) throw error

      toast.success('Settings saved successfully')
    } catch (error: any) {
      console.error('Error saving settings:', error)
      toast.error(error.message || 'Failed to save settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      toast.success('Password updated successfully')
      setShowPasswordForm(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setSettings(prev => ({ ...prev, passwordLastChanged: new Date().toISOString().split('T')[0] }))
    } catch (error: any) {
      console.error('Error updating password:', error)
      toast.error(error.message || 'Failed to update password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      const exportData = {
        settings,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }

      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `qalin-sara-settings-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Settings exported successfully')
    } catch (error) {
      console.error('Error exporting settings:', error)
      toast.error('Failed to export settings')
    }
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string)
        if (importedData.settings) {
          setSettings(importedData.settings)
          toast.success('Settings imported successfully')
        }
      } catch (error) {
        console.error('Error importing settings:', error)
        toast.error('Invalid settings file')
      }
    }
    reader.readAsText(file)
  }

  const tabs = [
    { id: 'company', label: t('company'), icon: User },
    { id: 'business', label: t('business'), icon: Settings },
    { id: 'profile', label: t('profile'), icon: User },
    { id: 'notifications', label: t('notifications'), icon: Bell },
    { id: 'security', label: t('security'), icon: Shield },
    { id: 'appearance', label: t('appearance'), icon: Palette },
    { id: 'data', label: t('data'), icon: Database }
  ]

  return (
    <div 
      className="min-h-screen p-6"
      style={{
        backgroundColor: theme === 'dark' ? '#0f0f0f' : '#f9fafb',
        color: theme === 'dark' ? '#f5f5f5' : '#111827',
        minHeight: '100vh'
      }}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 
              className="text-3xl font-bold"
              style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
            >
              {t('settings')}
            </h1>
            <p 
              className="mt-2"
              style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
            >
              Manage your application preferences and configuration
            </p>
            <p 
              className="text-sm mt-1"
              style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
            >
              Current theme: {theme} | HTML classes: {htmlClasses}
            </p>
            <button
              onClick={() => {
                setTheme(theme === 'dark' ? 'light' : 'dark')
              }}
              className="mt-2 px-4 py-2 rounded text-sm font-medium"
              style={{
                backgroundColor: theme === 'dark' ? '#3b82f6' : '#1f2937',
                color: '#ffffff',
                border: 'none'
              }}
            >
              {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            </button>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <label htmlFor="import-settings">
              <Button variant="outline" asChild>
                <div>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </div>
              </Button>
            </label>
            <input
              id="import-settings"
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
            <Button onClick={handleSave} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card 
            className="border-0 shadow-sm"
            style={{
              backgroundColor: theme === 'dark' ? '#111827' : '#ffffff'
            }}
          >
            <CardContent className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors"
                    style={{
                      backgroundColor: activeTab === tab.id 
                        ? (theme === 'dark' ? '#1e40af' : '#dbeafe')
                        : 'transparent',
                      color: activeTab === tab.id
                        ? (theme === 'dark' ? '#93c5fd' : '#1d4ed8')
                        : (theme === 'dark' ? '#d1d5db' : '#4b5563')
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== tab.id) {
                        e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== tab.id) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                    }}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {/* Company Information */}
          {activeTab === 'company' && (
            <Card 
              className="border-0 shadow-sm"
              style={{
                backgroundColor: theme === 'dark' ? '#111827' : '#ffffff'
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                    Company Information
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label 
                      htmlFor="companyName" 
                      className="mb-2"
                      style={getLabelStyle()}
                    >
                      Company Name
                    </Label>
                    <Input
                      id="companyName"
                      value={settings.companyName}
                      onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                      style={getInputStyle()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyEmail" className="mb-2">Email</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={settings.companyEmail}
                      onChange={(e) => setSettings({...settings, companyEmail: e.target.value})}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyPhone" className="mb-2">Phone</Label>
                    <Input
                      id="companyPhone"
                      value={settings.companyPhone}
                      onChange={(e) => setSettings({...settings, companyPhone: e.target.value})}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyWebsite" className="mb-2">Website</Label>
                    <Input
                      id="companyWebsite"
                      value={settings.companyWebsite}
                      onChange={(e) => setSettings({...settings, companyWebsite: e.target.value})}
                      className="bg-white"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="companyAddress" className="mb-2">Address</Label>
                  <Textarea
                    id="companyAddress"
                    value={settings.companyAddress}
                    onChange={(e) => setSettings({...settings, companyAddress: e.target.value})}
                    className="bg-white"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Business Settings */}
          {activeTab === 'business' && (
            <Card className="border-0 shadow-sm" style={getCardStyle()}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span style={getTextStyle()}>Business Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currency" className="mb-2">Currency</Label>
                    <select
                      id="currency"
                      value={settings.currency}
                      onChange={(e) => setSettings({...settings, currency: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="taxRate" className="mb-2">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      step="0.1"
                      value={settings.taxRate}
                      onChange={(e) => setSettings({...settings, taxRate: parseFloat(e.target.value)})}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="invoicePrefix" className="mb-2">Invoice Prefix</Label>
                    <Input
                      id="invoicePrefix"
                      value={settings.invoicePrefix}
                      onChange={(e) => setSettings({...settings, invoicePrefix: e.target.value})}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="orderPrefix" className="mb-2">Order Prefix</Label>
                    <Input
                      id="orderPrefix"
                      value={settings.orderPrefix}
                      onChange={(e) => setSettings({...settings, orderPrefix: e.target.value})}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expensePrefix" className="mb-2">Expense Prefix</Label>
                    <Input
                      id="expensePrefix"
                      value={settings.expensePrefix}
                      onChange={(e) => setSettings({...settings, expensePrefix: e.target.value})}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lowStockThreshold" className="mb-2">Low Stock Threshold</Label>
                    <Input
                      id="lowStockThreshold"
                      type="number"
                      value={settings.lowStockThreshold}
                      onChange={(e) => setSettings({...settings, lowStockThreshold: parseInt(e.target.value)})}
                      className="bg-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* User Profile */}
          {activeTab === 'profile' && (
            <Card className="border-0 shadow-sm" style={getCardStyle()}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span style={getTextStyle()}>User Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="mb-2">First Name</Label>
                    <Input
                      id="firstName"
                      value={settings.firstName}
                      onChange={(e) => setSettings({...settings, firstName: e.target.value})}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="mb-2">Last Name</Label>
                    <Input
                      id="lastName"
                      value={settings.lastName}
                      onChange={(e) => setSettings({...settings, lastName: e.target.value})}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="mb-2">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="mb-2">Phone</Label>
                    <Input
                      id="phone"
                      value={settings.phone}
                      onChange={(e) => setSettings({...settings, phone: e.target.value})}
                      className="bg-white"
                    />
                  </div>
                </div>
                
                {/* Password Section */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Password & Security</h3>
                      <p className="text-sm text-gray-600">Last changed: {settings.passwordLastChanged}</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                  
                  {showPasswordForm && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Label htmlFor="currentPassword" className="mb-2">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            className="bg-white pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="newPassword" className="mb-2">New Password</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            className="bg-white pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword" className="mb-2">Confirm New Password</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            className="bg-white pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <Button onClick={handlePasswordChange} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                          Update Password
                        </Button>
                        <Button variant="outline" onClick={() => setShowPasswordForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <Card className="border-0 shadow-sm" style={getCardStyle()}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span style={getTextStyle()}>Notification Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <p className="text-sm text-gray-500">Receive email alerts for important events</p>
                      </div>
                      <input
                        type="checkbox"
                        id="emailNotifications"
                        checked={settings.emailNotifications}
                        onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="lowStockAlerts">Low Stock Alerts</Label>
                        <p className="text-sm text-gray-500">Get notified when inventory is running low</p>
                      </div>
                      <input
                        type="checkbox"
                        id="lowStockAlerts"
                        checked={settings.lowStockAlerts}
                        onChange={(e) => setSettings({...settings, lowStockAlerts: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="orderNotifications">Order Notifications</Label>
                        <p className="text-sm text-gray-500">Get notified about new orders and updates</p>
                      </div>
                      <input
                        type="checkbox"
                        id="orderNotifications"
                        checked={settings.orderNotifications}
                        onChange={(e) => setSettings({...settings, orderNotifications: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="invoiceNotifications">Invoice Notifications</Label>
                        <p className="text-sm text-gray-500">Get notified about invoice updates</p>
                      </div>
                      <input
                        type="checkbox"
                        id="invoiceNotifications"
                        checked={settings.invoiceNotifications}
                        onChange={(e) => setSettings({...settings, invoiceNotifications: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="expenseNotifications">Expense Notifications</Label>
                        <p className="text-sm text-gray-500">Get notified about expense approvals</p>
                      </div>
                      <input
                        type="checkbox"
                        id="expenseNotifications"
                        checked={settings.expenseNotifications}
                        onChange={(e) => setSettings({...settings, expenseNotifications: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900">SMS Notifications</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="smsNotifications">SMS Notifications</Label>
                      <p className="text-sm text-gray-500">Receive SMS alerts for urgent events</p>
                    </div>
                    <input
                      type="checkbox"
                      id="smsNotifications"
                      checked={settings.smsNotifications}
                      onChange={(e) => setSettings({...settings, smsNotifications: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <Card className="border-0 shadow-sm" style={getCardStyle()}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span style={getTextStyle()}>Security Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={settings.twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {settings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Smartphone className="h-4 w-4 mr-2" />
                        {settings.twoFactorEnabled ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="sessionTimeout" className="mb-2">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                      className="bg-white"
                      min="5"
                      max="480"
                    />
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Active Sessions</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-medium text-gray-900">Current Session</p>
                            <p className="text-sm text-gray-500">Chrome on Windows • New York, US</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <div>
                            <p className="font-medium text-gray-900">Mobile App</p>
                            <p className="text-sm text-gray-500">iOS Safari • 2 hours ago</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appearance */}
          {activeTab === 'appearance' && (
            <Card 
              className="border-0 shadow-sm"
              style={{
                backgroundColor: theme === 'dark' ? '#111827' : '#ffffff'
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                    {t('appearanceSettings')}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label 
                      htmlFor="theme" 
                      className="mb-2"
                      style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                    >
                      {t('theme')}
                    </Label>
                    <select
                      id="theme"
                      value={theme}
                      onChange={(e) => {
                        const newTheme = e.target.value as 'light' | 'dark' | 'system'
                        setTheme(newTheme)
                        toast.success(`${t('themeChanged')} ${t(newTheme)}`)
                      }}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                        color: theme === 'dark' ? '#f9fafb' : '#111827',
                        borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                      }}
                    >
                      <option value="light">{t('light')}</option>
                      <option value="dark">{t('dark')}</option>
                      <option value="system">{t('system')}</option>
                    </select>
                  </div>
                  <div>
                    <Label 
                      htmlFor="language" 
                      className="mb-2"
                      style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                    >
                      {t('language')}
                    </Label>
                    <select
                      id="language"
                      value={locale}
                      onChange={(e) => {
                        const newLocale = e.target.value as 'en' | 'es' | 'fr' | 'de' | 'ar'
                        setLocale(newLocale)
                        const languageNames = {
                          en: 'English',
                          es: 'Español',
                          fr: 'Français',
                          de: 'Deutsch',
                          ar: 'العربية'
                        }
                        toast.success(`${t('languageChanged')} ${languageNames[newLocale]}`)
                      }}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                        color: theme === 'dark' ? '#f9fafb' : '#111827',
                        borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                      }}
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="ar">العربية</option>
                    </select>
                  </div>
                  <div>
                    <Label 
                      htmlFor="timezone" 
                      className="mb-2"
                      style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                    >
                      {t('timezone')}
                    </Label>
                    <select
                      id="timezone"
                      value={timezone}
                      onChange={(e) => {
                        const newTimezone = e.target.value
                        setTimezone(newTimezone)
                        toast.success(`${t('timezoneChanged')} ${newTimezone}`)
                      }}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                        color: theme === 'dark' ? '#f9fafb' : '#111827',
                        borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                      }}
                    >
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>
                  <div>
                    <Label 
                      htmlFor="dateFormat" 
                      className="mb-2"
                      style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                    >
                      {t('dateFormat')}
                    </Label>
                    <select
                      id="dateFormat"
                      value={dateFormat}
                      onChange={(e) => {
                        const newFormat = e.target.value
                        setDateFormat(newFormat)
                        toast.success(`${t('dateFormatChanged')} ${newFormat}`)
                      }}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                        color: theme === 'dark' ? '#f9fafb' : '#111827',
                        borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                      }}
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <Label 
                      htmlFor="currencyPosition" 
                      className="mb-2"
                      style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                    >
                      {t('currencyPosition')}
                    </Label>
                    <select
                      id="currencyPosition"
                      value={currencyPosition}
                      onChange={(e) => {
                        const newPosition = e.target.value as 'before' | 'after'
                        setCurrencyPosition(newPosition)
                        toast.success(`${t('currencyPositionChanged')} ${t(newPosition)}`)
                      }}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                        color: theme === 'dark' ? '#f9fafb' : '#111827',
                        borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                      }}
                    >
                      <option value="before">{t('before')}</option>
                      <option value="after">{t('after')}</option>
                    </select>
                  </div>
                </div>
                
                {/* Theme Preview */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('themePreview')}</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div 
                      className="p-4 rounded-lg border-2 cursor-pointer transition-all"
                      style={{
                        borderColor: theme === 'light' ? '#3b82f6' : (theme === 'dark' ? '#4b5563' : '#e5e7eb'),
                        backgroundColor: theme === 'light' ? '#dbeafe' : (theme === 'dark' ? '#374151' : '#ffffff')
                      }}
                      onClick={() => {
                        setTheme('light')
                        toast.success(`${t('themeChanged')} ${t('light')}`)
                      }}
                    >
                      <div className="text-center">
                        <Sun className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                        <p className="font-medium text-gray-900 dark:text-white">{t('light')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('cleanAndBright')}</p>
                      </div>
                    </div>
                    
                    <div 
                      className="p-4 rounded-lg border-2 cursor-pointer transition-all"
                      style={{
                        borderColor: theme === 'dark' ? '#3b82f6' : (theme === 'dark' ? '#4b5563' : '#e5e7eb'),
                        backgroundColor: theme === 'dark' ? '#1e40af' : (theme === 'dark' ? '#374151' : '#ffffff')
                      }}
                      onClick={() => {
                        setTheme('dark')
                        toast.success(`${t('themeChanged')} ${t('dark')}`)
                      }}
                    >
                      <div className="text-center">
                        <Moon className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                        <p className="font-medium text-gray-900 dark:text-white">{t('dark')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('easyOnEyes')}</p>
                      </div>
                    </div>
                    
                    <div 
                      className="p-4 rounded-lg border-2 cursor-pointer transition-all"
                      style={{
                        borderColor: theme === 'system' ? '#3b82f6' : (theme === 'dark' ? '#4b5563' : '#e5e7eb'),
                        backgroundColor: theme === 'system' ? '#dbeafe' : (theme === 'dark' ? '#374151' : '#ffffff')
                      }}
                      onClick={() => {
                        setTheme('system')
                        toast.success(`${t('themeChanged')} ${t('system')}`)
                      }}
                    >
                      <div className="text-center">
                        <Settings className="h-8 w-8 mx-auto mb-2 text-gray-500 dark:text-gray-400" />
                        <p className="font-medium text-gray-900 dark:text-white">{t('system')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('followsSystem')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Management */}
          {activeTab === 'data' && (
            <Card className="border-0 shadow-sm" style={getCardStyle()}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span style={getTextStyle()}>Data Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Backup Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto Backup</Label>
                        <p className="text-sm text-gray-500">Automatically backup your data</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.autoBackup}
                        onChange={(e) => setSettings({...settings, autoBackup: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <Label htmlFor="backupFrequency" className="mb-2">Backup Frequency</Label>
                      <select
                        id="backupFrequency"
                        value={settings.backupFrequency}
                        onChange={(e) => setSettings({...settings, backupFrequency: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="dataRetention" className="mb-2">Data Retention (days)</Label>
                      <Input
                        id="dataRetention"
                        type="number"
                        value={settings.dataRetention}
                        onChange={(e) => setSettings({...settings, dataRetention: parseInt(e.target.value)})}
                        className="bg-white"
                        min="30"
                        max="3650"
                      />
                    </div>
                    <div>
                      <Label htmlFor="exportFormat" className="mb-2">Export Format</Label>
                      <select
                        id="exportFormat"
                        value={settings.exportFormat}
                        onChange={(e) => setSettings({...settings, exportFormat: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="csv">CSV</option>
                        <option value="json">JSON</option>
                        <option value="xlsx">Excel</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900">Data Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="flex items-center justify-center space-x-2">
                      <Download className="h-4 w-4" />
                      <span>Export All Data</span>
                    </Button>
                    <Button variant="outline" className="flex items-center justify-center space-x-2">
                      <RefreshCw className="h-4 w-4" />
                      <span>Create Backup</span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900">System Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Application Version</p>
                      <p className="text-lg font-semibold text-gray-900">v1.0.0</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Database Status</p>
                      <Badge className="bg-green-100 text-green-800">Connected</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Last Backup</p>
                      <p className="text-lg font-semibold text-gray-900">2 hours ago</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Storage Used</p>
                      <p className="text-lg font-semibold text-gray-900">245 MB / 1 GB</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
