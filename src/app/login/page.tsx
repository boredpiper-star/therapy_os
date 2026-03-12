'use client'

import { useActionState } from 'react'
import { login } from './actions' // Removed 'signup' import
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2 } from "lucide-react"

// Initial state for the form
const initialState = {
  error: '',
}

export default function LoginPage() {
  // HOOK: This manages the form submission and captures the error returned by 'login'
  const [state, formAction, isPending] = useActionState(login, initialState)

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-sm shadow-lg border-slate-200">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center text-slate-900">TherapyOps</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* We attach the formAction from the hook to the <form> */}
          <form action={formAction} className="grid gap-5">
            
            {/* Display Error State */}
            {state?.error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {state.error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="email" className="font-semibold text-slate-700">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required className="bg-white" />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="password" className="font-semibold text-slate-700">Password</Label>
              <Input id="password" name="password" type="password" required className="bg-white" />
            </div>

            <Button type="submit" disabled={isPending} className="w-full bg-blue-600 hover:bg-blue-700 mt-2 h-11 text-md font-medium">
              {isPending ? (
                  <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Signing In...
                  </>
              ) : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}