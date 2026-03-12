'use server'

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { addMinutes, format, parse } from "date-fns"

export async function createAppointment(formData: FormData) {
  const supabase = await createClient()

  // 1. Extract Data
  // We check for 'time' OR 'start_time' to be safe
  const rawStartTime = (formData.get('start_time') || formData.get('time')) as string
  const patientId = formData.get('patientId') as string
  const therapistId = formData.get('therapistId') as string
  const date = formData.get('date') as string
  const patientName = formData.get('patientName') as string

  // Validation
  if (!rawStartTime || !patientId || !therapistId || !date) {
    throw new Error("Missing required fields")
  }

  // 2. Calculate End Time (Start + 60 mins)
  // This prevents the "null value in column end_time" error
  const parsedTime = parse(rawStartTime, 'HH:mm', new Date())
  const endTime = format(addMinutes(parsedTime, 60), 'HH:mm')

  // 3. Insert into Database
  const { error } = await supabase.from('appointments').insert({
    patient_id: patientId,
    patient_name: patientName, // Make sure we save the name for the calendar card
    therapist_id: therapistId,
    date: date,
    start_time: rawStartTime,
    end_time: endTime, // <--- The Fix
    status: 'scheduled',
    type: 'Single'
  })

  if (error) {
    console.error('Create Appointment Error:', error)
    throw new Error('Failed to create appointment')
  }

  // 4. Redirect
  revalidatePath('/dashboard/schedule')
  redirect('/dashboard/schedule')
}