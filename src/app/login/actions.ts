'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

// Update: Accept prevState (required for useActionState hook)
export async function login(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data: { user }, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // FIX: Return the error instead of redirecting
  if (error || !user) {
    return { error: 'Invalid email or password. Please try again.' }
  }

  // --- TRAFFIC COP LOGIC ---
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role

  revalidatePath('/', 'layout')

  if (role === 'admin' || role === 'scheduler') {
    redirect('/dashboard/schedule')
  } else {
    redirect('/dashboard')
  }
}

// // ... keep signup as is ...
// export async function signup(formData: FormData) {
//     // ... your existing signup code ...
//     // (Note: Since we are keeping signup distinct, it will still use the old redirect method, 
//     // which is fine for a "Dev Only" feature)
//     const supabase = await createClient()
//     const email = formData.get('email') as string
//     const password = formData.get('password') as string
//     const fullName = formData.get('fullName') as string
  
//     const { error } = await supabase.auth.signUp({
//       email,
//       password,
//       options: { data: { full_name: fullName } },
//     })
  
//     if (error) {
//       return redirect('/login?error=Could not create user')
//     }
  
//     revalidatePath('/', 'layout')
//     redirect('/dashboard')
// }