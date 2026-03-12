'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { format, isSameDay, parseISO, isTomorrow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PlayCircle, Clock, Calendar as CalendarIcon, CheckCircle, Users } from "lucide-react"
// Make sure this file exists, or the import will fail
import ActiveSessionWorkspace from "./ActiveSessionWorkspace"

type Appointment = {
  id: string
  status: string
  type: string | null
  date: string
  start_time: string
  patient: { id: string; full_name: string } | null
}

export default function TherapistDashboard({ userId, userName }: { userId: string, userName: string }) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [workspaceOpen, setWorkspaceOpen] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  
  const supabase = createClient()

  // 1. DATA FETCHING (The Engine)
  useEffect(() => {
    async function fetchMySchedule() {
      const { data } = await supabase
        .from('appointments')
        .select(`
            id, status, type, date, start_time, 
            patient:patient_id(id, full_name)
        `)
        .eq('therapist_id', userId)
        .gte('date', new Date().toISOString().split('T')[0]) // Upcoming only
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })

      setAppointments((data as any) || [])
      setLoading(false)
    }
    fetchMySchedule()
  }, [userId])

  function openWorkspace(id: string) {
    setSelectedSessionId(id)
    setWorkspaceOpen(true)
  }

  // 2. THE LOGIC (The Brains)
  // Filter out work that is already done.
  const pendingAppointments = appointments.filter(
    (a) => a.status !== 'completed' && a.status !== 'cancelled' && a.status !== 'no-show'
  )

  // "Active" is the first PENDING appointment
  const activeSession = pendingAppointments[0]
  
  // "Future" is everything after that
  const futureSessions = pendingAppointments.slice(1)

  // Group the rest by Date
  const groupedAppointments = futureSessions.reduce((groups, appt) => {
    const date = appt.date
    if (!groups[date]) groups[date] = []
    groups[date].push(appt)
    return groups
  }, {} as Record<string, Appointment[]>)

  function getDateLabel(dateStr: string) {
    const date = parseISO(dateStr)
    const today = new Date()
    if (isSameDay(date, today)) return "Rest of Today"
    if (isTomorrow(date)) return `Tomorrow, ${format(date, 'MMM do')}`
    return format(date, 'EEEE, MMMM do')
  }

  if (loading) return <div className="p-10 text-slate-400">Loading your schedule...</div>

  // 3. THE UI (The Look)
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">My Schedule</h2>
          <p className="text-muted-foreground">
             Hello {userName}, you have {pendingAppointments.length} sessions left to do.
          </p>
        </div>
      </div>

      {/* === UP NEXT CARD === */}
      {activeSession ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm uppercase tracking-wide">
             <PlayCircle className="w-4 h-4" /> Up Next 
             <span className="text-slate-400">|</span> 
             {isSameDay(parseISO(activeSession.date), new Date()) ? "Today" : format(parseISO(activeSession.date), 'EEEE')}
          </div>
          
          <Card className="border-l-4 border-l-blue-600 shadow-md bg-white animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardContent className="p-8 grid md:grid-cols-2 gap-6 items-center">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="outline" className="px-3 py-1 bg-slate-100 text-slate-700 border-slate-200">
                    {activeSession.status}
                  </Badge>
                  <span className="text-slate-300">|</span>
                  <div className="flex items-center gap-2 text-slate-600 font-medium text-lg">
                    <Clock className="w-5 h-5" />
                    {activeSession.start_time.slice(0,5)}
                  </div>
                </div>
                <h1 className="text-4xl font-bold text-slate-900">
                    {activeSession.patient?.full_name || "Unknown Patient"}
                </h1>
                <p className="text-lg text-slate-500 mt-2">{activeSession.type || "Therapy Session"}</p>
              </div>

              <div className="flex justify-end">
                <Button 
                  size="lg" 
                  className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-100"
                  onClick={() => openWorkspace(activeSession.id)}
                >
                  Open Workspace
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="p-12 border-2 border-dashed rounded-xl text-center text-slate-400 bg-slate-50 flex flex-col items-center gap-4">
          <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">All Caught Up!</h3>
            <p className="text-slate-500">No pending appointments scheduled.</p>
          </div>
        </div>
      )}

      {/* === THE LIST (Rest of Today + Future) === */}
      {Object.keys(groupedAppointments).length > 0 && (
        <div className="space-y-8 pt-6">
          {Object.entries(groupedAppointments).map(([date, dayAppts]) => (
            <div key={date} className="space-y-4">
              
              <div className="sticky top-0 bg-white/95 backdrop-blur py-3 border-b z-10 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-slate-500" />
                <h3 className="text-lg font-bold text-slate-800">
                  {getDateLabel(date)}
                </h3>
                <Badge variant="secondary" className="ml-2 bg-slate-100 text-slate-600">{dayAppts.length}</Badge>
              </div>

              <div className="grid gap-3">
                {dayAppts.map((appt) => (
                  <Card key={appt.id} className="hover:border-blue-300 transition-all cursor-pointer group" onClick={() => openWorkspace(appt.id)}>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center justify-center bg-slate-50 group-hover:bg-blue-50 w-20 h-14 rounded-md border text-slate-700 transition-colors">
                            <span className="font-bold text-lg leading-none">{appt.start_time.slice(0,5)}</span>
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-lg">{appt.patient?.full_name || "Unknown"}</p>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span>{appt.type || 'Standard Session'}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-slate-400 border-slate-200">
                          {appt.status}
                        </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ensure ActiveSessionWorkspace is created or this will error */}
      {workspaceOpen && (
          <ActiveSessionWorkspace 
            sessionId={selectedSessionId} 
            isOpen={workspaceOpen} 
            onClose={() => setWorkspaceOpen(false)} 
          />
      )}
    </div>
  )
}