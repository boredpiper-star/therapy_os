import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Sidebar from "@/components/Sidebar" 

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()
  
  const isSuperAdmin = profile?.role === 'super_admin'

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-900">
      <Sidebar role={profile?.role} />
      <main className="flex-1 overflow-y-auto w-full"> 
        <header className="flex h-16 items-center border-b bg-white px-6 justify-end md:justify-between sticky top-0 z-10 dark:bg-slate-950 dark:border-slate-800 ml-12 md:ml-64"> 
          <h1 className="hidden md:block text-lg font-medium text-gray-900 dark:text-slate-100">
            Welcome, <span className="font-semibold">{profile?.full_name || user.email}</span>
          </h1>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${isSuperAdmin ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800' : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'}`}>
            {profile?.role?.replace('_', ' ') || 'User'}
          </span>
        </header>
        <div className="p-4 md:p-6 md:ml-64 pb-20 md:pb-6">
          {children}
        </div>
      </main>
    </div>
  )
}