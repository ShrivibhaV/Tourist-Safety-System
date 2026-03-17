"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

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
}

interface EditProfileFormProps {
  initialData: UserProfile
  onSave: (data: UserProfile) => void
  onCancel: () => void
}

export default function EditProfileForm({ initialData, onSave, onCancel }: EditProfileFormProps) {
  const [formData, setFormData] = useState<UserProfile>(initialData)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information Section */}
      <Card className="p-8 border border-border/50 bg-white/50 dark:bg-slate-900/30 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-foreground mb-6">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Nationality</label>
            <input
              type="text"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Preferred Language</label>
            <select
              name="preferredLanguage"
              value={formData.preferredLanguage}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="hi">Hindi</option>
              <option value="zh">Chinese</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Travel Documentation */}
      <Card className="p-8 border border-border/50 bg-white/50 dark:bg-slate-900/30 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-foreground mb-6">Travel Document</h2>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Passport Number</label>
          <input
            type="text"
            name="passportNumber"
            value={formData.passportNumber}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </Card>

      {/* Contact Information */}
      <Card className="p-8 border border-border/50 bg-white/50 dark:bg-slate-900/30 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-foreground mb-6">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </Card>

      {/* Emergency Contact */}
      <Card className="p-8 border-2 border-red-400 dark:border-red-500 bg-gradient-to-br from-red-50 dark:from-red-950/20 to-orange-50 dark:to-orange-950/20">
        <h2 className="text-2xl font-bold text-red-700 dark:text-red-300 mb-6">Emergency Contact</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-red-700 dark:text-red-300 mb-2">Contact Name</label>
            <input
              type="text"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-950/30 text-foreground focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-red-700 dark:text-red-300 mb-2">Phone Number</label>
            <input
              type="tel"
              name="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-950/30 text-foreground focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
          Save Changes
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
          Cancel
        </Button>
      </div>
    </form>
  )
}
