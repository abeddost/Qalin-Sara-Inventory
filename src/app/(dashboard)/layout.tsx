import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex overflow-x-hidden">
      <Sidebar user={user} />
      <div className="flex-1 lg:ml-0 w-0 min-w-0 overflow-x-hidden">
        {/* Pass user to children through context or props */}
        <div className="user-context w-full max-w-full overflow-x-hidden" data-user={JSON.stringify(user)}>
          {children}
        </div>
      </div>
    </div>
  )
}
