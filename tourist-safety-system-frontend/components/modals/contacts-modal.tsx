"use client"

import { X, Phone, Plus, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import API_BASE_URL from "@/lib/api"

interface Contact {
  id?: string
  name: string
  phone: string
  relationship?: string
}

interface ContactsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContactsModal({ open, onOpenChange }: ContactsModalProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [newName, setNewName] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load contacts when modal opens - localStorage first
  useEffect(() => {
    if (open) {
      loadContacts()
    }
  }, [open])

  const loadContacts = async () => {
    setLoading(true)
    setError(null)

    try {
      // First, load from localStorage (always available)
      const savedContacts = localStorage.getItem("emergencyContacts")
      if (savedContacts) {
        setContacts(JSON.parse(savedContacts))
      }

      // Then try to sync with backend (optional)
      const touristId = localStorage.getItem("touristId")
      if (touristId) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/dashboard/${touristId}`, {
            signal: AbortSignal.timeout(3000) // 3 second timeout
          })

          if (response.ok) {
            const result = await response.json()
            if (result.success && result.data.emergencyContacts) {
              const backendContacts = result.data.emergencyContacts
              setContacts(backendContacts)
              localStorage.setItem("emergencyContacts", JSON.stringify(backendContacts))
            }
          }
        } catch (backendError) {
          // Backend unavailable, continue with localStorage data
          console.log("Backend unavailable, using local data")
        }
      }
    } catch (error) {
      console.error("Failed to load contacts:", error)
      setError("Failed to load contacts")
    } finally {
      setLoading(false)
    }
  }

  const addContact = async () => {
    if (!newName.trim() || !newPhone.trim()) {
      setError("Please fill in both name and phone number")
      setTimeout(() => setError(null), 3000)
      return
    }

    const newContact: Contact = {
      id: Date.now().toString(),
      name: newName.trim(),
      phone: newPhone.trim(),
      relationship: "Emergency Contact",
    }

    // Update UI immediately
    const updatedContacts = [...contacts, newContact]
    setContacts(updatedContacts)

    // Save to localStorage immediately
    localStorage.setItem("emergencyContacts", JSON.stringify(updatedContacts))

    // Clear form
    setNewName("")
    setNewPhone("")

    // Try to sync with backend (optional)
    const touristId = localStorage.getItem("touristId")
    if (touristId) {
      try {
        await fetch(`${API_BASE_URL}/api/dashboard/contacts/${touristId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newContact),
          signal: AbortSignal.timeout(3000)
        })
      } catch (error) {
        console.log("Backend sync failed, contact saved locally")
      }
    }
  }

  const deleteContact = async (index: number) => {
    const updatedContacts = contacts.filter((_, i) => i !== index)
    setContacts(updatedContacts)
    localStorage.setItem("emergencyContacts", JSON.stringify(updatedContacts))

    // Try to sync with backend (optional)
    const touristId = localStorage.getItem("touristId")
    if (touristId) {
      try {
        await fetch(`${API_BASE_URL}/api/dashboard/contacts/${touristId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ index }),
          signal: AbortSignal.timeout(3000)
        })
      } catch (error) {
        console.log("Backend sync failed, contact deleted locally")
      }
    }
  }

  const callContact = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Emergency Contacts</h2>
          <button onClick={() => onOpenChange(false)} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Contact name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="tel"
              placeholder="Phone number"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addContact}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Contact
            </button>
          </div>

          <div className="space-y-2">
            {loading ? (
              <p className="text-gray-500 text-center py-4">Loading contacts...</p>
            ) : contacts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No contacts added yet</p>
            ) : (
              contacts.map((contact, index) => (
                <div key={contact.id || index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-gray-600">{contact.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => callContact(contact.phone)}
                      className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      title="Call contact"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteContact(index)}
                      className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                      title="Delete contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
