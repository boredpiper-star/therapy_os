'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import SuperAdminDashboard from "./SuperAdminDashboard"
import TherapistDashboard from "./TherapistDashboard" 
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userName, setUserName] = useState("")
  const [userId, setUserId] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const supabase = createClient()

  useEffect(() => {
    async function getUserProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single()
      
      if (profile) {
          // --- TRAFFIC CONTROL (Moved Inside UseEffect) ---
          
          // 1. Redirect Admin Users & Schedulers immediately
          if (profile.role === 'admin_user' || profile.role === 'scheduler') {
              router.push('/dashboard/schedule')
              return // Stop here! Do not set loading to false.
          }

          // 2. Set State for allowed users (Therapist / Super Admin)
          setUserRole(profile.role)
          setUserName(profile.full_name)
          setUserId(user.id)
          setLoading(false)
      }
    }
    getUserProfile()
  }, [router])

  if (loading) return <div className="p-10 text-slate-400">Loading Dashboard...</div>

  // --- RENDER VIEWS ---
  
  if (userRole === 'therapist' || userRole === 'doctor') {
      return <TherapistDashboard userId={userId} userName={userName} />
  }

  // Default view for Super Admin (since others were redirected above)
  return <SuperAdminDashboard />
}