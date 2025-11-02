'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Save, User, Mail, Phone } from 'lucide-react'
import { useUserProfile } from '@/lib/hooks/use-user-profile'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface UserProfileFormProps {
  user: SupabaseUser
}

export function UserProfileForm({ user }: UserProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: ''
  })

  const supabase = createClient()
  const { userWithProfile, isLoading: profileLoading } = useUserProfile(user)

  useEffect(() => {
    if (userWithProfile?.profile) {
      setProfileData({
        first_name: userWithProfile.profile.first_name || '',
        last_name: userWithProfile.profile.last_name || '',
        phone: userWithProfile.profile.phone || '',
        email: user.email || ''
      })
    }
  }, [userWithProfile, user.email])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          phone: profileData.phone,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      toast.success('Profile updated successfully')
    } catch (error: any) {
      toast.error('Failed to update profile: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (profileLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-qalin-red"></div>
            <span className="ml-2">Loading profile...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="w-5 h-5 mr-2" />
          User Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              value={profileData.first_name}
              onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
              placeholder="Enter first name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              value={profileData.last_name}
              onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
              placeholder="Enter last name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={profileData.email}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">Email cannot be changed</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center">
            <Phone className="w-4 h-4 mr-2" />
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            value={profileData.phone}
            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
            placeholder="Enter phone number"
          />
        </div>

        <Button 
          onClick={handleSave}
          disabled={isLoading}
          className="w-full gradient-bg hover:opacity-90"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
