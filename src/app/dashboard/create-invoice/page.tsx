import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { format } from "date-fns"
import ManualInvoiceForm from "./ManualInvoiceForm"
import { Button } from "@/components/ui/button"

export default async function CreateInvoicePage() {
  const supabase = await createClient()

  // Fetch past manual invoices
  const { data: invoices } = await supabase
    .from('manual_invoices')
    .select('*, patient:patient_id(full_name)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans">
      
      {/* HEADER */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Custom Billing</h1>
          <p className="text-sm text-slate-500 mt-1">Generate one-off invoices and view past custom bills.</p>
        </div>
      </div>

      {/* THE FIX: Added `items-start` here so the left column stops stretching */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: THE FORM */}
        <div className="lg:col-span-7">
          <ManualInvoiceForm />
        </div>

        {/* RIGHT: THE LIST */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Recent Custom Invoices</h2>
            
            {/* Added max-height and scrolling so it doesn't stretch the page forever */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {!invoices || invoices.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-12">No custom invoices generated yet.</p>
              ) : (
                invoices.map((invoice) => (
                  <div key={invoice.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 rounded-lg">
                    
                    {/* Invoice Meta */}
                    <div className="mb-3 sm:mb-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900">{invoice.patient?.full_name}</p>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        {format(new Date(invoice.created_at), 'MMMM yyyy')} • {invoice.manual_items?.length || 0} Services
                      </p>
                    </div>
                    
                    {/* Amount, Badge, and Action */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-slate-900">₹{invoice.total_amount.toLocaleString()}</p>
                        <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-sm tracking-widest uppercase">
                          {invoice.status}
                        </span>
                      </div>
                      
                      <Link href={`/dashboard/create-invoice/${invoice.id}`}>
                        <Button variant="outline" size="sm" className="bg-white shadow-sm h-8 px-3 text-xs font-medium border-slate-200">
                          View
                        </Button>
                      </Link>
                    </div>

                  </div>
                ))
              )}
            </div>
            
          </div>
        </div>

      </div>
    </div>
  )
}