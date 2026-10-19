import { NextRequest, NextResponse } from "next/server";
import { isAssistantDemo } from "@/lib/assistant-config";
import { isEmail, readLead } from "@/lib/lead";
import { buildLeadEmail } from "@/lib/lead-email";
import { readRoutingConfig, resolveLeadRoute } from "@/lib/lead-routing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestWindows = new Map<string, { startedAt: number; count: number }>();
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

async function readBody(request: NextRequest): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) return null;
  const decoder = new TextDecoder();
  let size = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 48_000) { await reader.cancel(); throw new RangeError("Too large"); }
      text += decoder.decode(value, { stream: true });
    }
    return JSON.parse(text + decoder.decode());
  } finally { reader.releaseLock(); }
}

function rateLimited(request: NextRequest) {
  const now = Date.now();
  for (const [key, value] of requestWindows) if (now - value.startedAt > 60_000) requestWindows.delete(key);
  const key = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const value = requestWindows.get(key) || { startedAt: now, count: 0 };
  value.count++;
  // This local guard is not a substitute for a persistent limit before public live launch.
  if (requestWindows.size >= 10_000 && !requestWindows.has(key)) return true;
  requestWindows.set(key, value);
  return value.count > 5;
}

export async function POST(request: NextRequest) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return json({ error: "Please submit your enquiry from this website." }, 403);
  const demo = isAssistantDemo();
  if (!demo && rateLimited(request)) return json({ error: "Please wait a minute before sending another enquiry." }, 429);
  let body: unknown;
  try { body = await readBody(request); }
  catch (error) { return json({ error: error instanceof RangeError ? "Your enquiry is too long." : "Please send a valid enquiry." }, error instanceof RangeError ? 413 : 400); }
  const lead = readLead(body);
  if (!lead) return json({ error: "Please enter your name, location, a valid email and phone number, and the part or supply you need." }, 400);

  let email;
  try { email = buildLeadEmail(lead, resolveLeadRoute(lead.location, readRoutingConfig()), demo); }
  catch { return json({ error: "The sales inbox is not configured correctly. Please contact the team directly." }, 503); }

  // Server-controlled mode: clients cannot turn a presentation into a real send.
  if (demo) return json({ status: "preview", sent: false, email });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from || !isEmail(from.replace(/^.*<([^<>]+)>$/, "$1"))) return json({ error: "Email delivery is not configured yet. Please contact the team directly." }, 503);
  const idempotencyKey = request.headers.get("idempotency-key");
  if (!idempotencyKey || !/^[a-f\d-]{36}$/i.test(idempotencyKey)) return json({ error: "Please refresh the page before sending your enquiry." }, 400);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": `lead/${idempotencyKey}` },
      body: JSON.stringify({ from, to: email.to, reply_to: lead.email, subject: email.subject, text: email.text, html: email.html }),
      cache: "no-store", signal: AbortSignal.timeout(15_000),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || typeof result?.id !== "string" || !result.id) return json({ error: "The email service did not confirm your enquiry. Your details are still here; please retry." }, 502);
    return json({ status: "sent" });
  } catch { return json({ error: "We couldn’t confirm your enquiry just now. Please retry with the details below." }, 502); }
}
