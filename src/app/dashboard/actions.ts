'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createAppointment(formData: FormData) {
  const supabase = await createClient()

  // 1. Get the Current User (Therapist)
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // 2. Extract Data from Form
  const patientName = formData.get('patientName') as string
  const serviceType = formData.get('serviceType') as string
  const date = formData.get('date') as string
  const startTime = formData.get('startTime') as string
  const endTime = formData.get('endTime') as string

  // 3. Combine Date + Time into a full Timestamp
  // Result looks like: "2025-05-13T09:00:00"
  const startIso = `${date}T${startTime}:00`
  const endIso = `${date}T${endTime}:00`

  // 4. Save to Supabase
  const { error } = await supabase
    .from('appointments')
    .insert({
      patient_name: patientName,
      service_type: serviceType,
      start_time: startIso,
      end_time: endIso,
      therapist_id: user.id,
      status: 'scheduled'
    })

  if (error) {
    console.error('Error creating appointment:', error)
    return redirect('/dashboard/schedule?error=Failed to create appointment')
  }

  // 5. Success! Go back to schedule
  revalidatePath('/dashboard/schedule')
  redirect('/dashboard/schedule')
}