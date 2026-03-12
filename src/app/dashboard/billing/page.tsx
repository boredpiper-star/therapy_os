'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Calculator, CheckCircle, Search, AlertCircle } from "lucide-react"
import { getBillingPatients, previewInvoice, createInvoice, getInvoices } from "./actions"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

import Link from "next/link"
//import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"



export default function BillingDashboard() {
  const router = useRouter()
  
  // State
  const [patients, setPatients] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form State
  const [selectedPatient, setSelectedPatient] = useState("")
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1) // Current Month (1-12)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [rate, setRate] = useState("1000") // Default to 1000
  
  // Preview State
  const [previewSessions, setPreviewSessions] = useState<any[]>([])
  const [hasPreviewed, setHasPreviewed] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Load Initial Data
  useEffect(() => {
    async function load() {
      const pData = await getBillingPatients()
      const iData = await getInvoices()
      setPatients(pData)
      setHistory(iData)
      setLoading(false)
    }
    load()
  }, [])

  // Handle Preview Button
  async function handlePreview() {
    if (!selectedPatient) return alert("Please select a patient")
    const sessions = await previewInvoice(selectedPatient, selectedMonth, selectedYear)
    setPreviewSessions(sessions)
    setHasPreviewed(true)
  }

  // Handle Generate Invoice
  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (previewSessions.length === 0) return alert("Cannot generate invoice for 0 sessions.")
    
    setIsGenerating(true)
    const formData = new FormData()
    formData.append('patient_id', selectedPatient)
    formData.append('month', selectedMonth.toString())
    formData.append('year', selectedYear.toString())
    formData.append('session_count', previewSessions.length.toString())
    formData.append('rate', rate)

    try {
      const invoiceId = await createInvoice(formData)
      // Redirect to the printable invoice page!
      router.push(`/dashboard/billing/${invoiceId}`)
    } catch (error) {
      alert("Failed to generate invoice")
      setIsGenerating(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Billing Dashboard...</div>

  const months = [
    { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
    { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
    { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
    { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" }
  ]

  return (
    


    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Billing & Invoices</h1>
        <p className="text-slate-500">Generate monthly invoices and view payment history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT: GENERATE FORM */}
        <Card className="lg:col-span-1 border-slate-200 shadow-sm h-fit">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" /> Generate Invoice
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div className="space-y-2">
              <Label>Patient</Label>
              <Select value={selectedPatient} onValueChange={(val) => { setSelectedPatient(val); setHasPreviewed(false); }}>
                <SelectTrigger className="bg-white"><SelectValue placeholder="Select Patient..." /></SelectTrigger>
                <SelectContent>
                  {patients.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.full_name} ({p.display_id})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Month</Label>
                <Select value={selectedMonth.toString()} onValueChange={(val) => { setSelectedMonth(parseInt(val)); setHasPreviewed(false); }}>
                  <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input type="number" value={selectedYear} onChange={(e) => { setSelectedYear(parseInt(e.target.value)); setHasPreviewed(false); }} />
              </div>
            </div>

            <Button onClick={handlePreview} variant="secondary" className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700">
              <Search className="w-4 h-4 mr-2" /> Find Completed Sessions
            </Button>

            {/* PREVIEW RESULTS BOX */}
            {hasPreviewed && (
              <form onSubmit={handleGenerate} className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-blue-900">Completed Sessions Found:</span>
                  <span className="font-bold text-lg text-blue-700">{previewSessions.length}</span>
                </div>
                
                {previewSessions.length > 0 ? (
                  <>
                    <div className="space-y-2 pt-2 border-t border-blue-200/50">
                      <Label className="text-blue-900">Rate per Session (₹)</Label>
                      <Input 
                        type="number" 
                        value={rate} 
                        onChange={(e) => setRate(e.target.value)} 
                        className="bg-white border-blue-200"
                        required
                        min="0"
                      />
                    </div>
                    <div className="flex justify-between items-center pt-2 text-blue-900">
                       <span className="font-semibold text-sm">Total Amount:</span>
                       <span className="font-bold text-xl">₹{(previewSessions.length * parseFloat(rate || "0")).toLocaleString()}</span>
                    </div>
                    <Button type="submit" disabled={isGenerating} className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2 shadow-sm">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {isGenerating ? "Generating..." : "Generate & View PDF"}
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                    <AlertCircle className="w-4 h-4" /> No billable sessions found for this month.
                  </div>
                )}
              </form>
            )}
          </CardContent>
        </Card>

        {/* RIGHT: INVOICE HISTORY */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="bg-white border-b border-slate-100">
            <CardTitle className="text-lg">Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {history.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No invoices generated yet.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {history.map((inv) => (
                  <div key={inv.id} className="p-4 hover:bg-slate-50 flex items-center justify-between transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{inv.patient?.full_name}</span>
                        <span className="text-xs font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                          {inv.invoice_number}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {months.find(m => m.value === inv.billing_month)?.label} {inv.billing_year} • {inv.session_count} Sessions
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-slate-900">₹{inv.total_amount.toLocaleString()}</div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-100 px-1.5 py-0.5 rounded border border-green-200">
                          {inv.status}
                        </span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/billing/${inv.id}`)}>
                         View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}