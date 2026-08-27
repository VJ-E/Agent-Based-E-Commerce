import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import AnalyticsEvent from '@/models/AnalyticsEvent';
import { verifyToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await dbConnect();
    
    let events = await request.json();
    if (!Array.isArray(events)) {
      events = [events];
    }

    // Extract user ID from token if available
    const token = request.cookies.get('bentely_auth_token')?.value;
    let userId = null;
    if (token) {
      const payload = await verifyToken(token);
      if (payload && payload.userId) {
        userId = payload.userId;
      }
    }

    // Attach user ID and parse events
    const processedEvents = events.map(evt => ({
      userId: userId || undefined,
      sessionId: evt.sessionId,
      eventType: evt.eventType,
      eventData: evt.eventData || {},
      createdAt: evt.timestamp ? new Date(evt.timestamp) : new Date()
    }));

    // Insert to DB (do this in background for speed, but Next.js serverless needs it awaited)
    await AnalyticsEvent.insertMany(processedEvents);

    return NextResponse.json({ success: true, count: processedEvents.length }, { status: 200 });
  } catch (error) {
    console.error('Analytics Tracking Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
