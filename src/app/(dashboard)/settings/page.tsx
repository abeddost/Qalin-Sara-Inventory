'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Database,
  Mail,
  Globe,
  Save,
  Moon,
  Sun,
  Download,
  Upload
} from 'lucide-react'
import { useState } from 'react'

export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [settings, setSettings] = useState({
    companyName: 'Qalin Sara',
    companyEmail: 'info@qalinsara.com',
    companyPhone: '+1 (555) 123-4567',
    companyAddress: '123 Business Street, City, State 12345',
    currency: 'USD',
    taxRate: 8.5,
    invoicePrefix: 'INV',
    orderPrefix: 'ORD',
    lowStockThreshold: 5,
    emailNotifications: true,
    smsNotifications: false,
    autoBackup: true,
    backupFrequency: 'daily'
  })

  const handleSave = () => {
    // TODO: Implement settings save functionality
    console.log('Saving settings:', settings)
  }

  const settingSections = [
    {
      title: 'Company Information',
      icon: User,
      description: 'Basic company details and contact information'
    },
    {
      title: 'Business Settings',
      icon: Settings,
      description: 'Currency, tax rates, and prefixes'
    },
    {
      title: 'Notifications',
      icon: Bell,
      description: 'Email and SMS notification preferences'
    },
    {
      title: 'Security',
      icon: Shield,
      description: 'Password and security settings'
    },
    {
      title: 'Appearance',
      icon: Palette,
      description: 'Theme and display preferences'
    },
    {
      title: 'Data Management',
      icon: Database,
      description: 'Backup and data export settings'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">Manage your application preferences and configuration</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Settings
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import Settings
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {settingSections.map((section, index) => (
          <Card key={index} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <section.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <span className="text-lg font-semibold text-gray-900">{section.title}</span>
                  <p className="text-sm text-gray-500 font-normal">{section.description}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {section.title === 'Company Information' && (
                  <>
                    <div>
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={settings.companyName}
                        onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyEmail">Email</Label>
                      <Input
                        id="companyEmail"
                        type="email"
                        value={settings.companyEmail}
                        onChange={(e) => setSettings({...settings, companyEmail: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyPhone">Phone</Label>
                      <Input
                        id="companyPhone"
                        value={settings.companyPhone}
                        onChange={(e) => setSettings({...settings, companyPhone: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                  </>
                )}

                {section.title === 'Business Settings' && (
                  <>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <select
                        id="currency"
                        value={settings.currency}
                        onChange={(e) => setSettings({...settings, currency: e.target.value})}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="taxRate">Tax Rate (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        step="0.1"
                        value={settings.taxRate}
                        onChange={(e) => setSettings({...settings, taxRate: parseFloat(e.target.value)})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                      <Input
                        id="lowStockThreshold"
                        type="number"
                        value={settings.lowStockThreshold}
                        onChange={(e) => setSettings({...settings, lowStockThreshold: parseInt(e.target.value)})}
                        className="mt-1"
                      />
                    </div>
                  </>
                )}

                {section.title === 'Notifications' && (
                  <>
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
                  </>
                )}

                {section.title === 'Security' && (
                  <>
                    <div>
                      <Button variant="outline" className="w-full">
                        Change Password
                      </Button>
                    </div>
                    <div>
                      <Button variant="outline" className="w-full">
                        Two-Factor Authentication
                      </Button>
                    </div>
                    <div>
                      <Button variant="outline" className="w-full">
                        Session Management
                      </Button>
                    </div>
                  </>
                )}

                {section.title === 'Appearance' && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Dark Mode</Label>
                        <p className="text-sm text-gray-500">Switch between light and dark themes</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="flex items-center space-x-2"
                      >
                        {isDarkMode ? (
                          <>
                            <Sun className="h-4 w-4" />
                            <span>Light</span>
                          </>
                        ) : (
                          <>
                            <Moon className="h-4 w-4" />
                            <span>Dark</span>
                          </>
                        )}
                      </Button>
                    </div>
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <select
                        id="language"
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                  </>
                )}

                {section.title === 'Data Management' && (
                  <>
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
                      <Label htmlFor="backupFrequency">Backup Frequency</Label>
                      <select
                        id="backupFrequency"
                        value={settings.backupFrequency}
                        onChange={(e) => setSettings({...settings, backupFrequency: e.target.value})}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div className="pt-4">
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Export All Data
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Information */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>System Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

