import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  try {
    const { token, userId, preferences } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Reference to the subscriptions collection
    // We update the token if it already exists or add a new one
    const subRef = adminDb.collection("subscriptions").doc(token);
    
    await subRef.set({
      token,
      userId: userId || "anonymous",
      preferences: preferences || {
        allEvents: true,
        launches: true,
        isroOnly: false,
      },
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    return NextResponse.json({ success: true, message: "Subscribed successfully" });
  } catch (error) {
    console.error("Subscription Error:", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
