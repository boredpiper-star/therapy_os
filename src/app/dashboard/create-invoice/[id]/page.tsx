import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import PrintButton from "./PrintButton" 

export default async function ManualInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const supabase = await createClient()

  const { data: invoice } = await supabase
    .from('manual_invoices')
    .select('*, patient:patient_id(*)')
    .eq('id', id)
    .single()

  if (!invoice) notFound()

  // Formatting Helpers
  const periodDate = new Date(invoice.billing_year, invoice.billing_month - 1, 1)
  const billingPeriod = format(periodDate, 'MMMM yyyy')
  
  // Use custom issue_date if it exists, otherwise fallback to created_at
  const issueDateStr = invoice.issue_date ? new Date(invoice.issue_date) : new Date(invoice.created_at)
  const issueDate = format(issueDateStr, 'MMMM dd, yyyy')
  
  const parentName = invoice.patient.father_name || invoice.patient.mother_name || "Parent / Guardian";

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 font-sans">
      
      {/* PRINT CSS OVERRIDE */}
      <style dangerouslySetInnerHTML={{__html: `
        @page { size: auto; margin: 0mm; }
        @media print {
          body { background-color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body * { visibility: hidden; }
          #printable-invoice, #printable-invoice * { visibility: visible; }
          #printable-invoice { position: absolute; left: 0; top: 0; width: 100%; padding: 20mm !important; margin: 0 !important; box-shadow: none !important; border: none !important; }
        }
      `}} />

      {/* ACTION BAR */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link href="/dashboard/create-invoice">
          <Button variant="outline" className="bg-white hover:bg-slate-50 border-slate-200">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Generator
          </Button>
        </Link>
        <PrintButton /> 
      </div>

      {/* THE PHYSICAL INVOICE PAPER */}
      <div id="printable-invoice" className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg border border-slate-200 p-8 sm:p-12 relative">

        {/* HEADER */}
        <div className="flex justify-between items-start border-b-2 border-slate-100 pb-5 mb-5 relative z-10 gap-4">
          <div className="flex flex-col gap-1.5 max-w-[600px]">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="AP Paediatric Therapy Services Logo" className="max-w-full max-h-full object-contain" />
              </div>
              <h1 className="text-[22px] sm:text-2xl font-bold text-slate-900 tracking-tight leading-none">
                AP Paediatric Therapy Services
              </h1>
            </div>
            <div className="text-[13px] text-slate-500 leading-[1.5] mt-1">
              <p>743/4A, 1st Floor, opposite St. Xavier's School,</p>
              <p>Bettadasanapura village Road, Neeladri Nagar,</p>
              <p>Electronic City Phase I, Bengaluru, Karnataka560100</p>
              <div className="mt-1.5 flex items-center gap-3 text-sm font-medium text-slate-600 whitespace-nowrap">
                <span>+91 9686697709</span>
                <span className="text-slate-300">|</span>
                <span>appediatrictherapy@gmail.com</span>
              </div>
              <p className="mt-1.5 font-semibold text-slate-700">UDYAM Reg No: UDYAM-KR-03-0464365</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <h2 className="text-3xl font-light text-slate-400 uppercase tracking-widest mb-3">Receipt</h2>
            <div className="flex flex-col items-end gap-1.5 text-sm">
              <div className="flex items-center justify-end gap-3 w-full">
                <span className="text-slate-500 font-medium">Invoice No:</span>
                <span className="font-bold text-slate-900">{invoice.invoice_number}</span>
              </div>
              <div className="flex items-center justify-end gap-3 w-full">
                <span className="text-slate-500 font-medium">Issue Date:</span>
                <span className="font-bold text-slate-900">{issueDate}</span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-slate-100">
              <span className="text-slate-700 font-bold text-base">Status:</span>
              <span className="font-bold text-green-600 flex items-center gap-1.5 bg-white px-3 py-1 rounded-md border border-green-300 shadow-sm text-sm tracking-wide">
                <CheckCircle className="w-4 h-4" /> PAID
              </span>
            </div>
          </div>
        </div>

        {/* BILL TO & PERIOD */}
        <div className="flex justify-between items-end mb-6 relative z-10">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Billed To</p>
            <h3 className="text-lg font-bold text-slate-900">{parentName}</h3>
            <div className="mt-1 border-l-2 border-slate-200 pl-3">
              <p className="text-sm font-medium text-slate-700">Patient: {invoice.patient.full_name}</p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {invoice.patient.display_id}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Billing Period</p>
            <p className="text-sm font-medium text-slate-900 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
              {billingPeriod}
            </p>
          </div>
        </div>

        {/* LINE ITEMS TABLE (Rate & Sessions added) */}
        <div className="mb-4 relative z-10">
          <table className="w-full text-left border-collapse border border-slate-300">
            <thead className="bg-slate-50">
              <tr className="text-sm">
                <th className="py-2.5 px-4 border border-slate-300 font-bold text-slate-900 w-16 text-center">S.No.</th>
                <th className="py-2.5 px-4 border border-slate-300 font-bold text-slate-900">Services</th>
                <th className="py-2.5 px-4 border border-slate-300 font-bold text-slate-900 w-28 text-right">Rate</th>
                <th className="py-2.5 px-4 border border-slate-300 font-bold text-slate-900 w-24 text-center">Sessions</th>
                <th className="py-2.5 px-4 border border-slate-300 font-bold text-slate-900 text-right w-32">Amount</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {invoice.manual_items?.map((item: any, index: number) => (
                <tr key={item.id} className="text-slate-700 hover:bg-slate-50/50">
                  <td className="py-3 px-4 border border-slate-300 text-center font-medium">{index + 1}</td>
                  <td className="py-3 px-4 border border-slate-300">
                    <p className="font-medium text-slate-900">{item.type}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Duration: 45 mins</p>
                  </td>
                  <td className="py-3 px-4 border border-slate-300 text-right font-medium text-slate-600">
                    ₹{Number(item.rate).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 border border-slate-300 text-center font-medium">
                    {item.sessions || 1}
                  </td>
                  <td className="py-3 px-4 border border-slate-300 text-right font-medium text-slate-900">
                    ₹{Number(item.amount).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTALS */}
        <div className="flex justify-end mb-8 relative z-10">
          <div className="w-64 space-y-2.5 pr-2 pt-2">
            <div className="flex justify-between items-center border-t-2 border-slate-900 pt-2.5 mt-2.5">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-sm">Total Paid</span>
              <span className="font-bold text-2xl text-slate-900">₹{invoice.total_amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6 mt-8 text-center relative z-10">
          <p className="text-sm font-medium text-slate-600 mb-1">Thank you for trusting us with {invoice.patient.full_name}'s care.</p>
          <p className="text-xs text-slate-400 italic">This is a computer-generated document and does not require a physical signature.</p>
        </div>

      </div>
    </div>
  )
}