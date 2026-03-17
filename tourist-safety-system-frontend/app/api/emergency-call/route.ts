import { NextResponse } from "next/server"
export const dynamic = 'force-dynamic';





let contactsStore: any[] = [] // Replace with DB later

export async function GET() {
  return NextResponse.json({ contacts: contactsStore })
}

export async function POST(req: Request) {
  const body = await req.json()
  const newContact = {
    id: Date.now().toString(),
    ...body
  }
  contactsStore.push(newContact)

  return NextResponse.json({ ok: true, contact: newContact })
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id")
  contactsStore = contactsStore.filter((c) => c.id !== id)

  return NextResponse.json({ ok: true })
}
