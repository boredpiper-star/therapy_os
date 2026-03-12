'use server'

import { createClient } from "@/utils/supabase/server"

export async function searchPatients(query: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('patients') 
    .select('id, full_name, display_id')
    .ilike('full_name', `%${query}%`)
    .limit(5)
  return data || []
}

export async function createManualInvoice(data: any) {
  const supabase = await createClient()
  
  const year = new Date().getFullYear().toString().slice(-2)
  const prefix = `INV-M${year}`

  const { data: lastInvoice } = await supabase
    .from('manual_invoices')
    .select('invoice_number')
    .like('invoice_number', `${prefix}%`)
    .order('invoice_number', { ascending: false })
    .limit(1)
    .maybeSingle() 

  let nextNum = 1000
  if (lastInvoice && lastInvoice.invoice_number) {
    const lastNumStr = lastInvoice.invoice_number.replace(prefix, '')
    const lastNum = parseInt(lastNumStr, 10)
    if (!isNaN(lastNum)) nextNum = lastNum + 1
  }

  const invNum = `${prefix}${nextNum}`

  const { data: invoice, error } = await supabase
    .from('manual_invoices')
    .insert({
      patient_id: data.patient_id,
      billing_month: data.billing_month,
      billing_year: data.billing_year,
      issue_date: data.issue_date, // <-- NOW SAVING CUSTOM ISSUE DATE
      total_amount: data.total_amount,
      manual_items: data.manual_items,
      invoice_number: invNum,
      status: 'PAID'
    })
    .select()
    .single()

  if (error) {
    console.error("Database Insert Error:", error)
    throw new Error(error.message)
  }
  
  return invoice.id 
}