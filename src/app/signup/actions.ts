'use server'

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // 1. Gather Data
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  // 2. Sign Up with Metadata (Name)
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName, // This gets picked up by our SQL Trigger
      },
    },
  })

  if (error) {
    console.error(error)
    return redirect('/signup?error=Could not create account')
  }

  // 3. Success
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}