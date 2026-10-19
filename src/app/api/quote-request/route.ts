import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REQUEST_LIMIT = 5;
const WINDOW_MS = 60_000;
const requestWindows = new Map<string, { startedAt: number; count: number }>();

type QuoteMessage = {
  role: "user" | "assistant";
  content: string;
};

type QuoteRequest = {
  name: string;
  email: string;
  phone: string;
  location: string;
  request: string;
  messages: QuoteMessage[];
};

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return character;
    }
  });
}

function isRateLimited(request: NextRequest): boolean {
  const address =
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const now = Date.now();

  for (const [key, window] of requestWindows) {
    if (now - window.startedAt >= WINDOW_MS) requestWindows.delete(key);
  }

  const current = requestWindows.get(address);
  if (!current || now - current.startedAt >= WINDOW_MS) {
    requestWindows.set(address, { startedAt: now, count: 1 });
    return false;
  }

  current.count += 1;
  return current.count > REQUEST_LIMIT;
}

function readQuoteRequest(value: unknown): QuoteRequest | null {
  if (typeof value !== "object" || value === null) return null;
  const body = value as Record<string, unknown>;
  const stringFields = ["name", "email", "phone", "location", "request"] as const;
  const limits = { name: 120, email: 254, phone: 40, location: 120, request: 1500 };

  for (const field of stringFields) {
    const fieldValue = body[field];
    if (
      typeof fieldValue !== "string" ||
      fieldValue.trim().length === 0 ||
      fieldValue.length > limits[field]
    ) {
      return null;
    }
  }

  const email = (body.email as string).trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  if (!Array.isArray(body.messages) || body.messages.length > 8) return null;

  const messages: QuoteMessage[] = [];
  for (const message of body.messages) {
    if (
      typeof message !== "object" ||
      message === null ||
      !("role" in message) ||
      !("content" in message) ||
      (message.role !== "user" && message.role !== "assistant") ||
      typeof message.content !== "string" ||
      message.content.trim().length === 0 ||
      message.content.length > 1000
    ) {
      return null;
    }
    messages.push({ role: message.role, content: message.content.trim() });
  }

  if (!messages.some((message) => message.role === "user")) return null;

  return {
    name: (body.name as string).trim(),
    email,
    phone: (body.phone as string).trim(),
    location: (body.location as string).trim(),
    request: (body.request as string).trim(),
    messages,
  };
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 16_000) {
    return NextResponse.json({ error: "Your request is too long." }, { status: 413 });
  }

  if (isRateLimited(request)) {
    return NextResponse.json(
      { error: "Please wait a minute before sending another quote request." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Please send a valid quote request.");
  }

  const quote = readQuoteRequest(body);
  if (!quote) {
    return badRequest("Please complete each field with valid details.");
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const recipients = process.env.SALES_EMAIL_TO?.split(",").map((email) => email.trim()).filter(Boolean);
  if (!apiKey || !from || !recipients?.length) {
    return NextResponse.json(
      { error: "Quote email is not configured yet. Please contact the Farmalot team directly." },
      { status: 503 },
    );
  }

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from.replace(/^.*<([^<>]+)>$/, "$1")) ||
    recipients.some((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  ) {
    console.error("Quote email configuration contains an invalid sender or sales recipient.");
    return NextResponse.json(
      { error: "Quote email is not configured correctly. Please contact the Farmalot team." },
      { status: 503 },
    );
  }

  const transcript = quote.messages
    .map(({ role, content }) => `${role === "user" ? "Customer" : "Farmalot assistant"}: ${content}`)
    .join("\n\n");
  const safeTranscript = quote.messages
    .map(
      ({ role, content }) =>
        `<p style="margin:0 0 12px"><b>${role === "user" ? "Customer" : "Farmalot assistant"}:</b> ${escapeHtml(content).replace(/\n/g, "<br>")}</p>`,
    )
    .join("");
  const location = escapeHtml(quote.location);
  const text = [
    `IMPORTANT — New Farmalot lead: ${quote.location}`,
    "",
    "Routing: Central sales inbox (regional representative routing is not configured yet).",
    "",
    "CUSTOMER",
    `Name: ${quote.name}`,
    `Email: ${quote.email}`,
    `Phone: ${quote.phone}`,
    `Location: ${quote.location}`,
    "",
    "ENQUIRY",
    "Interested in:",
    quote.request,
    "",
    "Conversation summary:",
    transcript,
    "",
    "Regional routing can be enabled once the sales representatives and their covered areas are confirmed.",
  ].join("\n");
  const html = `
    <div style="font-family:Arial,sans-serif;color:#181a16;line-height:1.55;max-width:720px">
      <h2 style="margin:0 0 18px;color:#a9472b">IMPORTANT — New Farmalot lead: ${location}</h2>
      <p style="padding:10px 12px;background:#fff4dd"><b>Routing:</b> Central sales inbox. Regional representative routing is not configured yet.</p>
      <h3 style="margin:24px 0 10px">Customer</h3>
      <p><b>Name:</b> ${escapeHtml(quote.name)}</p>
      <p><b>Email:</b> <a href="mailto:${escapeHtml(quote.email)}">${escapeHtml(quote.email)}</a></p>
      <p><b>Contact via phone:</b> ${escapeHtml(quote.phone)}</p>
      <p><b>Location:</b> ${location}</p>
      <h3 style="margin:24px 0 10px">Enquiry</h3>
      <p><b>Interested in:</b> ${escapeHtml(quote.request).replace(/\n/g, "<br>")}</p>
      <h4 style="margin:20px 0 8px">Conversation summary</h4>
      ${safeTranscript}
      <hr style="margin:24px 0;border:0;border-top:1px solid #ddd">
      <p style="color:#777;font-size:12px">Regional lead routing can be enabled when the sales representatives and their covered areas are confirmed.</p>
      <p style="color:#777;font-size:12px">Farmeralot · Fast parts for farmlands</p>
    </div>`;

  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: recipients,
        reply_to: quote.email,
        subject: `IMPORTANT — New Farmalot lead: ${quote.location.replace(/[\r\n]+/g, " ").slice(0, 120)}`,
        text,
        html,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    console.error("Sending Farmalot quote email failed.", error);
    return NextResponse.json(
      { error: "We couldn't send your quote request just now. Please try again." },
      { status: 502 },
    );
  }

  if (!response.ok) {
    console.error(`Quote email provider returned HTTP ${response.status}.`);
    return NextResponse.json(
      { error: "We couldn't send your quote request just now. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
