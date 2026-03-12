'use client'

import { inviteUser } from "./actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"

export default function InvitePage() {
  const [role, setRole] = useState<string>("")
  const [loading, setLoading] = useState(true)
  
  // Fetch current user role on mount
  useEffect(() => {
    const supabase = createClient()
    async function getRole() {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
            setRole(data?.role || "")
        }
        setLoading(false)
    }
    getRole()
  }, [])

  if (loading) return <div>Loading form...</div>

  // Logic: Show "Super Admin" option ONLY if the user is a Super Admin
  const canCreateSuperAdmin = role === 'super_admin'

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Add Team Member</h2>
        <p className="text-muted-foreground">Create a new account for a staff member.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Member Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={inviteUser} className="space-y-6">
            
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input name="fullName" placeholder="e.g. Dr. Jennifer Melfi" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input name="email" type="email" placeholder="jennifer@therapy.com" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select 
                  name="role" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  defaultValue="scheduler"
                >
                  <option value="scheduler">Scheduler (Front Desk)</option>
                  <option value="therapist">Therapist (Doctor)</option>
                  <option value="admin_user">Office Manager (Admin)</option>
                  
                  {/* HIDDEN unless you are a Super Admin */}
                  {canCreateSuperAdmin && (
                      <option value="super_admin">Super Admin</option>
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Temporary Password</Label>
                <Input name="password" type="text" defaultValue="welcome123" required />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Link href="/dashboard/team">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" className="bg-slate-900 text-white">Create Account</Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}