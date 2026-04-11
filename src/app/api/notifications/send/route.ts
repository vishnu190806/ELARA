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
        fcmOptions: {
          link: "https://elara-space.vercel.app/events",
        },
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await admin.messaging().send(message as any);
    
    return NextResponse.json({ success: true, response });
  } catch (error) {
    console.error("FCM Send Error:", error);
    return NextResponse.json({ error: (error as Error).message || "Failed to send notification" }, { status: 500 });
  }
}
