'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox" // Make sure you have this, or use standard input
import { Calendar as CalIcon, Repeat, ArrowRight, CheckCircle, AlertTriangle, Save, Loader2, RotateCw } from "lucide-react"
import { format, parseISO, addMonths } from "date-fns"

// Import actions
import { createAppointment } from "./actions"
import { checkSeriesConflicts, bookSeries, type SlotCheckResult } from "../series-actions"

// Extended Type for UI State
type UiSlot = SlotCheckResult & { selected: boolean }

export default function NewAppointmentPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("single")
  const [isLoading, setIsLoading] = useState(false)

  // Data
  const [patients, setPatients] = useState<any[]>([])
  const [therapists, setTherapists] = useState<any[]>([])

  // Shared Form State
  const [selectedPatient, setSelectedPatient] = useState("")
  const [selectedTherapist, setSelectedTherapist] = useState("")

  // --- SINGLE SESSION STATE ---
  const [singleDate, setSingleDate] = useState("")
  const [singleTime, setSingleTime] = useState("")

  // --- RECURRENCE STATE ---
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(addMonths(new Date(), 3), 'yyyy-MM-dd'))
  const [startTime, setStartTime] = useState("09:00")
  
  const [frequency, setFrequency] = useState<'daily'|'weekly'|'monthly'>('weekly')
  const [interval, setInterval] = useState("1") 
  const [selectedDays, setSelectedDays] = useState<number[]>([1]) // Default Monday

  // Results (Now using UiSlot with 'selected' prop)
  const [seriesPreview, setSeriesPreview] = useState<UiSlot[]>([]) 
  const [step, setStep] = useState(1) 

  // Load Data
  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: p } = await supabase.from('patients').select('id, full_name')
      const { data: t } = await supabase.from('profiles').select('id, full_name').in('role', ['therapist', 'doctor'])
      setPatients(p || [])
      setTherapists(t || [])
    }
    loadData()
  }, [])

  function toggleDay(dayIndex: number) {
    if (selectedDays.includes(dayIndex)) {
      setSelectedDays(selectedDays.filter(d => d !== dayIndex))
    } else {
      setSelectedDays([...selectedDays, dayIndex])
    }
  }

  const DAYS = [
    { label: 'M', val: 1 }, { label: 'T', val: 2 }, { label: 'W', val: 3 },
    { label: 'T', val: 4 }, { label: 'F', val: 5 }, { label: 'S', val: 6 }, { label: 'S', val: 0 },
  ]

  // === HANDLER: BOOK SINGLE ===
  async function handleSingleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData()
    formData.append('patientId', selectedPatient)
    formData.append('therapistId', selectedTherapist)
    formData.append('date', singleDate)
    formData.append('start_time', singleTime) 
    
    const pName = patients.find(p => p.id === selectedPatient)?.full_name || ""
    formData.append('patientName', pName)

    try {
      await createAppointment(formData) 
    } catch (error) {
      console.error(error)
      setIsLoading(false)
    }
  }

  // === HANDLER: PREVIEW SERIES ===
  async function handlePreviewSeries() {
    setIsLoading(true)
    const results = await checkSeriesConflicts({
      patientId: selectedPatient,
      therapistId: selectedTherapist,
      startTime: startTime,
      startDate: startDate,
      endDate: endDate,
      frequency: frequency,
      interval: parseInt(interval),
      selectedDays: selectedDays
    })
    
    // Transform to UI State: Auto-select Available, Deselect Conflicts
    const uiResults: UiSlot[] = results.map(slot => ({
      ...slot,
      selected: slot.status === 'available'
    }))

    setSeriesPreview(uiResults)
    setStep(2)
    setIsLoading(false)
  }

  // === HANDLER: TOGGLE SELECTION ===
  function toggleSlotSelection(index: number) {
    const updated = [...seriesPreview]
    updated[index].selected = !updated[index].selected
    setSeriesPreview(updated)
  }

  // === HANDLER: COMMIT SERIES ===
  async function handleCommitSeries() {
    setIsLoading(true)
    const patientName = patients.find(p => p.id === selectedPatient)?.full_name || "Unknown"
    
    // FILTER: Only send the 'selected' slots to the backend
    const selectedSlots = seriesPreview.filter(s => s.selected)

    if (selectedSlots.length === 0) {
      alert("Please select at least one date to book.")
      setIsLoading(false)
      return
    }

    await bookSeries(selectedPatient, patientName, selectedTherapist, selectedSlots)
    setIsLoading(false)
    router.push('/dashboard/schedule')
  }

  // Helper: Count selected
  const selectedCount = seriesPreview.filter(s => s.selected).length

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">New Booking</h1>
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>

      <Tabs defaultValue="single" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6 h-12 bg-slate-100 p-1">
          <TabsTrigger value="single" className="text-base"><CalIcon className="w-4 h-4 mr-2"/> Single Session</TabsTrigger>
          <TabsTrigger value="series" className="text-base"><Repeat className="w-4 h-4 mr-2"/> Recurring Series</TabsTrigger>
        </TabsList>

        {/* TAB 1: SINGLE */}
        <TabsContent value="single">
          <Card>
            <CardHeader><CardTitle>One-Time Appointment</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSingleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Patient</Label>
                    <Select onValueChange={setSelectedPatient} required>
                      <SelectTrigger><SelectValue placeholder="Select Patient" /></SelectTrigger>
                      <SelectContent>
                        {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Therapist</Label>
                    <Select onValueChange={setSelectedTherapist} required>
                      <SelectTrigger><SelectValue placeholder="Select Therapist" /></SelectTrigger>
                      <SelectContent>
                        {therapists.map(t => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" value={singleDate} onChange={e => setSingleDate(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input type="time" value={singleTime} onChange={e => setSingleTime(e.target.value)} required />
                  </div>
                </div>
                <Button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white hover:bg-slate-800">
                  {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Confirm Booking"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: SERIES */}
        <TabsContent value="series">
          <Card className="border-blue-100 shadow-md">
            <CardHeader className="bg-blue-50/50 border-b border-blue-100">
              <CardTitle className="flex items-center gap-2 text-blue-900">
                {step === 1 ? "Configure Recurrence" : "Review Schedule"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              
              {/* STEP 1: CONFIG */}
              {step === 1 && (
                <div className="space-y-8">
                  {/* ... Same inputs as before ... */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Patient</Label>
                      <Select onValueChange={setSelectedPatient}>
                        <SelectTrigger><SelectValue placeholder="Select Patient" /></SelectTrigger>
                        <SelectContent>
                          {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Therapist</Label>
                      <Select onValueChange={setSelectedTherapist}>
                        <SelectTrigger><SelectValue placeholder="Select Therapist" /></SelectTrigger>
                        <SelectContent>
                          {therapists.map(t => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="border-t pt-6 space-y-6">
                    <div className="flex items-end gap-4">
                      <div className="space-y-2 flex-1">
                        <Label>Start Date</Label>
                        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                      </div>
                      <div className="space-y-2 w-32">
                        <Label>Time</Label>
                        <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                          <RotateCw className="w-4 h-4" />
                          <span>Repeat every</span>
                          <Input type="number" className="w-16 h-8 bg-white" value={interval} onChange={e => setInterval(e.target.value)} min={1} />
                          <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                            <SelectTrigger className="w-32 h-8 bg-white"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Day(s)</SelectItem>
                              <SelectItem value="weekly">Week(s)</SelectItem>
                              <SelectItem value="monthly">Month(s)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {frequency === 'weekly' && (
                          <div className="flex gap-2 pl-6">
                            {DAYS.map((day) => (
                              <button
                                key={day.val}
                                onClick={() => toggleDay(day.val)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                                  selectedDays.includes(day.val)
                                    ? 'bg-blue-600 text-white shadow-md scale-110'
                                    : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-300'
                                }`}
                              >
                                {day.label}
                              </button>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-2 pt-2">
                           <Label className="text-slate-500 w-24">End Date:</Label>
                           <Input type="date" className="w-48 bg-white" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700" 
                    onClick={handlePreviewSeries}
                    disabled={isLoading || !selectedPatient || !selectedTherapist}
                  >
                    {isLoading ? "Generating..." : "Check Availability"} <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              )}

              {/* STEP 2: REVIEW (UPDATED WITH CHECKBOXES) */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="font-semibold text-slate-700">
                       Confirming <span className="text-blue-600 font-bold">{selectedCount}</span> Sessions
                     </h3>
                     <Button variant="ghost" size="sm" onClick={() => setStep(1)}>Edit Settings</Button>
                  </div>

                  <div className="space-y-2 max-h-[350px] overflow-y-auto border rounded-md p-2 bg-slate-50">
                    {seriesPreview.map((slot, i) => (
                      <div 
                        key={i} 
                        className={`flex items-center gap-3 p-3 rounded border transition-all ${
                          slot.selected 
                            ? 'bg-white border-slate-200' 
                            : 'bg-slate-100 border-transparent opacity-60'
                        } ${
                          slot.status === 'conflict' && slot.selected ? 'border-red-300 bg-red-50' : ''
                        }`}
                      >
                        {/* CHECKBOX */}
                        <div className="flex items-center h-full">
                          <input 
                            type="checkbox" 
                            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            checked={slot.selected}
                            onChange={() => toggleSlotSelection(i)}
                          />
                        </div>

                        {/* INFO */}
                        <div className="flex-1 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-xs font-bold text-slate-400 w-6">#{i+1}</div>
                            <div className="text-sm font-medium">
                              {format(parseISO(slot.date), 'EEE, MMM do')}
                            </div>
                            {slot.status === 'conflict' && (
                               <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                 <AlertTriangle className="w-3 h-3"/> Conflict
                               </span>
                            )}
                          </div>
                          
                          {/* Status Icon */}
                          <div>
                            {slot.status === 'available' ? (
                              <CheckCircle className={`w-4 h-4 ${slot.selected ? 'text-green-500' : 'text-slate-400'}`} />
                            ) : (
                              <div className="text-xs text-red-500 font-medium">
                                {slot.conflictReason}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700 min-w-[200px]" 
                      onClick={handleCommitSeries} 
                      disabled={isLoading || selectedCount === 0}
                    >
                      {isLoading ? "Booking..." : `Confirm ${selectedCount} Bookings`}
                    </Button>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}