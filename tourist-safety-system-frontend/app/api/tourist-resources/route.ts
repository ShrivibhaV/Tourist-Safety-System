export async function GET(request: Request) {
  const resources = {
    helplines: [
      {
        name: "Tourist Helpline",
        number: "+91-11-2332-0005",
        available: "24/7",
        description: "Official tourist assistance",
      },
      {
        name: "Women Safety Helpline",
        number: "+91-8274-930-930",
        available: "24/7",
        description: "Women-specific safety support",
      },
      {
        name: "Police Emergency",
        number: "100",
        available: "24/7",
        description: "Police assistance",
      },
      {
        name: "Ambulance",
        number: "102",
        available: "24/7",
        description: "Medical emergency",
      },
    ],
    embassies: [
      {
        country: "United States",
        city: "New Delhi",
        phone: "+91-11-2419-8000",
        address: "Shantipath, Chanakyapuri",
      },
      {
        country: "United Kingdom",
        city: "New Delhi",
        phone: "+91-11-4119-2100",
        address: "Shantipath, Chanakyapuri",
      },
      {
        country: "Canada",
        city: "New Delhi",
        phone: "+91-11-4178-2000",
        address: "7/8 Shantipath, Chanakyapuri",
      },
    ],
    safetyTips: [
      "Keep emergency numbers saved in your phone",
      "Share your itinerary with someone you trust",
      "Avoid traveling alone at night",
      "Use registered taxis or ride-sharing apps",
      "Keep copies of important documents",
      "Stay aware of your surroundings",
      "Use hotel safes for valuables",
      "Register with your embassy",
    ],
    nearbyAlerts: [
      {
        id: 1,
        type: "Traffic Congestion",
        location: "Connaught Place",
        severity: "low",
        time: "2 hours ago",
      },
      {
        id: 2,
        type: "Weather Alert",
        location: "Delhi NCR",
        severity: "medium",
        time: "30 minutes ago",
      },
    ],
  }

  return Response.json(resources)
}
