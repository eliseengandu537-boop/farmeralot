"use client";

import { useRef, useState, type FormEvent } from "react";
import { leadLimits, type LeadDetails, type LeadMessage } from "@/lib/lead";
import type { LeadEmail } from "@/lib/lead-email";
import { LeadEmailPreview } from "@/components/LeadEmailPreview";

const fields: { field: keyof LeadDetails; label: string; autoComplete: string; type?: string }[] = [
  { field: "name", label: "Your name", autoComplete: "name" },
  { field: "company", label: "Company or farm (optional)", autoComplete: "organization" },
  { field: "location", label: "Town / suburb and province", autoComplete: "address-level2" },
  { field: "email", label: "Email address", autoComplete: "email", type: "email" },
  { field: "phone", label: "Phone number", autoComplete: "tel", type: "tel" },
];

export function AssistantLeadForm({ initial, messages, demo, onReset }: { initial: LeadDetails; messages: LeadMessage[]; demo: boolean; onReset: () => void }) {
  const [lead, setLead] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<LeadEmail | null>(null);
  const [sent, setSent] = useState(false);
  const submissionRef = useRef("");
  const busyRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  function showTop() {
    requestAnimationFrame(() => { const transcript = rootRef.current?.closest(".assistant-transcript"); if (transcript) transcript.scrollTop = 0; rootRef.current?.focus(); });
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busyRef.current || sent) return;
    busyRef.current = true; setBusy(true); setError("");
    submissionRef.current ||= crypto.randomUUID();
    try {
      const response = await fetch("/api/quote-request", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": submissionRef.current }, body: JSON.stringify({ ...lead, messages: messages.slice(-24) }), signal: AbortSignal.timeout(20_000) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We couldn’t prepare your enquiry. Please try again.");
      if (result.status === "preview" && result.email && Array.isArray(result.email.to) && typeof result.email.html === "string" && typeof result.email.text === "string") setPreview(result.email);
      else if (!demo && result.status === "sent") setSent(true);
      else throw new Error("We couldn’t confirm the result. Please try again.");
      showTop();
    } catch (cause) { setError(cause instanceof Error && cause.name !== "TimeoutError" ? cause.message : "The request timed out. Your details are still here; please try again."); }
    finally { setBusy(false); busyRef.current = false; }
  }
  return <div ref={rootRef} tabIndex={-1} className="assistant-lead-stage">
    {preview ? <LeadEmailPreview email={preview} lead={lead} onEdit={() => { setPreview(null); showTop(); }} onReset={onReset} /> : sent ? <div className="assistant-quote-success" role="status"><b>Enquiry submitted.</b><span>Your enquiry has been accepted by our email service for the sales team to follow up.</span><button type="button" className="assistant-quote-trigger" onClick={onReset}>Start another enquiry</button></div> : <form className="assistant-quote-form" onSubmit={(event) => void submit(event)}>
      <div><span className="eyebrow">Check your enquiry</span><h3>Let’s get the details right.</h3><p>{demo ? "Review the details, then see the email the admin would receive." : "Confirm your details and send your enquiry to our sales team."}</p></div>
      {fields.map(({ field, label, autoComplete, type }) => <label key={field}>{label}<input name={field} autoComplete={autoComplete} type={type || "text"} required={field !== "company"} maxLength={leadLimits[field]} value={lead[field]} onChange={(event) => { setLead({ ...lead, [field]: event.target.value }); submissionRef.current = ""; }} /></label>)}
      <label>What do you need?<textarea name="request" required rows={3} maxLength={leadLimits.request} value={lead.request} onChange={(event) => { setLead({ ...lead, request: event.target.value }); submissionRef.current = ""; }} /></label>
      <p className="assistant-quote-privacy">{demo ? "Demo only. Use sample details. Nothing is emailed or saved." : "By sending this enquiry, you ask the Farmeralot team to contact you about your request."}</p>
      {error && <p className="assistant-error" role="alert">{error}</p>}<button className="assistant-quote-submit" type="submit" disabled={busy}>{busy ? (demo ? "Preparing preview…" : "Sending enquiry…") : (demo ? "Preview lead email" : "Send enquiry")}</button>
    </form>}
  </div>;
}
