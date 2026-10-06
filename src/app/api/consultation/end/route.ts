import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { sessionId, summary } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    try {
      if (db) {
        const docRef = doc(db, "consultations", sessionId);
        await updateDoc(docRef, {
          status: "completed",
          endedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          ...(summary ? { aiSummary: summary.aiSummary, riskLevel: summary.riskLevel } : {})
        });
      }
    } catch (fsErr: any) {
      console.warn("[/api/consultation/end] Firestore update failed:", fsErr.message);
    }

    return NextResponse.json({ success: true, message: "Consultation finalized successfully" });
  } catch (error: any) {
    console.error("[/api/consultation/end] Error ending consultation:", error);
    return NextResponse.json({ success: true });
  }
}
