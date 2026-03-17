// app/api/share-location/route.ts

// Add this at the top to tell Next.js this is a dynamic route
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Now you can safely use searchParams
    const searchParams = request.nextUrl.searchParams;
    const touristId = searchParams.get('touristId');
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');

    if (!touristId || !latitude || !longitude) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Your share location logic here
    // For example, generate a shareable link
    const shareableLink = `https://yourdomain.com/location/${touristId}?lat=${latitude}&lng=${longitude}`;

    return NextResponse.json({
      success: true,
      data: {
        shareableLink,
        touristId,
        coordinates: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        }
      }
    });

  } catch (error) {
    console.error('Share location error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to share location' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { touristId, latitude, longitude } = body;

    if (!touristId || !latitude || !longitude) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate shareable link
    const shareableLink = `https://yourdomain.com/location/${touristId}?lat=${latitude}&lng=${longitude}`;

    return NextResponse.json({
      success: true,
      data: {
        shareableLink,
        touristId,
        coordinates: { latitude, longitude }
      }
    });

  } catch (error) {
    console.error('Share location error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to share location' },
      { status: 500 }
    );
  }
}