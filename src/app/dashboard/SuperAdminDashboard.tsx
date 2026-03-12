'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Wallet, AlertCircle, Banknote, UserMinus, XCircle, Phone } from "lucide-react"
import { startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, isWithinInterval, parseISO, isPast, isFuture, subDays, format } from "date-fns"

const SESSION_RATE = 700 
const WORK_HOURS_PER_DAY = 8 

type Appointment = {
  id: string
  status: string
  type: string | null
  date: string
  start_time: string
  therapist: { id: string; full_name: string } | null
  patient: { id: string; full_name: string } | null
}

type Therapist = {
  id: string
  full_name: string
}

export default function SuperAdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchAdminData() {
      // 1. Fetch ALL Appointments
      const { data: allAppts } = await supabase
        .from('appointments')
        .select(`
            id, status, type, date, start_time, 
            therapist:therapist_id(id, full_name),
            patient:patient_id(id, full_name)
        `)
        .order('date', { ascending: false })
      
      setAppointments((allAppts as any) || [])

      // 2. Fetch Therapists
      const { data: therapistList } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('role', ['therapist', 'doctor'])
      
      setTherapists(therapistList || [])
      setLoading(false)
    }
    fetchAdminData()
  }, [])

  if (loading) return <div className="p-10 text-slate-400">Loading Command Center...</div>

  // --- LOGIC ENGINE ---
  const today = new Date()
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)
  
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const workingDaysCount = daysInMonth.filter(day => !isWeekend(day)).length
  
  const totalCapacityHours = therapists.length * workingDaysCount * WORK_HOURS_PER_DAY
  const totalPotentialRevenue = totalCapacityHours * SESSION_RATE

  const monthAppts = appointments.filter(a => isWithinInterval(parseISO(a.date), { start: monthStart, end: monthEnd }))
  const completedAppts = monthAppts.filter(a => a.status === 'completed')
  const scheduledAppts = monthAppts.filter(a => a.status === 'scheduled')
  
  const realizedRevenue = completedAppts.length * SESSION_RATE
  const projectedRevenue = scheduledAppts.length * SESSION_RATE
  const totalForecast = realizedRevenue + projectedRevenue

  // Utilization Data
  const utilizationData = therapists.map(t => {
     const therapistAppts = monthAppts.filter(a => a.therapist?.id === t.id && (a.status === 'completed' || a.status === 'scheduled'))
     const bookedHours = therapistAppts.length 
     const maxHours = workingDaysCount * WORK_HOURS_PER_DAY
     return {
        name: t.full_name,
        booked: bookedHours,
        available: Math.max(0, maxHours - bookedHours), 
     }
  }).sort((a,b) => b.booked - a.booked)

  // Ghost Hour Data
  const timeSlotStats: Record<string, { total: number, cancelled: number }> = {}
  appointments.forEach(a => {
      const hour = a.start_time.slice(0, 2) + ":00"
      if (!timeSlotStats[hour]) timeSlotStats[hour] = { total: 0, cancelled: 0 }
      timeSlotStats[hour].total += 1
      if (a.status === 'cancelled' || a.status === 'no-show') {
          timeSlotStats[hour].cancelled += 1
      }
  })
  const ghostHourData = Object.keys(timeSlotStats).map(time => ({
      time,
      cancellations: timeSlotStats[time].cancelled,
  })).sort((a, b) => parseInt(a.time) - parseInt(b.time))

  // Retention Data
  const patientStatus: Record<string, { lastVisit: Date | null, hasFuture: boolean, name: string }> = {}
  appointments.forEach(a => {
      if (!a.patient) return
      const pid = a.patient.id
      if (!patientStatus[pid]) patientStatus[pid] = { lastVisit: null, hasFuture: false, name: a.patient.full_name }
      const apptDate = parseISO(a.date)
      if (isFuture(apptDate) && a.status === 'scheduled') patientStatus[pid].hasFuture = true
      if (a.status === 'completed' && isPast(apptDate)) {
          if (!patientStatus[pid].lastVisit || apptDate > patientStatus[pid].lastVisit!) patientStatus[pid].lastVisit = apptDate
      }
  })
  const riskThresholdDate = subDays(new Date(), 30)
  const atRiskPatients = Object.values(patientStatus).filter(p => {
      return p.lastVisit && p.lastVisit < riskThresholdDate && !p.hasFuture
  }).slice(0, 5)

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Command Center</h1>
            <p className="text-slate-500">Business Intelligence Dashboard</p>
          </div>
      </div>

      {/* HEADER CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="border-l-4 border-l-green-500 shadow-sm bg-green-50/30">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-green-700 uppercase tracking-wider flex items-center gap-2"><Wallet className="w-4 h-4"/> Banked Revenue</CardTitle></CardHeader>
            <CardContent>
               <div className="text-2xl font-bold text-slate-900">₹{realizedRevenue.toLocaleString()}</div>
               <p className="text-xs text-slate-500 mt-1">From {completedAppts.length} completed sessions</p>
            </CardContent>
         </Card>
         <Card className="border-l-4 border-l-blue-500 shadow-sm bg-blue-50/30">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-2"><TrendingUp className="w-4 h-4"/> Forecast</CardTitle></CardHeader>
            <CardContent>
               <div className="text-2xl font-bold text-slate-900">₹{totalForecast.toLocaleString()}</div>
               <div className="flex items-center gap-2 mt-1"><span className="text-xs font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">+₹{projectedRevenue.toLocaleString()} pending</span></div>
            </CardContent>
         </Card>
         <Card className="border-l-4 border-l-amber-500 shadow-sm bg-amber-50/30">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-2"><AlertCircle className="w-4 h-4"/> Unsold Capacity</CardTitle></CardHeader>
            <CardContent>
               <div className="text-2xl font-bold text-slate-900">₹{(totalPotentialRevenue - totalForecast).toLocaleString()}</div>
               <p className="text-xs text-slate-500 mt-1">Value of empty slots this month</p>
            </CardContent>
         </Card>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="text-base font-bold text-slate-800">Therapist Utilization</CardTitle>
                <CardDescription>Booked Hours vs. Idle Time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={utilizationData} layout="vertical" margin={{ left: 0, right: 30 }} barSize={30}>
                     <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                     <Tooltip cursor={{fill: '#f8fafc'}} />
                     <Bar dataKey="booked" stackId="a" fill="#2563eb" radius={[0,0,0,0]} />
                     <Bar dataKey="available" stackId="a" fill="#e2e8f0" radius={[0, 4, 4, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </CardContent>
         </Card>
         <Card className="bg-slate-50 border-slate-200">
            <CardHeader>
               <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2"><Banknote className="w-5 h-5 text-green-600"/> Efficiency Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
               <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Clinic Efficiency</p>
                  <div className="flex items-end gap-2">
                     <span className="text-3xl font-bold text-slate-900">{Math.round((totalForecast / totalPotentialRevenue) * 100) || 0}%</span>
                     <span className="text-xs text-slate-500 mb-1">of total capacity sold</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                     <div className="bg-green-500 h-full rounded-full" style={{ width: `${Math.round((totalForecast / totalPotentialRevenue) * 100) || 0}%` }}></div>
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>

      {/* RISK ROW - RESTORED BOTH CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <Card>
            <CardHeader>
               <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2"><XCircle className="w-5 h-5 text-red-500"/> The "Ghost Hour" Heatmap</CardTitle>
               <CardDescription>Cancellations by Time of Day</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ghostHourData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                     <Tooltip />
                     <Bar dataKey="cancellations" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
               </ResponsiveContainer>
            </CardContent>
         </Card>

         {/* RESTORED RETENTION RADAR */}
         <Card>
            <CardHeader className="border-b bg-amber-50/40 pb-4">
               <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2"><UserMinus className="w-5 h-5 text-amber-600" /> Retention Radar</CardTitle>
                    <CardDescription>Patients inactive for 30+ days (At Risk)</CardDescription>
                  </div>
               </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-slate-100">
                  {atRiskPatients.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-sm">🎉 Great job! No active patients are at risk.</div>
                  ) : (
                      atRiskPatients.map((p, idx) => (
                         <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                               <div className="h-10 w-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center font-bold">{p.name.charAt(0)}</div>
                               <div><p className="font-bold text-slate-800 text-sm">{p.name}</p><p className="text-xs text-slate-500">Last seen: {p.lastVisit ? format(p.lastVisit, 'MMM d') : 'N/A'}</p></div>
                            </div>
                            <Button size="sm" variant="outline" className="text-xs h-8 border-amber-200 text-amber-700 hover:bg-amber-50"><Phone className="w-3 h-3 mr-2" /> Call</Button>
                         </div>
                      ))
                  )}
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  )
}