"use client"

import { Button } from "@/components/ui/button"
import { User, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export function Header() {
  const [currentView, setCurrentView] = useState("home")
  const [touristName, setTouristName] = useState<string>("Tourist")
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [digitalId, setDigitalId] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    const name = localStorage.getItem("touristName")
    const loggedIn = localStorage.getItem("isLoggedIn")
    const id = localStorage.getItem("digitalId")

    if (name) setTouristName(name)
    if (loggedIn === "true") setIsLoggedIn(true)
    if (id) setDigitalId(id)
  }, [])

  const handleProfileClick = () => {
    setCurrentView("profile")
    router.push("/profile")
  }

  const handleLogout = () => {
    // Clear all user-specific data
    localStorage.removeItem("touristId")
    localStorage.removeItem("touristName")
    localStorage.removeItem("touristEmail")
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("digitalId")
    localStorage.removeItem("digitalIdentityHash")
    localStorage.removeItem("userPhoto")

    // Note: We keep incidents and emergencyContacts as they might be useful

    // Redirect to login
    router.push("/T-login")
  }

  return (
    <div className="flex justify-between items-center mb-8">
      {/* Left Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Tourist Safety Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome to India – Stay safe and enjoy your journey
        </p>
        {digitalId && (
          <p className="text-sm text-primary font-mono mt-1">
            Digital ID: {digitalId}
          </p>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Profile Button */}
        <Button
          variant={currentView === "profile" ? "default" : "ghost"}
          size="sm"
          className="flex flex-col items-center gap-1 h-16"
          onClick={handleProfileClick}
        >
          <User className="h-5 w-5" />
          <span className="text-xs">{touristName}</span>
        </Button>

        {/* Logout Button */}
        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        )}
      </div>
    </div>
  )
}
