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
    <div className="min-h-screen flex">
      <Sidebar user={user} />
      <div className="flex-1 lg:ml-0">
        {/* Pass user to children through context or props */}
        <div className="user-context" data-user={JSON.stringify(user)}>
          {children}
        </div>
      </div>
    </div>
  )
}
