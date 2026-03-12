'use server'

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"

export async function inviteUser(formData: FormData) {
  // 1. Security Check: Only Admins can do this
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // 2. Gather Data
  const email = formData.get('email') as string
  const fullName = formData.get('fullName') as string
  const role = formData.get('role') as string
  const password = formData.get('password') as string

  // 3. Create User (Using Admin Client)
  const supabaseAdmin = createAdminClient()

  const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm so they can login properly
    user_metadata: { full_name: fullName }
  })

  if (error) {
    console.error('Invite Error:', error)
    return redirect('/dashboard/team/invite?error=' + error.message)
  }

  if (newUser.user) {
    // 4. Set the Role (Update the Profile)
    // The profile was auto-created by our Trigger, but it defaults to 'scheduler'.
    // We need to upgrade it if they were invited as a Therapist or Admin.
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ role: role })
      .eq('id', newUser.user.id)
    
    if (profileError) {
      console.error('Profile Update Error:', profileError)
    }
  }

  // 5. Success
  revalidatePath('/dashboard/team')
  redirect('/dashboard/team')
}