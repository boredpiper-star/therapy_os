import { createClient } from "@/utils/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Shield, User, Calendar, Briefcase, Mail } from "lucide-react"
import Link from "next/link"

export default async function TeamPage() {
  const supabase = await createClient()
  
  // 1. Get Current User
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div>Please log in</div>

  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // 2. Fetch Team Members
  // If I am NOT a super_admin, do not show me other super_admins
  let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })

  if (currentUserProfile?.role !== 'super_admin') {
      query = query.neq('role', 'super_admin')
  }

  const { data: team } = await query

  // Helper for role badges
  const getRoleBadge = (role: string) => {
     switch(role) {
         case 'super_admin': return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100"><Shield className="w-3 h-3 mr-1"/> Super Admin</Badge>
         case 'admin_user': return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100"><User className="w-3 h-3 mr-1"/> Office Admin</Badge>
         case 'therapist': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><Briefcase className="w-3 h-3 mr-1"/> Therapist</Badge>
         case 'doctor': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><Briefcase className="w-3 h-3 mr-1"/> Therapist</Badge>
         default: return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100"><Calendar className="w-3 h-3 mr-1"/> Scheduler</Badge>
     }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
            <p className="text-muted-foreground">View and manage your clinic staff.</p>
         </div>
         <Link href="/dashboard/team/invite">
            <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm"><Plus className="w-4 h-4 mr-2"/> Add Team Member</Button>
         </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {team?.map((member) => (
             <Card key={member.id} className="hover:shadow-md transition-shadow border-slate-200">
                <CardContent className="pt-6">
                   <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                         <div className="h-12 w-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                            {member.full_name?.charAt(0) || '?'}
                         </div>
                         <div>
                            <div className="flex items-center gap-2">
                               <h3 className="font-bold text-slate-900">{member.full_name}</h3>
                               {/* NEW ID BADGE NEXT TO NAME */}
                               {member.display_id && (
                                  <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                                     {member.display_id}
                                  </span>
                               )}
                            </div>
                            <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                               <Mail className="w-3 h-3" /> {member.email}
                            </p>
                         </div>
                      </div>
                   </div>
                   
                   <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
                      {getRoleBadge(member.role)}
                      {/* FALLBACK IF ID IS MISSING */}
                      {!member.display_id && (
                         <span className="text-xs text-slate-400 font-mono">ID: ...{member.id.slice(0, 4)}</span>
                      )}
                   </div>
                </CardContent>
             </Card>
         ))}
      </div>
    </div>
  )
}