'use client'

import { useState } from "react"
import { format, isSameDay, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from "date-fns"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import ActiveSessionWorkspace from "../ActiveSessionWorkspace"

export default function TherapistCalendar({ appointments }: { appointments: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [workspaceOpen, setWorkspaceOpen] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  // Calendar Helpers
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }) 
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] // 8am - 6pm

  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1))
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1))
  const resetToday = () => setCurrentDate(new Date())

  // Filter appointments for the visible week
  const weekAppointments = appointments.filter(appt => {
    const d = parseISO(appt.date)
    return d >= weekStart && d <= weekEnd
  })

  function openWorkspace(id: string) {
    setSelectedSessionId(id)
    setWorkspaceOpen(true)
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      
      {/* 1. Header Controls */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={prevWeek}><ChevronLeft className="w-4 h-4"/></Button>
            <Button variant="outline" size="sm" onClick={nextWeek}><ChevronRight className="w-4 h-4"/></Button>
            <span className="text-xl font-bold text-slate-800 ml-3">
              {format(weekStart, 'MMMM yyyy')}
            </span>
            <span className="text-sm text-slate-500 font-medium">
              (Week of {format(weekStart, 'MMM do')})
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={resetToday}>Jump to Today</Button>
      </div>

      {/* 2. Scrollable Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-8 min-w-[1000px] border-b border-slate-200">
          
          {/* Header Row (Days) */}
          <div className="col-span-1 bg-white border-b border-r border-slate-200 sticky top-0 z-20"></div> 
          {weekDays.map((day) => {
              const isToday = isSameDay(day, new Date())
              return (
                <div key={day.toString()} className={`col-span-1 p-3 text-center border-b border-r border-slate-200 sticky top-0 z-20 ${isToday ? 'bg-slate-100 border-b-blue-500' : 'bg-white'}`}>
                    <div className={`text-xs font-semibold uppercase ${isToday ? 'text-blue-700' : 'text-slate-400'}`}>{format(day, 'EEE')}</div>
                    <div className={`text-xl font-bold ${isToday ? 'text-blue-700' : 'text-slate-700'}`}>
                    {format(day, 'd')}
                    </div>
                </div>
              )
          })}

          {/* Time Slots */}
          {hours.map((hour) => (
            <div key={hour} className="contents group">
              {/* Time Label */}
              <div className="col-span-1 p-2 text-right text-xs text-slate-400 font-medium border-b border-r border-slate-200 h-[100px] relative">
                  <span className="-top-3 relative bg-white px-1">{hour}:00</span>
              </div>

              {/* Day Columns */}
              {weekDays.map((day) => {
                const isToday = isSameDay(day, new Date())
                const appointment = weekAppointments.find(appt => {
                  const d = parseISO(appt.date)
                  const h = parseInt(appt.start_time.split(':')[0])
                  return isSameDay(d, day) && h === hour
                })

                return (
                  <div 
                    key={`${day}-${hour}`} 
                    className={`col-span-1 border-b border-r border-slate-200 relative h-[100px] transition-colors
                        ${isToday ? 'bg-slate-50/50' : 'bg-white'} 
                        hover:bg-slate-50/50`}
                  >
                    {/* Horizontal Dashed Line */}
                    <div className={`absolute top-1/2 left-0 right-0 border-t border-dashed pointer-events-none w-full ${isToday ? 'border-slate-300' : 'border-slate-100'}`}></div>

                    {appointment && (
                      <div 
                        onClick={() => openWorkspace(appointment.id)}
                        className={`absolute inset-x-1 top-1 bottom-1 rounded-md p-2 text-xs cursor-pointer border shadow-sm transition-all hover:scale-[1.02] overflow-hidden z-10
                          ${appointment.status === 'completed' 
                              ? 'bg-green-50 border-green-200 border-l-4 border-l-green-500 text-green-900' 
                              : 'bg-blue-100 border-blue-200 border-l-4 border-l-blue-600 text-blue-900 shadow-blue-100/50'
                            }`}
                      >
                        <p className="font-bold truncate text-sm">{appointment.patient_name}</p>
                        <p className="opacity-80 font-medium mt-0.5">{appointment.start_time.slice(0,5)}</p>
                        {appointment.status === 'completed' && <span className="text-[10px] uppercase font-bold bg-white/50 px-1 rounded mt-1.5 inline-block border border-black/5">Done</span>}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <ActiveSessionWorkspace 
        sessionId={selectedSessionId} 
        isOpen={workspaceOpen} 
        onClose={() => setWorkspaceOpen(false)} 
      />
    </div>
  )
}