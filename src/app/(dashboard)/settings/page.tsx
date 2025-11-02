import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsForm from '@/components/settings/settings-form'
import { LocaleProvider } from '@/components/providers/locale-provider'

export default async function SettingsPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <LocaleProvider
      defaultLocale="en"
      storageKey="qalin-sara-locale"
    >
      <SettingsForm user={user} />
    </LocaleProvider>
  )
}

