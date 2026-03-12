'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// 1. DELETE APPOINTMENT
export async function deleteAppointment(appointmentId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('appointments').delete().eq('id', appointmentId)

  if (error) {
    console.error('Delete Error:', error)
    throw new Error('Failed to delete appointment')
  }

  revalidatePath('/dashboard/schedule')
}

// 2. UPDATE APPOINTMENT (Logistics)
export async function updateAppointment(appointmentId: string, formData: FormData) {
  const supabase = await createClient()

  const date = formData.get('date') as string
  const rawStartTime = formData.get('startTime') as string
  const status = formData.get('status') as string

  // Calculate End Time (1 hour later)
  const startTime = `${rawStartTime}:00`
  const [hours, minutes] = rawStartTime.split(':').map(Number)
  const endDate = new Date()
  endDate.setHours(hours + 1)
  endDate.setMinutes(minutes)
  
  const endHours = endDate.getHours().toString().padStart(2, '0')
  const endMinutes = endDate.getMinutes().toString().padStart(2, '0')
  const endTime = `${endHours}:${endMinutes}:00`

  const { error } = await supabase
    .from('appointments')
    .update({
      date,
      start_time: startTime,
      end_time: endTime,
      status: status
    })
    .eq('id', appointmentId)

  if (error) {
    console.error('Update Error:', error)
    throw new Error('Failed to update appointment')
  }

  revalidatePath('/dashboard/schedule')
}

// 3. GET THERAPIST'S SCHEDULE (For Dashboard)
export async function getTherapistSchedule() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('appointments')
    .select('*')
    .eq('therapist_id', user.id)
    .gte('date', today) // Today + Future
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })

  return data || []
}

// 4. GET CLINICAL NOTE (For Workspace)
export async function getClinicalNote(appointmentId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('clinical_notes')
    .select('*')
    .eq('appointment_id', appointmentId)
    .single()
  return data
}

// 5. GET PREVIOUS NOTE (Context)
// 5. GET PREVIOUS NOTE (Context - Smart History)
// Now accepts 'currentAppointmentId' to exclude the session we are currently inside
export async function getPreviousSessionNote(patientId: string, currentAppointmentDate: string, currentAppointmentId: string) {
  const supabase = await createClient()
  
  // Find the most recent COMPLETED appointment.
  const { data: lastAppt } = await supabase
    .from('appointments')
    .select('id')
    .eq('patient_id', patientId)
    .neq('id', currentAppointmentId) // <--- CRITICAL: Ignore the current session (prevents self-referencing)
    .lte('date', currentAppointmentDate) // Finds Today (earlier) OR Past
    .eq('status', 'completed')
    .order('date', { ascending: false })      // Newest date first
    .order('start_time', { ascending: false }) // Newest time first
    .limit(1)
    .single()

  if (!lastAppt) return null

  // Fetch the Plan
  const { data: note } = await supabase
    .from('clinical_notes')
    .select('content, session_plan')
    .eq('appointment_id', lastAppt.id)
    .single()

  if (!note) return null
  
  // Return the Plan (Priority) or Content (Fallback)
  return note.session_plan || note.content
}


// 6. GET ACTIVITY LIBRARY
export async function getActivityLibrary() {
  const supabase = await createClient()
  const { data } = await supabase.from('activity_library').select('*')
  return data || []
}

