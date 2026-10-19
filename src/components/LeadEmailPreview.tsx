"use client";

import { useState } from "react";
import type { LeadDetails } from "@/lib/lead";
import type { LeadEmail } from "@/lib/lead-email";

export function LeadEmailPreview({ email, lead, onEdit, onReset }: { email: LeadEmail; lead: LeadDetails; onEdit: () => void; onReset: () => void }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  function download() {
    const url = URL.createObjectURL(new Blob([email.html], { type: "text/html;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = "farmeralot-demo-lead.html"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <div className="assistant-preview">
    <div className="assistant-preview-status" role="status"><b>Your demo lead is ready.</b><span>No email has been sent and no lead has been saved.</span></div>
    <article className="lead-email-card" aria-label="Lead email preview">
      <span className="eyebrow">Email preview</span><p className="lead-email-to"><b>To:</b> {email.to.join(", ")}</p><p className="lead-email-subject">{email.subject}</p>
      <h3>NEW WEBSITE LEAD — ACTION REQUIRED</h3><p className="lead-email-routing"><b>Routing:</b> {email.routing}</p>
      <h4>Customer</h4><dl>{[["Name", lead.name], ["Company / farm", lead.company || "Not provided"], ["Location", lead.location], ["Contact via phone", lead.phone], ["Email", lead.email]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <h4>Enquiry</h4><p><b>Interested in:</b> {lead.request}</p><p><b>Summary:</b> {email.summary}</p><footer>Farmeralot · Fast parts for farmlands</footer>
    </article>
    <div className="assistant-preview-actions"><button type="button" className="assistant-quote-submit" onClick={download}>Download email preview ↓</button><button type="button" onClick={async () => { try { await navigator.clipboard.writeText(email.text); setCopied(true); setCopyError(false); } catch { setCopyError(true); } }}>{copied ? "Summary copied" : "Copy lead summary"}</button><button type="button" onClick={onEdit}>Edit details</button><button type="button" onClick={onReset}>Start another enquiry</button></div>
    {copyError && <details open><summary>Select and copy the lead text</summary><pre className="lead-copy-text">{email.text}</pre></details>}
  </div>;
}
