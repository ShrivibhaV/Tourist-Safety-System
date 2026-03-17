"use client"

import { Lightbulb, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

export function SafetyTips() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const tips = [
    {
      title: "Keep Emergency Numbers Ready",
      description: "Save Police (100), Ambulance (102), Fire (101), and Tourist Helpline (1363) in your phone.",
      icon: "📱",
    },
    {
      title: "Stay Connected",
      description: "Keep your phone charged and share your location with trusted contacts regularly.",
      icon: "📍",
    },
    {
      title: "Avoid Isolated Areas",
      description: "Stick to well-lit, populated areas, especially during evening hours.",
      icon: "🌙",
    },
    {
      title: "Use Registered Taxis",
      description: "Use official taxis, Uber, or Ola instead of unmarked vehicles.",
      icon: "🚕",
    },
    {
      title: "Keep Valuables Secure",
      description: "Don't display expensive items. Keep documents and money in safe places.",
      icon: "💼",
    },
    {
      title: "Trust Your Instincts",
      description: "If something feels wrong, remove yourself from the situation immediately.",
      icon: "🧠",
    },
  ]

  const nextTip = () => {
    setCurrentIndex((prev) => (prev + 1) % tips.length)
  }

  const prevTip = () => {
    setCurrentIndex((prev) => (prev - 1 + tips.length) % tips.length)
  }

  return (
    <div className="mt-16 pt-8 border-t-2 border-gray-200">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-900">Safety Tips for Tourists in India</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={prevTip} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <button onClick={nextTip} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tips.map((tip, index) => (
          <div
            key={index}
            className={`bg-white border-2 rounded-xl p-6 transition-all transform ${
              index === currentIndex ? "border-blue-500 shadow-lg scale-105" : "border-gray-200 opacity-50"
            }`}
          >
            <div className="text-4xl mb-4">{tip.icon}</div>
            <h3 className="font-bold text-gray-900 mb-2 text-lg">{tip.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{tip.description}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2 mt-8">
        {tips.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex ? "bg-blue-600 w-8" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
