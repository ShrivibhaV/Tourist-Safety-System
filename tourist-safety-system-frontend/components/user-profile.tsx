"use client"

import { useEffect, useState } from "react"
import { User, Mail, Dessert as Passport, Globe, Languages, AlertCircle, Edit2, Download, Phone, X, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import EditProfileForm from "./edit-profile-form"
import API_BASE_URL from "@/lib/api"

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  nationality: string
  passportNumber: string
  emergencyContactName: string
  emergencyContactPhone: string
  preferredLanguage: string
  photo?: string
  digitalIdentityHash?: string
  touristId?: string
  idType?: string
}

export default function UserProfile() {
  const [isEditMode, setIsEditMode] = useState(false)
  const [userData, setUserData] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const touristId = localStorage.getItem("touristId")
        if (!touristId) {
          setError("Please log in to view your profile.")
          setLoading(false)
          return
        }

        const res = await fetch(`${API_BASE_URL}/api/profile/${touristId}`)
        const data = await res.json()

        if (data.success) {
          // Merge backend data with localStorage data
          const profileData = {
            ...data.data,
            // Use localStorage photo if backend doesn't have it
            photo: data.data.photo || localStorage.getItem('userPhoto') || '',
            // Ensure touristId and hash are available
            touristId: data.data.touristId || localStorage.getItem('digitalId') || '',
            digitalIdentityHash: data.data.digitalIdentityHash || localStorage.getItem('digitalIdentityHash') || ''
          }
          setUserData(profileData)
        } else {
          setError(data.message || "Failed to fetch profile.")
        }
      } catch (err) {
        console.error("Error fetching profile:", err)
        setError("An error occurred while fetching profile.")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleSaveProfile = (updatedData: UserProfile) => {
    setUserData(updatedData)
    setIsEditMode(false)
    // Optionally send the updated data to backend
  }

  if (loading) return <div className="text-center mt-10">Loading profile...</div>
  if (error) return <div className="text-center mt-10 text-red-600">{error}</div>
  if (!userData) return null

  const fullName = `${userData.firstName} ${userData.lastName}`

  const downloadProfileAsPDF = async () => {
    const { jsPDF } = await import("jspdf")
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    let y = 15

    // Header
    pdf.setFillColor(61, 75, 125)
    pdf.rect(0, 0, pageWidth, 35, "F")
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(24)
    pdf.setFont("", "bold")
    pdf.text("TOURIST SAFETY PROFILE", pageWidth / 2, 15, { align: "center" })
    pdf.setFontSize(10)
    pdf.setFont("", "normal")
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 25, { align: "center" })
    y = 45

    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(18)
    pdf.setFont("", "bold")
    pdf.text(fullName, 15, y)
    y += 8
    pdf.setFontSize(11)
    pdf.setFont("", "normal")
    pdf.setTextColor(100, 100, 100)
    pdf.text(`Nationality: ${userData.nationality} | Language: ${userData.preferredLanguage}`, 15, y)
    y += 15

    // Add other sections similarly (Personal info, Travel doc, Contact, Emergency)
    pdf.save(`${fullName}-tourist-safety-profile.pdf`)
  }

  if (isEditMode) {
    return (
      <div className="min-h-screen py-12 px-4 md:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground">Edit Profile</h1>
            <Button variant="ghost" size="icon" onClick={() => setIsEditMode(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <EditProfileForm
            initialData={userData}
            onSave={handleSaveProfile}
            onCancel={() => setIsEditMode(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-12">
          <div className="flex items-start gap-6 flex-1">
            <div className="relative">
              {userData.photo ? (
                <img src={userData.photo} alt={fullName} className="w-32 h-32 rounded-2xl object-cover border-4 border-primary shadow-xl ring-4 ring-primary/10" />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-primary/10 flex items-center justify-center border-4 border-primary shadow-xl ring-4 ring-primary/10">
                  <User className="w-16 h-16 text-primary" />
                </div>
              )}
            </div>
            <div className="flex-1 pt-2">
              <h1 className="text-4xl font-bold">{fullName}</h1>
              <p className="text-sm text-muted-foreground">{userData.nationality}</p>
            </div>
          </div>

          <div className="flex gap-3 md:flex-col lg:flex-row">
            <Button onClick={() => setIsEditMode(true)} className="gap-2 bg-primary hover:bg-primary/90 text-white">
              <Edit2 className="w-4 h-4" />
              Edit
            </Button>
            <Button onClick={downloadProfileAsPDF} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card className="p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold">Personal Information</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">First Name</label>
                  <p className="font-medium">{userData.firstName}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Last Name</label>
                  <p className="font-medium">{userData.lastName}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Email Address</label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <p className="font-medium">{userData.email}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Phone Number</label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <p className="font-medium">{userData.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Nationality</label>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <p className="font-medium">{userData.nationality}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Language</label>
                  <div className="flex items-center gap-2">
                    <Languages className="w-4 h-4 text-muted-foreground" />
                    <p className="font-medium">{userData.preferredLanguage}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            {/* Identity Details */}
            <Card className="p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Passport className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold">Identity Details</h2>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Tourist ID</label>
                <p className="font-mono text-lg font-medium tracking-wider text-primary">{userData.touristId || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">ID Number ({userData.idType || "Passport"})</label>
                <p className="font-mono text-lg font-medium tracking-wider">{userData.passportNumber}</p>
              </div>
            </Card>

            {/* Emergency Contact */}
            <Card className="p-6 shadow-sm border-red-100 bg-red-50/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-red-900">Emergency Contact</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-red-700/70">Contact Name</label>
                  <p className="font-medium text-red-900">{userData.emergencyContactName}</p>
                </div>
                <div>
                  <label className="text-sm text-red-700/70">Emergency Phone</label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-red-600" />
                    <p className="font-medium text-red-900">{userData.emergencyContactPhone}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Blockchain Verification (Academic Simulation) */}
            <Card className="p-6 shadow-sm border-green-100 bg-green-50/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-green-900">Blockchain Verification</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-green-700/70">Digital Identity Hash</label>
                  <p className="font-mono text-xs break-all bg-white p-3 rounded border border-green-200 text-green-800">
                    {/* Display the hash stored in the database */}
                    {userData.digitalIdentityHash || "Hash generation pending..."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-xs font-medium text-green-700">Verified on Tourist Ledger</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
