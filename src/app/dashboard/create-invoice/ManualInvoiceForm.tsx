'use client'

import { useState, useEffect } from "react"
import { Search, Plus, Trash2, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { searchPatients, createManualInvoice } from "./actions"

export default function ManualInvoiceForm() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null)
  
  const [billingMonth, setBillingMonth] = useState(new Date().getMonth() + 1)
  const [billingYear, setBillingYear] = useState(new Date().getFullYear())
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
  
  const [lineItems, setLineItems] = useState([
    { id: Date.now(), type: 'Occupational Therapy', sessions: 1, rate: 750 }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (searchQuery.length < 2) return setSearchResults([])
    const delayFn = setTimeout(async () => {
      const results = await searchPatients(searchQuery)
      setSearchResults(results)
    }, 300)
    return () => clearTimeout(delayFn)
  }, [searchQuery])

  const addLineItem = () => setLineItems([...lineItems, { id: Date.now(), type: 'Occupational Therapy', sessions: 1, rate: 750 }])
  const removeLineItem = (id: number) => setLineItems(lineItems.filter(item => item.id !== id))
  const updateLineItem = (id: number, field: string, value: string | number) => setLineItems(lineItems.map(item => item.id === id ? { ...item, [field]: value } : item))
  
  const totalAmount = lineItems.reduce((sum, item) => sum + (Number(item.sessions) * Number(item.rate)), 0)

  const handleGenerate = async () => {
    if (!selectedPatient) return alert("Please select a patient first.")
    if (lineItems.length === 0) return alert("Please add at least one service.")
    
    setIsSubmitting(true)
    try {
      const formattedItems = lineItems.map(item => ({
        ...item,
        amount: Number(item.sessions) * Number(item.rate)
      }))

      const newInvoiceId = await createManualInvoice({
        patient_id: selectedPatient.id,
        billing_month: billingMonth,
        billing_year: billingYear,
        issue_date: issueDate,
        manual_items: formattedItems,
        total_amount: totalAmount,
      })
      router.push(`/dashboard/create-invoice/${newInvoiceId}`)
    } catch (error) {
      alert("Failed to generate invoice.")
      setIsSubmitting(false)
    }
  }

  // THE FIX: Removed `h-full flex flex-col` from the outer div
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
        <span className="bg-blue-100 text-blue-600 p-1.5 rounded-md"><Save className="w-4 h-4"/></span>
        Generate Custom Invoice
      </h2>
      
      <div className="space-y-6">
        {/* Patient Search */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Patient</label>
          {!selectedPatient ? (
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input 
                type="text" placeholder="Search patient name..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                  {searchResults.map(p => (
                    <button key={p.id} onClick={() => { setSelectedPatient(p); setSearchQuery(""); setSearchResults([]); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 border-b">
                      <span className="font-semibold text-slate-900">{p.full_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="font-semibold text-slate-900 text-sm">{selectedPatient.full_name}</p>
              <button onClick={() => setSelectedPatient(null)} className="text-sm text-blue-600 font-medium hover:underline">Change</button>
            </div>
          )}
        </div>

        {/* Dates & Period */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Issue Date</label>
            <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Billing Month</label>
            <select value={billingMonth} onChange={(e) => setBillingMonth(Number(e.target.value))} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
              {Array.from({ length: 12 }, (_, i) => (<option key={i+1} value={i+1}>{new Date(2000, i, 1).toLocaleString('default', { month: 'short' })}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Year</label>
            <input type="number" value={billingYear} onChange={(e) => setBillingYear(Number(e.target.value))} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* Line Items */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-semibold text-slate-700">Services</label>
            <Button variant="outline" onClick={addLineItem} size="sm" className="h-8 text-xs gap-1.5 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:text-blue-700">
              <Plus className="w-3.5 h-3.5"/> Add Service
            </Button>
          </div>
          
          <div className="space-y-3 mb-6">
            {lineItems.map((item, index) => (
              <div key={item.id} className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <select value={item.type} onChange={(e) => updateLineItem(item.id, 'type', e.target.value)} className="w-full sm:flex-1 p-2 bg-white border border-slate-200 rounded-md text-sm outline-none">
                  <option>Occupational Therapy</option>
                  <option>Speech Therapy</option>
                  <option>Special Education</option>
                  <option>Assessment</option>
                  <option>Custom Service</option>
                </select>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-medium text-slate-500 w-16 sm:hidden">Sessions:</span>
                  <input type="number" min="1" value={item.sessions} onChange={(e) => updateLineItem(item.id, 'sessions', e.target.value)} className="w-full sm:w-20 p-2 bg-white border border-slate-200 rounded-md text-sm outline-none text-center" title="Sessions" placeholder="Qty" />
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto items-center">
                  <span className="text-xs font-medium text-slate-500 w-16 sm:hidden">Rate (₹):</span>
                  <div className="relative w-full sm:w-28">
                    <span className="absolute left-3 top-2 text-slate-500 text-sm">₹</span>
                    <input type="number" value={item.rate} onChange={(e) => updateLineItem(item.id, 'rate', e.target.value)} className="w-full p-2 pl-7 bg-white border border-slate-200 rounded-md text-sm outline-none" placeholder="Rate" />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeLineItem(item.id)} disabled={lineItems.length === 1} className="text-slate-400 hover:text-red-500 hover:bg-red-50 shrink-0 h-9 w-9">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* THE FIX: Replaced `mt-auto` with `mt-6` */}
      <div className="pt-5 border-t border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center mt-6">
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 w-full sm:w-auto">
          <span className="text-sm font-semibold text-slate-500">Total:</span>
          <span className="text-xl font-bold text-slate-900">₹{totalAmount.toLocaleString()}</span>
        </div>
        
        <Button size="lg" onClick={handleGenerate} disabled={isSubmitting || !selectedPatient} className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white shadow-sm px-8">
          {isSubmitting ? "Generating..." : "Generate Invoice"}
        </Button>
      </div>
    </div>
  )
}