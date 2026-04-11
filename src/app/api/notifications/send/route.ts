import { NextResponse } from "next/server";
import { admin } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  try {
    // SECURITY: Authenticate before sending
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Unauthorized: Missing Bearer token" }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    try {
      await admin.auth().verifyIdToken(idToken);
    } catch (e) {
      console.error("Auth Token Verification Failed:", e);
      return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
    }

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
          link: `${process.env.NEXT_PUBLIC_APP_URL || "https://elara-space.vercel.app"}/events`,
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