// 7. COMPLETE SESSION (The Big Save)
// 7. COMPLETE SESSION (Debug Version)
// 7. COMPLETE SESSION (Debug Version - Updated with Session Plan)
export async function completeSession(formData: FormData) {
  const supabase = await createClient()
  
  const appointmentId = formData.get('appointmentId') as string
  const noteContent = formData.get('noteContent') as string
  const sessionPlan = formData.get('sessionPlan') as string // <--- NEW: Get the plan
  const activityId = formData.get('activityId') as string
  const activityNote = formData.get('activityNote') as string
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error("❌ Error: No user logged in")
    throw new Error("Unauthorized")
  }

  // 1. Get Patient ID
  const { data: appt, error: fetchError } = await supabase
    .from('appointments')
    .select('patient_id')
    .eq('id', appointmentId)
    .single()
    
  if (fetchError || !appt) {
    console.error("❌ Error fetching appointment:", fetchError)
    throw new Error("Appointment not found")
  }

  // 2. Save Clinical Note (Now includes session_plan)
  console.log("📝 Attempting to save note for:", appt.patient_id)
  
  const { error: noteError } = await supabase.from('clinical_notes').upsert({
    appointment_id: appointmentId,
    patient_id: appt.patient_id,
    therapist_id: user.id,
    content: noteContent,
    session_plan: sessionPlan // <--- NEW: Save the plan to DB
  }, { onConflict: 'appointment_id' })

  if (noteError) {
    console.error("❌ DATABASE REFUSED NOTE:", noteError)
    throw new Error("Failed to save note: " + noteError.message)
  } else {
    console.log("✅ Note saved successfully!")
  }

  // 3. Save Activity
  if (activityId) {
    const { error: actError } = await supabase.from('assigned_activities').insert({
      appointment_id: appointmentId,
      activity_id: activityId,
      custom_note: activityNote
    })
    if (actError) console.error("❌ Activity Error:", actError)
  }

  // 4. Mark Completed
  const { error: statusError } = await supabase.from('appointments')
    .update({ status: 'completed' })
    .eq('id', appointmentId)
    
  if (statusError) console.error("❌ Status Update Error:", statusError)

  revalidatePath('/dashboard')
}

// 8. GET APPOINTMENT DETAILS (Helper for Workspace Header)
// <--- THIS WAS MISSING
// 8. GET APPOINTMENT DETAILS (Updated for Lock & Header)
export async function getAppointmentDetails(appointmentId: string) {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('appointments')
    .select('id, patient_id, patient_name, date, start_time, status') // <--- ADDED: status, date, start_time
    .eq('id', appointmentId)
    .single()
    
  return data
}

// 9. GET FULL PATIENT HISTORY
export async function getPatientHistory(patientId: string) {
  const supabase = await createClient()
  
  // Fetch all COMPLETED appointments for this patient
  const { data } = await supabase
    .from('appointments')
    .select(`
      id,
      date,
      start_time,
      status,
      therapist:profiles(full_name),
      clinical_notes(content, session_plan),
      assigned_activities(
        custom_note,
        activity:activity_library(title, category)
      )
    `)
    .eq('patient_id', patientId)
    .eq('status', 'completed')
    .order('date', { ascending: false }) // Newest first

  return data || []
}

// ... existing imports ...

// 10. GET ADMIN MASTER SCHEDULE (All Therapists)
export async function getAdminSchedule() {
  const supabase = await createClient()
  
  // Fetch ALL appointments + Join with Profiles to get Therapist Name
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      therapist:therapist_id ( full_name )
    `)
    //.neq('status', 'cancelled') // Optional: Hide cancelled?
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Admin Schedule Error:', error)
    return []
  }
  
  return data
}


// ... existing imports ...

// 11. GET THERAPISTS LIST (For Dropdowns)
export async function getTherapistsList() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('role', ['therapist', 'doctor']) // specific roles
  return data || []
}

// 12. UPDATE APPOINTMENT (Admin Override)
// ... (keep getTherapistsList as is)

// 11. UPDATE APPOINTMENT (Admin Override)
// RENAME THIS FUNCTION 👇
export async function adminUpdateAppointment(formData: FormData) { 
  const supabase = await createClient()
  const id = formData.get('id') as string

  // ... (rest of the code is the same)
  const payload = {
    date: formData.get('date'),
    start_time: formData.get('start_time'),
    therapist_id: formData.get('therapist_id'),
    status: formData.get('status')
  }

  const { error } = await supabase
    .from('appointments')
    .update(payload)
    .eq('id', id)

  if (error) {
    throw new Error('Failed to update appointment')
  }

  revalidatePath('/dashboard/schedule')
}