import { NextResponse } from "next/server";
import { admin } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  try {
    const { token, title, body } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const message = {
      notification: {
        title: title || "ELARA Alert",
        body: body || "A new sky event is happening!",
      },
      token: token,
      webpush: {
        fcm_options: {
          link: "https://elara-space.vercel.app/events",
        },
      },
    };

    const response = await admin.messaging().send(message);
    
    return NextResponse.json({ success: true, response });
  } catch (error: any) {
    console.error("FCM Send Error:", error);
    return NextResponse.json({ error: error.message || "Failed to send notification" }, { status: 500 });
  }
}
