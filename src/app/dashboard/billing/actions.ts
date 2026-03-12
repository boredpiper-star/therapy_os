'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { endOfMonth, startOfMonth, parse } from "date-fns"

// 1. Get Patients for the Dropdown
export async function getBillingPatients() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('patients')
    .select('id, full_name, display_id')
    .order('full_name')
  return data || []
}

// 2. Preview Sessions (Counts completed sessions for a specific month)
export async function previewInvoice(patientId: string, month: number, year: number) {
  const supabase = await createClient()
  
  // Calculate the first and last day of the selected month
  const dateStr = `${year}-${month.toString().padStart(2, '0')}-01`
  const startDate = startOfMonth(parse(dateStr, 'yyyy-MM-dd', new Date())).toISOString().split('T')[0]
  const endDate = endOfMonth(parse(dateStr, 'yyyy-MM-dd', new Date())).toISOString().split('T')[0]

  const { data: sessions } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_id', patientId)
    .eq('status', 'completed')
    .gte('date', startDate)
    .lte('date', endDate)

  return sessions || []
}

// 3. Generate and Save the Invoice
export async function createInvoice(formData: FormData) {
  const supabase = await createClient()
  
  const patient_id = formData.get('patient_id') as string
  const month = parseInt(formData.get('month') as string)
  const year = parseInt(formData.get('year') as string)
  const session_count = parseInt(formData.get('session_count') as string)
  const rate_per_session = parseFloat(formData.get('rate') as string)
  
  const total_amount = session_count * rate_per_session

  const { data, error } = await supabase
    .from('invoices')
    .insert([{
      patient_id,
      billing_month: month,
      billing_year: year,
      session_count,
      rate_per_session,
      total_amount,
      status: 'PAID'
    }])
    .select()
    .single()

  if (error) {
    console.error("Invoice Error:", error)
    throw new Error("Failed to generate invoice")
  }

  revalidatePath('/dashboard/billing')
  return data.id // Return the ID so we can redirect to the printable page!
}

// 4. Get History for the Dashboard Table
export async function getInvoices() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('invoices')
    .select(`
      *,
      patient:patient_id ( full_name, display_id )
    `)
    .order('created_at', { ascending: false })
  return data || []
}