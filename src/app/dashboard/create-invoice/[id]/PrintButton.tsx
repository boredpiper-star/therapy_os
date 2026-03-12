'use client'

import { Button } from "@/components/ui/button"

export default function PrintButton() {
  return (
    <Button 
      onClick={() => window.print()} 
      className="bg-slate-900 hover:bg-slate-800 text-white"
    >
      Print / Save PDF
    </Button>
  )
}