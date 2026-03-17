import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
const CATEGORY_MAP: Record<string, string> = {
  police: "service.police",
  hospital: "healthcare.hospital",
  atm: "finance.atm",
  cafe: "catering.cafe",
  hotel: "accommodation.hotel",
  restaurant: "catering.restaurant",
  safe: "catering.cafe,accommodation.hotel,finance.atm"
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const type = searchParams.get("type") || "safe";

    if (!lat || !lon || !type) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const apiKey = process.env.GEOAPIFY_API_KEY;

    const category = CATEGORY_MAP[type] || CATEGORY_MAP["safe"];

    const url = `https://api.geoapify.com/v2/places?categories=${type}&filter=circle:${lon},${lat},3000&limit=10&apiKey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    return NextResponse.json({ results: data.features },{status:200});
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
