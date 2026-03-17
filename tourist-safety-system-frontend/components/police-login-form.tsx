"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BadgeCheck, Lock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function PoliceLoginForm() {
  const router = useRouter()
  const [policeId, setPoliceId] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)

    // Fake delay to show "Verifying Credentials..."
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Direct redirect – no validation, no backend
    router.push("/dashboard")
  }

  return (
    <Card className="w-full border-t-4 border-t-blue-900 shadow-xl bg-white/95 backdrop-blur-sm">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold text-center text-slate-900">
          Officer Login
        </CardTitle>
        <p className="text-sm text-center text-slate-500">
          Enter your credentials to access the dashboard
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="relative">
            <BadgeCheck className="absolute left-3 top-3 h-5 w-5 text-blue-900" />
            <Input
              type="text"
              placeholder="Police ID"
              className="pl-10 h-11 border-slate-200 focus:border-blue-900"
              value={policeId}
              onChange={(e) => setPoliceId(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-blue-900" />
            <Input
              type="password"
              placeholder="Password"
              className="pl-10 h-11 border-slate-200 focus:border-blue-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-blue-900 hover:bg-blue-800 text-white font-bold"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying Credentials...
              </>
            ) : (
              "Secure Login"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4 bg-slate-50/50 border-t border-slate-100 py-4">
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <Lock className="h-3 w-3" />
          <span>Authorized Personnel Only</span>
        </div>
      </CardFooter>
    </Card>
  )
}
