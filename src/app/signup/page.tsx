import { signup } from "./actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={signup} className="space-y-4">
            
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                name="fullName" 
                placeholder="e.g. Dr. Mike Ross" 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="doctor@therapy.com" 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
              />
            </div>

            <Button type="submit" className="w-full bg-slate-900 text-white">
              Sign Up
            </Button>

            <div className="text-center text-sm">
              <Link href="/login" className="text-blue-600 hover:underline">
                Already have an account? Log in
              </Link>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}