"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, QrCode, Fingerprint, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"


export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nationality: "",
    idType: "Passport",
    passportNumber: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    preferredLanguage: "en",
    photo: null as File | null,
  })
  const [digitalId, setDigitalId] = useState("")
  const [digitalIdentityHash, setDigitalIdentityHash] = useState("")
  const [qrCode, setQrCode] = useState("")
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)


  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = async () => {
    if (step < 4) {
      if (step === 2) {
        try {
          // Generate Blockchain Hash (Name + ID Number)
          const generatedHash = Array.from(formData.firstName + formData.lastName + formData.passportNumber).reduce((hash, char) => {
            return ((hash << 5) - hash) + char.charCodeAt(0) | 0;
          }, 0).toString(16).repeat(8).substring(0, 64);

          // Generate Deterministic Tourist ID from Hash
          const generatedTouristId = `TST-${new Date().getFullYear()}-${generatedHash.substring(0, 6).toUpperCase()}`;

          // Prepare payload
          const payload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            nationality: formData.nationality,
            idType: formData.idType,
            idNumber: formData.passportNumber, // Mapping passportNumber to idNumber
            emergencyContactName: formData.emergencyContactName,
            emergencyContactPhone: formData.emergencyContactPhone,
            preferredLanguage: formData.preferredLanguage,
            digitalIdentityHash: generatedHash, // Send the hash to backend
            touristId: generatedTouristId, // Send the generated ID
            // photo: skip for now as backend expects URL
          };

          console.log('Sending registration payload:', payload);

          const response = await fetch('http://localhost:5000/api/tourists/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          const result = await response.json();

          console.log('Registration response:', result);

          if (!result.success) {
            // Show specific error message from backend
            console.error('Registration failed:', result);
            alert(`Registration Error: ${result.message || "Registration failed"}`);
            return;
          }

          // Auto-login: Store user data in localStorage
          localStorage.setItem('touristId', result.data.id);
          localStorage.setItem('touristEmail', result.data.email);
          localStorage.setItem('touristName', `${formData.firstName} ${formData.lastName}`);
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('digitalId', generatedTouristId);
          localStorage.setItem('digitalIdentityHash', generatedHash);

          // Store photo as base64 for profile display
          if (formData.photo) {
            const reader = new FileReader();
            reader.onloadend = () => {
              localStorage.setItem('userPhoto', reader.result as string);
            };
            reader.readAsDataURL(formData.photo);
          }

          // Set state for display
          setDigitalId(generatedTouristId)
          setDigitalIdentityHash(generatedHash)
          setQrCode(
            `data:image/svg+xml,${encodeURIComponent(`
            <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
              <rect width="200" height="200" fill="white"/>
              <rect x="20" y="20" width="20" height="20" fill="black"/>
              <rect x="60" y="20" width="20" height="20" fill="black"/>
              <rect x="100" y="20" width="20" height="20" fill="black"/>
              <rect x="140" y="20" width="20" height="20" fill="black"/>
              <rect x="20" y="60" width="20" height="20" fill="black"/>
              <rect x="100" y="60" width="20" height="20" fill="black"/>
              <rect x="180" y="60" width="20" height="20" fill="black"/>
              <rect x="60" y="100" width="20" height="20" fill="black"/>
              <rect x="140" y="100" width="20" height="20" fill="black"/>
              <rect x="20" y="140" width="20" height="20" fill="black"/>
              <rect x="60" y="140" width="20" height="20" fill="black"/>
              <rect x="100" y="140" width="20" height="20" fill="black"/>
              <rect x="180" y="140" width="20" height="20" fill="black"/>
              <rect x="20" y="180" width="20" height="20" fill="black"/>
              <rect x="100" y="180" width="20" height="20" fill="black"/>
              <rect x="140" y="180" width="20" height="20" fill="black"/>
              <text x="100" y="210" textAnchor="middle" fontSize="12" fill="black">${generatedTouristId}</text>
            </svg>
          `)}`,
          )
          setStep(step + 1)
        } catch (error) {
          console.error("Registration error:", error);
          alert("An error occurred during registration. Please check your connection.");
        }
      } else {
        setStep(step + 1)
      }
    }
  }

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, photo: file }))
      const previewURL = URL.createObjectURL(file)
      setPhotoPreview(previewURL)
    }
  }
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }))
      setPhotoPreview(URL.createObjectURL(file))
    }
  }



  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 max-w-2xl py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 gradient-primary rounded-xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient">Digital Tourist ID Registration</h1>
              <p className="text-muted-foreground">Secure blockchain-based identification system</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-12">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-professional ${stepNumber <= step
                  ? "gradient-primary text-white"
                  : "bg-muted text-muted-foreground border-2 border-border"
                  }`}
              >
                {stepNumber < step ? <CheckCircle className="h-5 w-5" /> : stepNumber}
              </div>
              {stepNumber < 4 && (
                <div className={`w-20 h-2 mx-3 rounded-full ${stepNumber < step ? "gradient-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Personal Information */}
        {step === 1 && (
          <Card className="shadow-professional border-primary/10">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl text-foreground">Personal Information</CardTitle>
              <CardDescription className="text-lg">
                Please provide your basic personal details for ID generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => handleInputChange("nationality", e.target.value)}
                    placeholder="Enter your nationality"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idType">ID Type</Label>
                  <Select
                    value={formData.idType}
                    onValueChange={(value) => handleInputChange("idType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ID Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Passport">Passport</SelectItem>
                      <SelectItem value="Aadhar">Aadhar</SelectItem>
                      <SelectItem value="OtherNationalID">Other National ID</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passportNumber">ID Number</Label>
                  <Input
                    id="passportNumber"
                    value={formData.passportNumber}
                    onChange={(e) => handleInputChange("passportNumber", e.target.value)}
                    placeholder="Enter your ID number"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="photo">Upload Your Photo</Label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp,image/svg+xml"
                    onChange={handlePhotoChange}
                    className="w-full border border-gray-300 p-2 rounded"
                  />

                  {formData.photo && (
                    <img
                      src={URL.createObjectURL(formData.photo)}
                      alt="Preview"
                      className="mt-4 w-32 h-32 object-cover rounded-full border"
                    />
                  )}

                </div>
              </div>


              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleNext}
                  className="gradient-primary hover:opacity-90 shadow-professional px-8 py-3"
                >
                  Next Step
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Emergency Contact */}
        {step === 2 && (
          <Card className="shadow-professional border-primary/10">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl text-foreground">Emergency Contact Information</CardTitle>
              <CardDescription className="text-lg">
                Provide emergency contact details for safety purposes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                <Input
                  id="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                  placeholder="Full name of emergency contact"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                <Input
                  id="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                  placeholder="+1 (555) 987-6543"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredLanguage">Preferred Language</Label>
                <Select
                  value={formData.preferredLanguage}
                  onValueChange={(value) => handleInputChange("preferredLanguage", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your preferred language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                    <SelectItem value="ko">한국어</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handlePrevious} className="border-primary/20 bg-transparent">
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  className="gradient-primary hover:opacity-90 shadow-professional px-8 py-3"
                >
                  Generate Digital ID
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: ID Generation */}
        {step === 3 && (
          <Card className="shadow-professional border-primary/10">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl text-foreground flex items-center gap-3">
                <div className="p-2 gradient-primary rounded-lg">
                  <Fingerprint className="h-6 w-6 text-white" />
                </div>
                Digital ID Generated
              </CardTitle>
              <CardDescription className="text-lg">
                Your secure digital tourist ID has been created and recorded on the blockchain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 gradient-primary rounded-full mb-6 shadow-professional">
                  <QrCode className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Your Digital Tourist ID</h3>
                <div className="text-3xl font-mono font-bold text-gradient mb-6">{digitalId}</div>
              </div>

              <div className="flex justify-center">
                <div className="bg-white p-6 rounded-xl shadow-professional border-2 border-primary/10">
                  {formData.photo && (
                    <div className="flex justify-center mb-6">
                      <img
                        src={URL.createObjectURL(formData.photo)}
                        alt="Tourist Photo"
                        width={120}
                        height={120}
                        className="rounded-full border shadow-professional"
                      />
                    </div>
                  )}

                </div>
              </div>

              <div className="bg-primary/5 p-6 rounded-xl border border-primary/20">
                <h4 className="font-bold text-lg text-foreground mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Blockchain Verification
                </h4>
                <p className="text-muted-foreground mb-3 leading-relaxed">
                  Your ID has been securely recorded on the blockchain with the following hash:
                </p>
                <code className="text-xs bg-background p-3 rounded-lg block break-all font-mono border">
                  {digitalIdentityHash}
                </code>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handlePrevious} className="border-primary/20 bg-transparent">
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  className="gradient-primary hover:opacity-90 shadow-professional px-8 py-3"
                >
                  Complete Registration
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Completion */}
        {step === 4 && (
          <Card className="shadow-professional border-success/20 bg-success/5">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl text-foreground flex items-center gap-3">
                <div className="p-2 bg-success rounded-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                Registration Complete
              </CardTitle>
              <CardDescription className="text-lg">
                Your digital tourist ID is now active and ready to use
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-success rounded-full mb-6 shadow-professional">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Welcome to SafeTour!</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Your digital tourist ID is now active. You can now access all safety features and services.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Next Steps</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Download the SafeTour mobile app</li>
                    <li>• Set up location sharing preferences</li>
                    <li>• Review safety zones in your area</li>
                    <li>• Test the emergency alert system</li>
                  </ul>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Your ID Details</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>
                      ID: <span className="font-mono">{digitalId}</span>
                    </div>
                    <div>
                      Status: <span className="text-green-600">Active</span>
                    </div>
                    <div>Language: {formData.preferredLanguage.toUpperCase()}</div>
                    <div>
                      Safety Score: <span className="text-accent">100</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  variant="outline"
                  className="border-primary/20 text-primary hover:bg-primary/5 flex-1 py-3 bg-transparent"
                >
                  {/* <Link href="app/T_Dashboard/page.tsx">View Dashboard</Link> */}
                  <Link href="/T_Dashboard">View Dashboard</Link>

                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        {/* <button
              onClick={() => router.push('/login')}
              className="w-full bg-linear-to-r from-blue-600 to-teal-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-teal-700 transition font-semibold shadow-lg"
            >
              Go to Login
            </button> */}
      </div>

    </div>
  )
}
