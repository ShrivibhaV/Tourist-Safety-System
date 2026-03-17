import { NextResponse } from "next/server"
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { policeId, password } = body

    // Validate input format
    const policeIdRegex = /^[a-zA-Z0-9]{6,12}$/
    if (!policeIdRegex.test(policeId) || password.length < 6) {
      return NextResponse.json({ error: "Invalid format" }, { status: 400 })
    }

    // Mock authentication logic
    // In a real app, you would check against a database
    // For demo purposes, we'll accept any valid format

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
