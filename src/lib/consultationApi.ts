/**
 * Client helper functions for NavOk Heal Consultation Backend API
 */

export interface StartConsultationOptions {
  patientId?: string;
  type: "video" | "voice" | "chat";
  language?: string;
}

export interface StartConsultationResponse {
  success: boolean;
  sessionId: string;
}

export interface ProcessTurnOptions {
  sessionId: string;
  text: string;
  attachments?: Array<{ id: string; name: string; url?: string; type: string }>;
  history?: Array<{ role: string; content: string }>;
  emergencyNumber?: string;
  turnCount?: number;
  forceSummary?: boolean;
  isElderlyMode?: boolean;
}

import type { ConsultationSummaryData } from "@/components/consultation/SummaryReport";

export interface ProcessTurnResponse {
  type: "question" | "summary" | "emergency";
  message: string;
  structured?: ConsultationSummaryData;
}

export async function startConsultation(options: StartConsultationOptions): Promise<StartConsultationResponse> {
  try {
    const res = await fetch("/api/consultation/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn("startConsultation API call failed, using client fallback ID", error);
    return {
      success: true,
      sessionId: `consultation_${Date.now()}`,
    };
  }
}

export async function processTurn(options: ProcessTurnOptions): Promise<ProcessTurnResponse> {
  try {
    const res = await fetch("/api/consultation/process-turn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn("processTurn API call failed", error);
    return {
      type: "question",
      message: "I am having trouble connecting right now, but please continue describing your symptoms.",
    };
  }
}

export async function endConsultation(sessionId: string, summary?: ConsultationSummaryData | Record<string, unknown> | null): Promise<void> {
  try {
    await fetch("/api/consultation/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, summary }),
    });
  } catch (error) {
    console.warn("endConsultation API call failed", error);
  }
}
