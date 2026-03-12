'use client'

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, User, CheckCircle, X, Pencil, Trash2 } from "lucide-react"
import { adminUpdateAppointment, getTherapistsList } from "./actions"

export default function AppointmentEditSheet({ 
  appointment, 
  isOpen, 
  onClose 
}: { 
  appointment: any, 
  isOpen: boolean, 
  onClose: () => void 
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [therapists, setTherapists] = useState<any[]>([])

  // Reset state when opening a new appointment
  useEffect(() => {
    setIsEditing(false)
    if (isOpen) {
      // Fetch therapists for the dropdown
      getTherapistsList().then(setTherapists)
    }
  }, [isOpen, appointment])

  if (!appointment) return null

  // Styles for View vs Edit mode
  const inputStyle = "disabled:opacity-100 disabled:bg-white disabled:text-slate-900 disabled:border-slate-200"

  async function handleSave(formData: FormData) {
    setIsSaving(true)
    await adminUpdateAppointment(formData)
    setIsSaving(false)
    setIsEditing(false)
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-[500px] bg-white p-0 flex flex-col">
        
        {/* HEADER */}
        <SheetHeader className="px-6 py-6 border-b bg-slate-50 sticky top-0 z-10 flex flex-row items-center justify-between space-y-0">
          <div>
            <SheetTitle className="text-xl font-bold text-slate-900">{appointment.patient_name}</SheetTitle>
            <p className="text-sm text-slate-500 font-medium">Appointment Details</p>
          </div>
          
          {/* Edit Toggle */}
          {!isEditing ? (
            <Button size="sm" onClick={() => setIsEditing(true)} variant="outline">
              <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
            </Button>
          ) : (
            <Button size="sm" onClick={() => setIsEditing(false)} variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700">
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
          )}
        </SheetHeader>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6">
          <form action={handleSave} className="space-y-6">
            <input type="hidden" name="id" value={appointment.id} />

            {/* STATUS BADGE */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
              <Label className="text-slate-500 font-bold text-xs uppercase">Current Status</Label>
              {isEditing ? (
                 <Select name="status" defaultValue={appointment.status}>
                   <SelectTrigger className="w-[140px] h-8 bg-white"><SelectValue /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="scheduled">Scheduled</SelectItem>
                     <SelectItem value="completed">Completed</SelectItem>
                     <SelectItem value="cancelled">Cancelled</SelectItem>
                     <SelectItem value="no-show">No Show</SelectItem>
                   </SelectContent>
                 </Select>
              ) : (
                 <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide">
                   {appointment.status}
                 </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-500 text-xs uppercase font-bold tracking-wider">
                  <Calendar className="w-3.5 h-3.5" /> Date
                </Label>
                <Input 
                  name="date" 
                  type="date" 
                  defaultValue={appointment.date} 
                  disabled={!isEditing} 
                  className={inputStyle} 
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-500 text-xs uppercase font-bold tracking-wider">
                  <Clock className="w-3.5 h-3.5" /> Time
                </Label>
                <Input 
                  name="start_time" 
                  type="time" 
                  defaultValue={appointment.start_time} 
                  disabled={!isEditing} 
                  className={inputStyle} 
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-500 text-xs uppercase font-bold tracking-wider">
                  <User className="w-3.5 h-3.5" /> Therapist
                </Label>
                {isEditing ? (
                  <Select name="therapist_id" defaultValue={appointment.therapist_id}>
                    <SelectTrigger className="bg-white"><SelectValue placeholder="Select Therapist" /></SelectTrigger>
                    <SelectContent>
                      {therapists.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input 
                    defaultValue={appointment.therapist?.full_name || "Unknown"} 
                    disabled 
                    className={inputStyle} 
                  />
                )}
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            {isEditing && (
              <div className="pt-6 mt-6 border-t flex items-center justify-between">
                <Button type="button" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                   <Trash2 className="w-4 h-4 mr-2"/> Delete
                </Button>
                <Button type="submit" disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]">
                   {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}