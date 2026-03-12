'use client'

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog" 
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, FileText, CheckCircle, XCircle, AlertCircle, Eye } from "lucide-react"

// Helper for Status Colors
function getStatusStyles(status: string) {
  switch (status) {
    case 'completed': return "bg-green-100 text-green-700 border-green-200"
    case 'scheduled': return "bg-blue-100 text-blue-700 border-blue-200"
    case 'cancelled': return "bg-slate-100 text-slate-500 border-slate-200 line-through"
    case 'no-show': return "bg-red-100 text-red-700 border-red-200"
    default: return "bg-slate-100 text-slate-700 border-slate-200"
  }
}

export default function SessionHistory({ sessions }: { sessions: any[] }) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming')
  const [selectedSession, setSelectedSession] = useState<any>(null)

  // 1. Filter Logic
  const today = new Date().toISOString().split('T')[0]
  
  const upcoming = sessions.filter(s => 
    (s.status === 'scheduled' || s.status === 'confirmed') && s.date >= today
  )
  const completed = sessions.filter(s => 
    s.status === 'completed'
  )
  const cancelled = sessions.filter(s => 
    s.status === 'cancelled' || s.status === 'no-show'
  )

  const displayedSessions = activeTab === 'upcoming' ? upcoming 
                          : activeTab === 'completed' ? completed 
                          : cancelled

  return (
    <>
      <Card className="h-full flex flex-col">
        {/* HEADER & TABS */}
        <CardHeader className="border-b bg-slate-50/50 pb-0 pt-4 px-4">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="w-4 h-4 text-slate-500"/> Session History
            </CardTitle>
          </div>
          
          {/* Custom Tab Bar */}
          <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
             <button 
               onClick={() => setActiveTab('upcoming')}
               className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'upcoming' ? 'border-blue-600 text-blue-700' : 'border-transparent hover:text-slate-800'}`}
             >
               Upcoming <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded-full text-slate-600">{upcoming.length}</span>
             </button>
             <button 
               onClick={() => setActiveTab('completed')}
               className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'completed' ? 'border-green-600 text-green-700' : 'border-transparent hover:text-slate-800'}`}
             >
               Completed <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded-full text-slate-600">{completed.length}</span>
             </button>
             <button 
               onClick={() => setActiveTab('cancelled')}
               className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'cancelled' ? 'border-slate-600 text-slate-700' : 'border-transparent hover:text-slate-800'}`}
             >
               Cancelled <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded-full text-slate-600">{cancelled.length}</span>
             </button>
          </div>
        </CardHeader>

        {/* LIST CONTENT */}
        <CardContent className="p-0 flex-1 overflow-y-auto max-h-[500px]">
          <div className="divide-y divide-slate-100">
            {displayedSessions.length === 0 ? (
               <div className="p-8 text-center text-slate-400 text-sm">
                 No {activeTab} sessions found.
               </div>
            ) : (
               displayedSessions.map((session) => (
                 <div 
                   key={session.id} 
                   onClick={() => setSelectedSession(session)}
                   className="p-3 hover:bg-slate-50 transition-colors cursor-pointer group flex items-center gap-4"
                 >
                    {/* Compact Date Box */}
                    <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex flex-col items-center justify-center shadow-sm shrink-0">
                       <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">{format(parseISO(session.date), 'MMM')}</span>
                       <span className="text-lg font-bold text-slate-800 leading-none mt-0.5">{format(parseISO(session.date), 'd')}</span>
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="font-semibold text-slate-900 text-sm truncate">
                            {session.type || "Therapy Session"}
                          </h4>
                          <span className={`px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-wider border ${getStatusStyles(session.status)}`}>
                             {session.status}
                          </span>
                       </div>
                       <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {session.start_time.slice(0,5)}</span>
                          <span className="flex items-center gap-1 truncate"><User className="w-3 h-3"/> {session.therapist?.full_name || 'Unknown'}</span>
                       </div>
                    </div>

                    {/* Arrow/Action Icon */}
                    <div className="text-slate-300 group-hover:text-blue-500 transition-colors">
                       <Eye className="w-4 h-4" />
                    </div>
                 </div>
               ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* DETAILS MODAL */}
      {/* We use a simple fixed overlay if you don't have a specific Dialog component setup, 
          but usually shadcn/ui Dialog is standard. I'll use a basic logic here. */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <h3 className="font-bold text-lg text-slate-800">Session Details</h3>
                 <button onClick={() => setSelectedSession(null)} className="text-slate-400 hover:text-slate-600">
                   <XCircle className="w-6 h-6" />
                 </button>
              </div>
              
              <div className="p-6 space-y-6">
                 {/* Top Row: Status & Type */}
                 <div className="flex items-start justify-between">
                    <div>
                       <p className="text-sm text-slate-500">Session Type</p>
                       <p className="font-bold text-slate-900 text-lg">{selectedSession.type || "Therapy Session"}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide border ${getStatusStyles(selectedSession.status)}`}>
                       {selectedSession.status}
                    </span>
                 </div>

                 {/* Grid Details */}
                 <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div>
                       <p className="text-xs text-slate-500 uppercase font-bold mb-1">Date & Time</p>
                       <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <Calendar className="w-4 h-4 text-blue-500"/> 
                          {format(parseISO(selectedSession.date), 'PPP')}
                       </div>
                       <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mt-1">
                          <Clock className="w-4 h-4 text-blue-500"/> 
                          {selectedSession.start_time.slice(0,5)}
                       </div>
                    </div>
                    <div>
                       <p className="text-xs text-slate-500 uppercase font-bold mb-1">Therapist</p>
                       <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <User className="w-4 h-4 text-purple-500"/> 
                          {selectedSession.therapist?.full_name || "Unknown"}
                       </div>
                    </div>
                 </div>

                 {/* Clinical Note Section */}
                 <div>
                    <p className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                       <FileText className="w-4 h-4 text-slate-500"/> Clinical Note
                    </p>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-sm text-slate-600 leading-relaxed max-h-40 overflow-y-auto">
                       {selectedSession.clinical_notes?.[0]?.content ? (
                          selectedSession.clinical_notes[0].content
                       ) : (
                          <span className="italic text-slate-400">No clinical notes recorded for this session.</span>
                       )}
                    </div>
                 </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                 <Button variant="outline" onClick={() => setSelectedSession(null)}>Close</Button>
              </div>
           </div>
        </div>
      )}
    </>
  )
}