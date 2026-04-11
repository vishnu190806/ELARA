import { NextResponse } from "next/server";
import { adminDb, admin } from "@/lib/firebase/admin";

const SPACE_DEVS_URL = "https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=5";

export async function GET(request: Request) {
  // Simple auth check using a secret header (Vercel Cron style)
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // 1. Fetch upcoming events
    const res = await fetch(SPACE_DEVS_URL);
    if (!res.ok) throw new Error("Failed to fetch Space Devs");
    const data = await res.json();

    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    // 2. Filter for events in the next hour
    const upcomingEvents = data.results.filter((event: any) => {
      const eventTime = new Date(event.net || event.window_start);
      return eventTime > now && eventTime <= oneHourFromNow;
    });

    if (upcomingEvents.length === 0) {
      return NextResponse.json({ message: "No events in the next hour" });
    }

    // 3. Get all subbed tokens
    const snapshot = await adminDb.collection("subscriptions").get();
    const tokens = snapshot.docs.map(doc => doc.data().token);

    if (tokens.length === 0) {
      return NextResponse.json({ message: "No subscribers found" });
    }

    // 4. Send notifications
    const sentCount = 0;
    for (const event of upcomingEvents) {
      const title = `🚀 Launch Alert: ${event.name}`;
      const body = `${event.launch_service_provider.name} is launching from ${event.pad.location.name} in less than an hour!`;

      // Multicast to all tokens
      const message = {
        notification: { title, body },
        tokens: tokens,
        webpush: {
          fcm_options: {
            link: `https://elara-space.vercel.app/events/${event.id}`,
          },
        },
      };

      await admin.messaging().sendEachForMulticast(message);
    }

    return NextResponse.json({ 
      success: true, 
      eventsChecked: upcomingEvents.length,
      subscribersNotified: tokens.length 
    });

  } catch (error: any) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
