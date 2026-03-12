'use client'

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, UserPlus, Phone, User, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function PatientList({ patients }: { patients: any[] }) {
  const [search, setSearch] = useState("")

  // Filter patients based on search (now includes ID search!)
  const filteredPatients = patients.filter(p => 
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.display_id?.toLowerCase().includes(search.toLowerCase()) ||
    p.father_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.mother_name?.toLowerCase().includes(search.toLowerCase())
  )

  // Helper to calculate age from DOB
  const getAge = (dob: string) => {
    if (!dob) return "Age N/A"
    const birthDate = new Date(dob)
    const ageDifMs = Date.now() - birthDate.getTime()
    const ageDate = new Date(ageDifMs)
    const age = Math.abs(ageDate.getUTCFullYear() - 1970)
    return `${age} yrs old`
  }

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="space-y-6">
      
      {/* HEADER & SEARCH */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Patients</h1>
          <p className="text-slate-500">Manage your client records and clinical profiles.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by ID, child name, or parent name..." 
              className="pl-9 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link href="/dashboard/patients/new">
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm w-full sm:w-auto">
              <UserPlus className="mr-2 h-4 w-4" /> New Patient
            </Button>
          </Link>
        </div>
      </div>

      {/* PATIENT GRID */}
      {filteredPatients.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-xl bg-slate-50/50">
           <p className="text-slate-500">No patients found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <Link key={patient.id} href={`/dashboard/patients/${patient.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-slate-200 group h-full">
                <CardContent className="p-5 space-y-4">
                  
                  {/* CHILD HEADER */}
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                        {getInitials(patient.full_name)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {patient.full_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          {/* THE NEW ID BADGE */}
                          {patient.display_id && (
                            <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                              {patient.display_id}
                            </span>
                          )}
                          <p className="text-sm text-slate-500">
                            {getAge(patient.date_of_birth)} • {patient.gender}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Diagnosis Badge (Optional) */}
                    {patient.diagnosis ? (
                      <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                         {patient.diagnosis}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                        No Diagnosis
                      </span>
                    )}
                  </div>

                  <hr className="border-slate-100" />

                  {/* PARENT CONTACT INFO */}
                  <div className="space-y-3 pt-1">
                    {/* FATHER ROW */}
                    {patient.father_name ? (
                        <div className="flex items-start gap-3">
                           <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                           <div className="text-sm">
                              <p className="font-medium text-slate-700">Dad: {patient.father_name}</p>
                              {patient.father_phone ? (
                                <div className="flex items-center gap-1.5 text-slate-500 mt-0.5">
                                   <Phone className="w-3 h-3" /> {patient.father_phone}
                                </div>
                              ) : <span className="text-xs text-slate-400 italic">No phone</span>}
                           </div>
                        </div>
                    ) : null}

                    {/* MOTHER ROW */}
                    {patient.mother_name ? (
                        <div className="flex items-start gap-3">
                           <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                           <div className="text-sm">
                              <p className="font-medium text-slate-700">Mom: {patient.mother_name}</p>
                              {patient.mother_phone ? (
                                <div className="flex items-center gap-1.5 text-slate-500 mt-0.5">
                                   <Phone className="w-3 h-3" /> {patient.mother_phone}
                                </div>
                              ) : <span className="text-xs text-slate-400 italic">No phone</span>}
                           </div>
                        </div>
                    ) : null}

                    {/* FALLBACK IF EMPTY */}
                    {!patient.father_name && !patient.mother_name && (
                        <div className="flex items-center gap-2 text-slate-400 text-sm italic">
                           <AlertCircle className="w-4 h-4" /> No parent contact info
                        </div>
                    )}
                  </div>

                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}