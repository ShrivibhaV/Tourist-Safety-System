import { PoliceLoginForm } from "@/components/police-login-form"
import { Shield } from "lucide-react"

export default function PoliceLoginPage() {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-900/10 to-slate-900/10 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-blue-900 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tourist Safety System</h1>
          <p className="text-slate-600 mt-2 font-medium">Official Police Portal</p>
        </div>

        <PoliceLoginForm />

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Secure Access • 256-bit Encryption • Official Use Only
          </p>
        </div>
      </div>
    </div>
  )
}
