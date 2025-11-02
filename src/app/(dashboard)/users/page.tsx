'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserProfile } from '@/lib/hooks/use-user-profile'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Shield,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  created_at: string
  email_confirmed_at?: string
  last_sign_in_at?: string
  role?: string
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  })

  const supabase = createClient()
  
  // Get current user from the data attribute set by layout
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null)
  const { isAdmin } = useUserProfile(currentUser)

  useEffect(() => {
    // Get user from the data attribute set by layout
    const userElement = document.querySelector('.user-context')
    if (userElement) {
      const userData = userElement.getAttribute('data-user')
      if (userData) {
        try {
          const user = JSON.parse(userData)
          setCurrentUser(user)
        } catch (error) {
          console.error('Error parsing user data:', error)
        }
      }
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    const filtered = users.filter(user =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [users, searchTerm])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      
      // Get users from auth and profiles
      const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
      
      if (authError || profilesError) {
        toast.error('Failed to fetch users')
        return
      }

      // Merge auth users with profiles
      const mergedUsers = (users || []).map(user => {
        const profile = profiles?.find(p => p.id === user.id)
        return {
          id: user.id,
          email: user.email || '',
          first_name: profile?.first_name || user.user_metadata?.first_name,
          last_name: profile?.last_name || user.user_metadata?.last_name,
          phone: profile?.phone || user.user_metadata?.phone,
          created_at: user.created_at,
          email_confirmed_at: user.email_confirmed_at,
          last_sign_in_at: user.last_sign_in_at,
          role: profile?.role || 'user'
        }
      })

      setUsers(mergedUsers)
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password) {
      toast.error('Email and password are required')
      return
    }

    setIsCreatingUser(true)
    try {
      const { error } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        user_metadata: {
          first_name: newUser.firstName,
          last_name: newUser.lastName,
          phone: newUser.phone,
        },
        email_confirm: true
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('User created successfully')
      setShowCreateForm(false)
      setNewUser({ email: '', password: '', firstName: '', lastName: '', phone: '' })
      fetchUsers()
    } catch (error) {
      toast.error('Failed to create user')
    } finally {
      setIsCreatingUser(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId)
      
      if (error) {
        toast.error('Failed to delete user')
        return
      }

      toast.success('User deleted successfully')
      fetchUsers()
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadge = (user: UserProfile) => {
    if (user.email_confirmed_at) {
      return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>
    }
    return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><XCircle className="w-3 h-3 mr-1" />Pending</Badge>
  }

  // Check if user is admin
  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You need administrator privileges to access user management.
            </p>
            <Button onClick={() => window.history.back()} variant="outline">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage system users and permissions</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="gradient-bg hover:opacity-90"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New User</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                placeholder="Enter email address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newUser.phone}
                onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                placeholder="Enter password"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleCreateUser}
                disabled={isCreatingUser}
                className="gradient-bg hover:opacity-90"
              >
                {isCreatingUser ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create User'
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            Total Users: {users.length}
          </div>
          <div className="text-sm text-muted-foreground">
            Verified: {users.filter(u => u.email_confirmed_at).length}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading users...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-4 font-medium">User</th>
                    <th className="p-4 font-medium">Email</th>
                    <th className="p-4 font-medium">Phone</th>
                    <th className="p-4 font-medium">Role</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Created</th>
                    <th className="p-4 font-medium">Last Sign In</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-qalin-red to-qalin-red-light rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {user.first_name?.[0] || user.email[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">
                              {user.first_name && user.last_name 
                                ? `${user.first_name} ${user.last_name}`
                                : 'No name set'
                              }
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {user.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>{user.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {user.phone ? (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>{user.phone}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge 
                          variant={user.role === 'admin' ? 'default' : 'secondary'}
                          className={user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(user)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{formatDate(user.created_at)}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {user.last_sign_in_at ? (
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{formatDate(user.last_sign_in_at)}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
