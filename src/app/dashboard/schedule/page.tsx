import { getAdminSchedule } from "./actions"
import AdminCalendar from "./AdminCalendar"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function AdminSchedulePage() {
  // 1. Fetch the Master Schedule
  const masterSchedule = await getAdminSchedule()
  
  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Clinic Schedule</h2>
          <p className="text-slate-500">Master view of all therapist availability.</p>
        </div>
        <Link href="/dashboard/schedule/new">
          <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-md">
            <Plus className="w-4 h-4 mr-2" /> New Appointment
          </Button>
        </Link>
      </div>

      {/* CALENDAR VIEW */}
      <div className="flex-1">
        <AdminCalendar appointments={masterSchedule || []} />
      </div>
    </div>
  )
}