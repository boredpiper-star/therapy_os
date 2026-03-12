'use client'

import { useState, useMemo } from "react"
import { format, isSameDay, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from "date-fns"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, User, Clock, Calendar as CalIcon, Users } from "lucide-react"
import AppointmentEditSheet from "./AppointmentEditSheet"

export default function AdminCalendar({ appointments }: { appointments: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // Filter States
  const [selectedTherapistId, setSelectedTherapistId] = useState<string>("all")
  const [selectedPatientId, setSelectedPatientId] = useState<string>("all") 
  
  // State for the Modal
  const [selectedAppt, setSelectedAppt] = useState<any>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // Calendar Helpers
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }) 
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]

  // --- 1. EXTRACT UNIQUE LISTS ---
  const uniqueTherapists = useMemo(() => {
    const map = new Map()
    appointments.forEach(a => {
      if (a.therapist && a.therapist.full_name) {
        map.set(a.therapist_id, a.therapist.full_name)
      }
    })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [appointments])

  const uniquePatients = useMemo(() => {
    const map = new Map()
    appointments.forEach(a => {
      if (a.patient_id && a.patient_name) {
        map.set(a.patient_id, a.patient_name)
      }
    })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [appointments])

  // --- 2. FILTER LOGIC ---
  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      const matchesTherapist = selectedTherapistId === "all" || a.therapist_id === selectedTherapistId
      const matchesPatient = selectedPatientId === "all" || a.patient_id === selectedPatientId
      return matchesTherapist && matchesPatient
    })
  }, [appointments, selectedTherapistId, selectedPatientId])

  const weekAppointments = filteredAppointments.filter(appt => {
    const d = parseISO(appt.date)
    return d >= weekStart && d <= weekEnd
  })

  // Navigation
  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1))
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1))
  const resetToday = () => setCurrentDate(new Date())

  function handleApptClick(appt: any) {
    setSelectedAppt(appt)
    setIsSheetOpen(true)
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-300'
      case 'cancelled': return 'bg-slate-100 text-slate-600 border-slate-300'
      case 'no-show': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-blue-100 text-blue-800 border-blue-300' // FALLBACK
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-slate-100 rounded-md p-0.5 border border-slate-200">
                <Button variant="ghost" size="sm" onClick={prevWeek} className="h-7 w-7 p-0 hover:bg-white"><ChevronLeft className="w-4 h-4 text-slate-600"/></Button>
                <div className="h-4 w-[1px] bg-slate-300 mx-1"></div>
                <Button variant="ghost" size="sm" onClick={nextWeek} className="h-7 w-7 p-0 hover:bg-white"><ChevronRight className="w-4 h-4 text-slate-600"/></Button>
            </div>
            
            <div className="flex flex-col">
                <span className="text-lg font-bold text-slate-900 leading-none">
                {format(weekStart, 'MMMM yyyy')}
                </span>
                <span className="text-xs text-slate-500 font-medium mt-0.5">
                Week of {format(weekStart, 'MMM do')}
                </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="w-[180px]">
               <Select value={selectedTherapistId} onValueChange={setSelectedTherapistId}>
                 <SelectTrigger className="h-8 text-xs bg-slate-50 border-slate-200">
                    <div className="flex items-center gap-2 text-slate-600">
                       <User className="w-3 h-3"/>
                       <SelectValue placeholder="All Therapists" />
                    </div>
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">All Therapists</SelectItem>
                   {uniqueTherapists.map(t => (
                     <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>

             <div className="w-[180px]">
               <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                 <SelectTrigger className="h-8 text-xs bg-slate-50 border-slate-200">
                    <div className="flex items-center gap-2 text-slate-600">
                       <Users className="w-3 h-3"/>
                       <SelectValue placeholder="All Patients" />
                    </div>
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">All Patients</SelectItem>
                   {uniquePatients.map(p => (
                     <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>

             <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>

             <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
               <CalIcon className="w-3.5 h-3.5 text-slate-400" />
               <span className="text-xs text-slate-600 font-semibold">
                 {weekAppointments.length} <span className="font-normal text-slate-400">Sessions</span>
               </span>
             </div>
             <Button variant="outline" size="sm" onClick={resetToday} className="text-xs h-8">Jump to Today</Button>
          </div>
      </div>

      {/* GRID CONTAINER */}
      <div className="flex-1 overflow-auto relative bg-white">
        <div className="grid grid-cols-8 min-w-[1000px] border-b border-slate-200">
          
          {/* Top Left Empty Cell */}
          <div className="col-span-1 bg-white border-b border-r border-slate-200 sticky top-0 z-30 h-14"></div> 
          
          {/* Day Headers */}
          {weekDays.map((day) => {
              const isToday = isSameDay(day, new Date())
              return (
                <div 
                    key={day.toString()} 
                    className={`col-span-1 p-2 text-center border-b border-r border-slate-200 sticky top-0 z-30 h-14 flex flex-col justify-center transition-colors
                        ${isToday ? 'bg-slate-100 border-b-blue-500' : 'bg-white'}`} 
                >
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? 'text-blue-700' : 'text-slate-400'}`}>
                        {format(day, 'EEE')}
                    </div>
                    <div className={`text-xl font-bold leading-none mt-0.5 ${isToday ? 'text-blue-700' : 'text-slate-700'}`}>
                        {format(day, 'd')}
                    </div>
                </div>
              )
          })}

          {/* Time Slots */}
          {hours.map((hour) => (
            <div key={hour} className="contents group">
              {/* Time Column (Left) */}
              <div className="col-span-1 border-r border-b border-slate-200 bg-white sticky left-0 z-20">
                  <div className="h-[120px] relative">
                      <span className="absolute -top-2.5 right-3 text-xs font-medium text-slate-400 bg-white px-1">
                          {hour}:00
                      </span>
                  </div>
              </div>

              {/* Day Cells */}
              {weekDays.map((day) => {
                const isToday = isSameDay(day, new Date())
                const slots = weekAppointments.filter(appt => {
                  const d = parseISO(appt.date)
                  const h = parseInt(appt.start_time.split(':')[0])
                  return isSameDay(d, day) && h === hour
                })

                return (
                  <div 
                    key={`${day}-${hour}`} 
                    className={`col-span-1 border-b border-r border-slate-200 h-[120px] relative p-1 transition-colors
                        ${isToday ? 'bg-slate-50/50' : 'bg-white'} 
                        hover:bg-slate-50`}
                  >
                    {/* Horizontal Dashed Line */}
                    <div className={`absolute top-1/2 left-0 right-0 border-t border-dashed pointer-events-none w-full ${isToday ? 'border-slate-300' : 'border-slate-100'}`}></div>

                    <div className="flex gap-1 h-full w-full overflow-x-auto relative z-10 no-scrollbar">
                      {slots.map((appt) => (
                        <div 
                          key={appt.id}
                          onClick={() => handleApptClick(appt)}
                          className={`flex-1 min-w-[130px] rounded-md border shadow-sm transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer flex flex-col justify-between p-2.5
                            ${appt.status === 'completed' 
                                ? 'bg-green-50 border-green-200 border-l-4 border-l-green-500 text-green-900' 
                                : appt.status === 'cancelled' 
                                    ? 'bg-slate-50 border-slate-200 opacity-60 grayscale-[0.5]' 
                                    : 'bg-blue-100 border-blue-200 border-l-4 border-l-blue-600 text-blue-900 shadow-blue-100/50' 
                              }`}
                        >
                          <div>
                            <div className="flex justify-between items-start mb-0.5">
                               <p className={`text-sm font-bold truncate leading-tight ${appt.status === 'cancelled' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                                   {appt.patient_name}
                               </p>
                            </div>
                            
                            <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium opacity-80">
                               <User className="w-3 h-3" />
                               <span className="truncate">{appt.therapist?.full_name || 'Unknown'}</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-black/5">
                             <div className="flex items-center gap-1 text-[10px] font-bold opacity-70 font-mono bg-white/40 px-1.5 py-0.5 rounded">
                               <Clock className="w-3 h-3" />
                               <span>{appt.start_time.slice(0,5)}</span>
                             </div>

                             {appt.status !== 'scheduled' && (
                               <span className={`px-1.5 py-0.5 rounded-[3px] text-[9px] font-bold uppercase tracking-wider bg-white/50 border border-black/5`}>
                                 {appt.status}
                               </span>
                             )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <AppointmentEditSheet 
        appointment={selectedAppt} 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)} 
      />
    </div>
  )
}