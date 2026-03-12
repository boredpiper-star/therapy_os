import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import PatientProfileForm from "./PatientProfileForm"
import SessionHistory from "./SessionHistory"

type Props = {
  params: Promise<{ id: string }>
}

export default async function PatientPage({ params }: Props) {
  const supabase = await createClient()
  const { id } = await params

  // 1. Fetch Patient
  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single()

  if (!patient) notFound()

  // 2. Fetch Session History
  const { data: sessions } = await supabase
    .from('appointments')
    .select(`
      *,
      therapist:therapist_id ( full_name ),
      clinical_notes ( content )
    `)
    .eq('patient_id', id)
    .order('date', { ascending: false })

  return (
    <div className="max-w-[1600px] mx-auto p-6">
       <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

          {/* LEFT: PATIENT PROFILE (Wide Focus Area) */}
          <div className="xl:col-span-8 space-y-6">
             <PatientProfileForm patient={patient} />
          </div>

          {/* RIGHT: SESSION HISTORY (Sidebar Context) */}
          {/* 'sticky top-6' keeps it visible while you scroll down the profile */}
          <div className="xl:col-span-4 space-y-6 sticky top-6">
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b bg-slate-50/50">
                    <h3 className="font-bold text-slate-800">Session History</h3>
                    <p className="text-xs text-slate-500">Past clinical notes & appointments</p>
                </div>
                <div className="p-4 bg-slate-50/30 max-h-[85vh] overflow-y-auto">
                    <SessionHistory sessions={sessions || []} />
                </div>
             </div>
          </div>

       </div>
    </div>
  )
}