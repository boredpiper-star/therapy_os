import { getTherapistSchedule } from "../schedule/actions"
import TherapistCalendar from "./TherapistCalendar"

export default async function CalendarPage() {
  // 1. Fetch all appointments for the logged-in therapist
  const mySchedule = await getTherapistSchedule()
  
  // 2. Render the interactive calendar
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900">Weekly Schedule</h2>
      <TherapistCalendar appointments={mySchedule} />
    </div>
  )
}