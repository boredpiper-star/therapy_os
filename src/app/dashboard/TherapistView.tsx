'use client'

import { format } from "date-fns"
import AppointmentCard from "./schedule/AppointmentCard" 

export default function TherapistView({ appointments }: { appointments: any[] }) {
  // Logic: Find the "Next Up"
  const activeSession = appointments.find(a => a.status === 'in-progress') 
    || appointments.find(a => a.status === 'checked-in')
    || appointments.find(a => a.status === 'scheduled')

  const otherSessions = appointments.filter(a => a.id !== activeSession?.id)

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Good Morning</h2>
          <p className="text-muted-foreground">Here is your focus for {format(new Date(), 'EEEE')}.</p>
        </div>
      </div>

      {/* 1. UP NEXT (Big Card) */}
      {activeSession ? (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Up Next / Active</p>
          <div className="transform scale-105 origin-left duration-200">
             {/* We use the AppointmentCard but it will look highlighted due to context */}
             <AppointmentCard appt={activeSession} />
          </div>
        </div>
      ) : (
        <div className="p-8 border-2 border-dashed rounded-xl text-center text-slate-400">
          You are all clear for now!
        </div>
      )}

      {/* 2. UPCOMING LIST */}
      {otherSessions.length > 0 && (
        <div className="space-y-4 pt-8">
          <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Later Today</h3>
          <div className="grid gap-4 opacity-80">
            {otherSessions.map((appt) => (
              <AppointmentCard key={appt.id} appt={appt} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}