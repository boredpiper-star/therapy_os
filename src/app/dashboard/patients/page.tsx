import { createClient } from "@/utils/supabase/server"
import PatientList from "./PatientList"
import { Sparkles } from "lucide-react" // Import only what's needed for the empty check fallback if desired

export default async function PatientsPage() {
  const supabase = await createClient()

  // 1. Fetch Patients (Ordered by newest)
  const { data: patients, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error loading patients:", error)
    return <div>Error loading patients database.</div>
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <PatientList patients={patients || []} />
    </div>
  )
}