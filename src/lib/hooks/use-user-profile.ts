'use client'

import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface UserProfile {
  id: string
  first_name?: string
  last_name?: string
  phone?: string
  role: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

interface UserWithProfile extends User {
  profile?: UserProfile
}

export function useUserProfile(user: User | null) {
  const [userWithProfile, setUserWithProfile] = useState<UserWithProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setUserWithProfile(null)
      setIsLoading(false)
      return
    }

    const fetchUserProfile = async () => {
      try {
        setIsLoading(true)
        
        // For now, let's skip the database query and use a simple fallback
        // This ensures the app works while we debug the database issue
        console.log('Using fallback profile for user:', user.id, user.email)
        
        // Create a profile based on user data and email
        const fallbackProfile = {
          id: user.id,
          role: user.email === 'admin@qalinsara.com' ? 'admin' : 'user',
          first_name: user.user_metadata?.first_name || 'User',
          last_name: user.user_metadata?.last_name || '',
          phone: user.user_metadata?.phone || '',
          created_at: user.created_at,
          updated_at: user.updated_at || user.created_at
        }
        
        setUserWithProfile({
          ...user,
          profile: fallbackProfile
        })
        
        // Try to fetch from database in background (non-blocking)
        try {
          const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle()

          if (!error && profile) {
            console.log('Database profile found, updating:', profile)
            setUserWithProfile({
              ...user,
              profile: profile
            })
          } else if (error) {
            console.log('Database query failed (non-blocking):', error.message || 'Unknown error')
          } else {
            console.log('No database profile found, using fallback')
          }
        } catch (dbError) {
          console.log('Database query error (non-blocking):', dbError)
        }
      } catch (error) {
        console.error('Unexpected error fetching user profile:', error)
        // Set a default profile even on error
        setUserWithProfile({
          ...user,
          profile: {
            id: user.id,
            role: user.email === 'admin@qalinsara.com' ? 'admin' : 'user',
            first_name: user.user_metadata?.first_name || 'User',
            last_name: user.user_metadata?.last_name || '',
            phone: user.user_metadata?.phone || '',
            created_at: user.created_at,
            updated_at: user.updated_at || user.created_at
          }
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [user, supabase])

  const getUserDisplayName = () => {
    if (!userWithProfile) return 'Unknown User'
    
    const profile = userWithProfile.profile
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    }
    
    return userWithProfile.email || 'Unknown User'
  }

  const getUserInitials = () => {
    if (!userWithProfile) return 'U'
    
    const profile = userWithProfile.profile
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    }
    
    return userWithProfile.email?.charAt(0).toUpperCase() || 'U'
  }

  const getUserRole = () => {
    if (!userWithProfile?.profile) return 'User'
    return userWithProfile.profile.role.charAt(0).toUpperCase() + userWithProfile.profile.role.slice(1)
  }

  const isAdmin = () => {
    return userWithProfile?.profile?.role === 'admin'
  }

  return {
    userWithProfile,
    isLoading,
    getUserDisplayName,
    getUserInitials,
    getUserRole,
    isAdmin
  }
}
