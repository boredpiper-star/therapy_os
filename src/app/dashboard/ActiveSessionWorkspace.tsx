'use client'

import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Sparkles, FileText, CheckCircle, Clock, User, Lock, Calendar, X } from "lucide-react"
import { getClinicalNote, getPreviousSessionNote, getActivityLibrary, completeSession, getAppointmentDetails, getPatientHistory } from "./schedule/actions"

export default function ActiveSessionWorkspace({ 
  sessionId, 
  isOpen, 
  onClose 
}: { 
  sessionId: string | null, 
  isOpen: boolean, 
  onClose: () => void 
}) {
  
  // Form State
  const [noteContent, setNoteContent] = useState("")
  const [sessionPlan, setSessionPlan] = useState("") 
  const [selectedActivity, setSelectedActivity] = useState("")
  const [activityNote, setActivityNote] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  
  // UI State
  const [isReadOnly, setIsReadOnly] = useState(false) 
  
  // Data State
  const [patientName, setPatientName] = useState("Loading...")
  const [apptMeta, setApptMeta] = useState<{date: string, time: string} | null>(null)
  const [previousPlan, setPreviousPlan] = useState<string | null>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([]) 

  useEffect(() => {
    if (!sessionId || !isOpen) return

    // 1. CLEAR OLD DATA 🧹
    setNoteContent("")
    setSessionPlan("")
    setSelectedActivity("")
    setActivityNote("")
    setPreviousPlan(null)
    setPatientName("Loading...")
    setApptMeta(null)
    setIsReadOnly(false) 

    async function loadData() {
      // 2. Get Details
      const appt = await getAppointmentDetails(sessionId!)
      if (appt) {
        setPatientName(appt.patient_name)
        setApptMeta({ date: appt.date, time: appt.start_time })

        // CHECK STATUS: If completed, LOCK IT 🔒
        if (appt.status === 'completed') {
           setIsReadOnly(true)
        }

        // Get Context
        const prev = await getPreviousSessionNote(appt.patient_id, appt.date, sessionId!)
        setPreviousPlan(prev) 

        // Get Full History
        const hist = await getPatientHistory(appt.patient_id)
        setHistory(hist || []) 
      }

      // 3. Get Current Note (if exists)
      const note = await getClinicalNote(sessionId!)
      if (note) {
        setNoteContent(note.content || "")
        setSessionPlan(note.session_plan || "")
      }

      // 4. Library
      const lib = await getActivityLibrary()
      setActivities(lib || [])
    }
    loadData()
  }, [sessionId, isOpen])

  async function handleComplete() {
    if (!sessionId || isReadOnly) return 
    setIsSaving(true)
    
    const formData = new FormData()
    formData.append('appointmentId', sessionId)
    formData.append('noteContent', noteContent)
    formData.append('sessionPlan', sessionPlan) 
    formData.append('activityId', selectedActivity)
    formData.append('activityNote', activityNote)
    
    await completeSession(formData)
    setIsSaving(false)
    onClose() 
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* FIX: Removed 'min-w-[600px]'. 
         Now uses 'w-full' for mobile and 'sm:max-w-[600px]' for tablets/desktop.
      */}
      <SheetContent side="right" className="w-full sm:max-w-[600px] p-0 h-full flex flex-col bg-white shadow-2xl border-l border-slate-200">
        
        {/* HEADER */}
        <SheetHeader className="px-4 py-4 sm:px-6 sm:py-5 border-b bg-slate-50 sticky top-0 z-10 flex flex-row items-center justify-between space-y-0">
          
          {/* TITLE SECTION */}
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`h-10 w-10 shrink-0 rounded-full text-white flex items-center justify-center text-lg shadow-sm ${isReadOnly ? 'bg-slate-400' : 'bg-blue-600'}`}>
               {patientName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-normal text-slate-500 flex items-center gap-2 truncate">
                Session Workspace
                {isReadOnly && <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full uppercase font-bold tracking-wide flex items-center gap-1 shrink-0"><Lock className="w-3 h-3"/> Read Only</span>}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <SheetTitle className="text-slate-900 leading-none text-base sm:text-lg truncate">{patientName}</SheetTitle>
                
                {/* Date & Time Display */}
                {apptMeta && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-normal text-slate-400 sm:border-l sm:pl-3 sm:border-slate-300">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {format(parseISO(apptMeta.date), 'MMM do')}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {apptMeta.time.slice(0,5)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CLOSE BUTTON */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full shrink-0"
          >
            <X className="w-5 h-5" />
          </Button>

        </SheetHeader>

        {/* SCROLLABLE CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Tabs defaultValue="workspace" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="workspace" className="gap-2 text-xs sm:text-sm"><FileText className="w-4 h-4"/> Workspace</TabsTrigger>
              <TabsTrigger value="history" className="gap-2 text-xs sm:text-sm"><Clock className="w-4 h-4"/> History</TabsTrigger>
            </TabsList>

            {/* === TAB 1: WORKSPACE === */}
            <TabsContent value="workspace" className="space-y-6">
              
              {/* Context Box */}
              <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <div className="flex items-center gap-2 mb-2 text-blue-700 font-bold text-xs sm:text-sm uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  Plan from Last Session
                </div>
                {previousPlan ? (
                  <div className="bg-slate-50 p-3 rounded-md text-slate-700 text-sm italic border border-slate-100">
                    "{previousPlan}"
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-400">
                    No previous plan found.
                  </p>
                )}
              </div>

              {/* INPUTS */}
              <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-900 font-semibold">Today's Observations (SOAP)</Label>
                    <Textarea 
                      placeholder="Patient response, behaviors, progress..." 
                      className="min-h-[150px] text-base p-3 sm:p-4 bg-white shadow-sm disabled:bg-slate-50 disabled:text-slate-500"
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      disabled={isReadOnly} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-900 font-semibold text-blue-700">Plan for Next Session</Label>
                    <Textarea 
                      placeholder="What should we work on next time?" 
                      className="h-[80px] text-base p-3 sm:p-4 bg-blue-50/50 border-blue-100 focus-visible:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200"
                      value={sessionPlan}
                      onChange={(e) => setSessionPlan(e.target.value)}
                      disabled={isReadOnly} 
                    />
                  </div>

                  <div className="space-y-2 pt-2 border-t">
                    <Label className="text-slate-900 font-semibold">Assign Home Activity</Label>
                    <Select onValueChange={setSelectedActivity} disabled={isReadOnly}> 
                      <SelectTrigger className="h-12 bg-white shadow-sm disabled:bg-slate-50 disabled:text-slate-400"><SelectValue placeholder="Select activity..." /></SelectTrigger>
                      <SelectContent>
                        {activities.map((act) => (
                          <SelectItem key={act.id} value={act.id}>{act.title} ({act.category})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedActivity && (
                      <Textarea 
                        placeholder="Instructions for parents..." 
                        className="mt-2 text-sm bg-yellow-50 border-yellow-200 text-yellow-900 disabled:opacity-50"
                        value={activityNote}
                        onChange={(e) => setActivityNote(e.target.value)}
                        disabled={isReadOnly} 
                      />
                    )}
                  </div>
              </div>

              {/* ACTION BUTTON */}
              <div className="pt-4 mt-6 border-t pb-10 sm:pb-0"> {/* Extra padding bottom for mobile Safari */}
                {!isReadOnly ? (
                  <Button onClick={handleComplete} disabled={isSaving} className="w-full bg-green-600 hover:bg-green-700 text-white h-12 sm:h-14 text-base sm:text-lg shadow-md">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {isSaving ? "Finalizing..." : "Complete Session"}
                  </Button>
                ) : (
                  <div className="w-full h-12 sm:h-14 flex items-center justify-center bg-slate-100 text-slate-500 rounded-md font-medium border border-slate-200 cursor-not-allowed select-none">
                     <Lock className="w-5 h-5 mr-2" />
                     Session Completed (Locked)
                  </div>
                )}
              </div>
            </TabsContent>

            {/* === TAB 2: HISTORY TIMELINE === */}
            <TabsContent value="history" className="space-y-4 pb-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Session Log</h3>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{history.length} Past Sessions</span>
              </div>

              <Accordion type="single" collapsible className="w-full space-y-3">
                {history.map((session) => {
                  const noteData = Array.isArray(session.clinical_notes) ? session.clinical_notes[0] : session.clinical_notes;
                  const activityData = Array.isArray(session.assigned_activities) ? session.assigned_activities[0] : session.assigned_activities;

                  return (
                  <AccordionItem key={session.id} value={session.id} className="border border-slate-200 rounded-lg bg-white shadow-sm px-3 sm:px-4">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-3 sm:gap-4 text-left w-full">
                        <div className="flex flex-col items-center justify-center bg-slate-100 w-10 h-10 sm:w-12 sm:h-12 rounded-md border border-slate-200 text-slate-600 shrink-0">
                            <span className="text-[10px] sm:text-xs font-bold uppercase">{format(parseISO(session.date), 'MMM')}</span>
                            <span className="text-base sm:text-lg font-bold leading-none">{format(parseISO(session.date), 'dd')}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900 text-sm sm:text-base truncate">Therapy Session</p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                            <p className="text-xs text-slate-500 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                              <Clock className="w-3 h-3" /> 
                              {session.start_time.slice(0,5)}
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 truncate max-w-[120px]">
                              <User className="w-3 h-3" /> 
                              {session.therapist?.full_name || 'Therapist'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    
                    <AccordionContent className="pt-2 pb-4 space-y-4 border-t border-slate-100 mt-2">
                      {noteData ? (
                        <div className="space-y-3">
                          <div className="bg-slate-50 p-3 rounded text-sm text-slate-700">
                            <span className="font-bold block text-xs uppercase text-slate-400 mb-1">Observation</span>
                            {noteData.content}
                          </div>
                          {noteData.session_plan && (
                            <div className="bg-blue-50 p-3 rounded text-sm text-blue-900 border border-blue-100">
                              <span className="font-bold block text-xs uppercase text-blue-400 mb-1">Plan</span>
                              {noteData.session_plan}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 italic">No notes recorded.</p>
                      )}

                      {activityData && (
                        <div className="flex items-start gap-3 bg-yellow-50 p-3 rounded border border-yellow-100">
                          <Sparkles className="w-4 h-4 text-yellow-600 mt-1" />
                          <div>
                            <p className="text-sm font-bold text-yellow-800">Assigned: {activityData.activity?.title || "Activity"}</p>
                            <p className="text-xs text-yellow-700 mt-1">{activityData.custom_note}</p>
                          </div>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                  )
                })}
              </Accordion>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}