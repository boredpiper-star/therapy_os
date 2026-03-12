'use client'

import { useState } from "react"
import { format } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Calendar, Clock } from "lucide-react"
import { deleteAppointment, updateAppointment } from "./actions"

type Appointment = {
  id: string
  patient_id: string 
  patient_name: string
  date: string
  start_time: string
  end_time: string
  status: string
}

export default function AppointmentCard({ appt }: { appt: Appointment }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const startDateTime = new Date(`${appt.date}T${appt.start_time}`)
  const endDateTime = new Date(`${appt.date}T${appt.end_time}`)

  async function handleDelete() {
    setIsLoading(true)
    await deleteAppointment(appt.id)
    setIsLoading(false)
  }

  async function handleUpdate(formData: FormData) {
    setIsLoading(true)
    await updateAppointment(appt.id, formData)
    setIsEditing(false)
    setIsLoading(false)
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        {/* === MAIN CARD (On Dashboard) === */}
        <Card className="cursor-pointer hover:shadow-md hover:border-slate-300 transition-all group border-l-4 border-l-blue-500">
          <CardContent className="p-5 grid gap-3">
            
            {/* TOP ROW: Date & Status */}
            <div className="flex justify-between items-start">
               <div className="flex items-center text-sm font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                  <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                  {format(startDateTime, 'EEE, MMM do')}
                  <span className="mx-2 text-slate-300">|</span>
                  {format(startDateTime, 'h:mm a')}
               </div>
               <Badge 
                  variant={appt.status === 'confirmed' ? 'default' : 'secondary'}
                  className={appt.status === 'confirmed' ? "bg-green-100 text-green-800 hover:bg-green-200 shadow-none" : ""}
                >
                  {appt.status}
                </Badge>
            </div>

            {/* MIDDLE ROW: Patient Name Big */}
            <div className="flex items-center gap-3 mt-1">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                  {appt.patient_name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-900 leading-tight">{appt.patient_name}</h3>
                <p className="text-sm text-slate-500">1 Hour Session</p>
              </div>
            </div>

          </CardContent>
        </Card>
      </SheetTrigger>

      {/* === THE WIDER DRAWER === */}
      <SheetContent className="min-w-[500px] sm:max-w-[600px]">
        <SheetHeader className="mb-8 pb-4 border-b">
          <SheetTitle className="text-3xl font-bold text-slate-900">Appointment Details</SheetTitle>
        </SheetHeader>

        {!isEditing ? (
          // === VIEW MODE ===
          <div className="space-y-8">
            
            {/* BIG PATIENT HEADER */}
            <div className="flex items-start gap-4">
               <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-3xl">
                  {appt.patient_name.charAt(0)}
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-slate-900">{appt.patient_name}</h2>
                  <Badge variant="outline" className="mt-2 text-slate-600 bg-slate-50">Patient Record #{appt.patient_id.slice(0,4)}</Badge>
               </div>
            </div>

            {/* Date & Time Block */}
            <div className="bg-slate-50 p-6 rounded-xl border space-y-4">
              <h3 className="font-semibold text-slate-900">When</h3>
              <div className="grid grid-cols-2 gap-6">
                 <div className="flex gap-3">
                    <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                       <p className="text-sm text-slate-500">Date</p>
                       <p className="font-medium text-lg">{format(startDateTime, 'EEEE, MMMM do, yyyy')}</p>
                    </div>
                 </div>
                 <div className="flex gap-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                       <p className="text-sm text-slate-500">Time</p>
                       <p className="font-medium text-lg">{format(startDateTime, 'h:mm a')} - {format(endDateTime, 'h:mm a')}</p>
                    </div>
                 </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="pt-6 mt-auto">
              <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => setIsEditing(true)} className="bg-slate-900 text-white h-12 text-base">
                Reschedule
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 h-12 text-base">
                    Cancel Session
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel the session for <b>{appt.patient_name}</b>? This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep it</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                      Yes, Cancel it
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              </div>
            </div>
          </div>
        ) : (
          // === EDIT MODE ===
          <form action={handleUpdate} className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6 flex items-center gap-3">
              <Clock className="text-blue-600 h-5 w-5" />
              <p className="text-blue-800 font-medium text-lg">Rescheduling {appt.patient_name}</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-base">New Date</Label>
                <Input name="date" type="date" defaultValue={appt.date} className="h-12 text-lg" required />
              </div>
              <div className="space-y-2">
                <Label className="text-base">New Start Time</Label>
                <Input name="startTime" type="time" defaultValue={appt.start_time.slice(0,5)} className="h-12 text-lg" required />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-8">
              <Button variant="outline" type="button" onClick={() => setIsEditing(false)} className="h-12 text-base">
                Back
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 h-12 text-base text-white" disabled={isLoading}>
                {isLoading ? "Saving..." : "Confirm New Time"}
              </Button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  )
}