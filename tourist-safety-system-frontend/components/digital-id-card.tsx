import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, MapPin, Clock } from "lucide-react"
import type { Tourist } from "@/lib/types"
// import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react";


interface DigitalIdCardProps {
  tourist: Tourist
  showQR?: boolean
}

export function DigitalIdCard({ tourist, showQR = true }: DigitalIdCardProps) {
  const getSafetyScoreColor = (score: number) => {
    if (score >= 90) return "text-success"
    if (score >= 70) return "text-warning"
    return "text-destructive"
    
  }

  const getSafetyScoreBadge = (score: number) => {
    if (score >= 90) return "bg-success/10 text-success border-success/20"
    if (score >= 70) return "bg-warning/10 text-warning border-warning/20"
    return "bg-destructive/10 text-destructive border-destructive/20"
  }
  

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  useEffect(() => {
    if (tourist.photo instanceof File) {
      const preview = URL.createObjectURL(tourist.photo)
      setPhotoPreview(preview)
      return () => URL.revokeObjectURL(preview)
    } else if (typeof tourist.photo === "string") {
      setPhotoPreview(tourist.photo)
    } else {
      setPhotoPreview(null)
    }
  }, [tourist.photo])
  // const router = useRouter()
  // router.push(`/digital-id?photo=${encodeURIComponent(photoPreview ?? "")}`)

  // When file uploaded:


  return (
    <Card className="w-full max-w-md mx-auto gradient-primary text-white border-0 shadow-professional">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl text-white">SafeTour ID</span>
              <p className="text-white/80 text-sm">Digital Tourist Identification</p>
            </div>
          </div>
          <Badge className={`${getSafetyScoreBadge(tourist.safetyScore)} font-semibold`}>
            Score: {tourist.safetyScore}
          </Badge>
        </div>

        <div className="space-y-4 mb-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-1">
              {tourist.firstName} {tourist.lastName}
            </h3>
            <p className="text-white/80 text-lg">{tourist.nationality}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
              <span className="text-white/70 block mb-1">Tourist ID</span>
              <div className="font-mono font-bold text-white">{tourist.digitalId}</div>
            </div>
            <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
              <span className="text-white/70 block mb-1">Language</span>
              <div className="font-semibold text-white">{tourist.preferredLanguage.toUpperCase()}</div>
            </div>
          </div>

          {tourist.currentLocation && (
            <div className="flex items-center gap-2 text-sm bg-white/10 p-3 rounded-lg backdrop-blur-sm">
              <MapPin className="h-4 w-4 text-white/70 flex-shrink-0" />
              <span className="text-white/90 text-sm">
                {tourist.currentLocation.address ||
                  `${tourist.currentLocation.latitude.toFixed(4)}, ${tourist.currentLocation.longitude.toFixed(4)}`}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm bg-white/10 p-3 rounded-lg backdrop-blur-sm">
            <Clock className="h-4 w-4 text-white/70 flex-shrink-0" />
            <span className="text-white/90">Active since {new Date(tourist.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex justify-center mb-6">
  <div className="bg-white p-4 rounded-xl shadow-professional">
    <div className="w-28 h-28 bg-white rounded-lg overflow-hidden flex items-center justify-center border-2 border-border">
      {photoPreview ? (
        <img
          src={photoPreview}
          alt={`Photo of ${tourist.firstName}`}
          width={112}
          height={112}
          className="w-full h-full object-cover rounded"
        />
      ) : (
        <div className="text-gray-400 text-sm text-center">No photo</div>
      )}
    </div>
  </div>
</div>



        <div className="pt-4 border-t border-white/20 text-center">
          <p className="text-xs text-white/70 font-medium">🔒 Blockchain Verified • Secure • Tamper-proof</p>
        </div>
      </CardContent>
    </Card>
  )
}
