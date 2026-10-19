import type { LeadRequest } from "./lead";
import type { LeadRoute } from "./lead-routing";

export type LeadEmail = { to: string[]; subject: string; routing: string; summary: string; text: string; html: string };
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);

export function buildLeadEmail(lead: LeadRequest, route: LeadRoute, demo: boolean): LeadEmail {
  const subject = `${demo ? "[DEMO] " : ""}IMPORTANT — New Farmeralot lead: ${lead.location}`;
  const summary = `${lead.name}${lead.company ? ` from ${lead.company}` : ""}, based in ${lead.location}, is enquiring about: ${lead.request} Contact: ${lead.phone} · ${lead.email}.`;
  const customer = [["Name", lead.name], ["Company / farm", lead.company || "Not provided"], ["Location", lead.location], ["Contact via phone", lead.phone], ["Email", lead.email]];
  const transcript = lead.messages.map(({ role, content }) => `${role === "user" ? "Customer" : "Farmeralot assistant"}: ${content}`).join("\n\n");
  const text = [subject, ...(demo ? ["DEMO PREVIEW — no email sent or lead saved."] : []), `To: ${route.to.join(", ")}`, `Routing: ${route.reason}`, "", "CUSTOMER", ...customer.map(([label, value]) => `${label}: ${value}`), "", "ENQUIRY", `Interested in: ${lead.request}`, "", `Summary: ${summary}`, ...(transcript ? ["", "CONVERSATION", transcript] : [])].join("\n");
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head><body style="margin:0;background:#f4f2ec;padding:24px;font-family:Arial,sans-serif;color:#25271f"><main style="max-width:680px;margin:auto;background:white;padding:30px;border-radius:12px;line-height:1.65">
    ${demo ? '<p style="color:#87532c;background:#fff2df;padding:12px"><b>DEMO PREVIEW — no email sent or lead saved.</b></p>' : ""}
    <p style="font-size:12px;color:#73766c">To: ${escapeHtml(route.to.join(", "))}</p><h1 style="font-size:21px;color:#a9472b">NEW WEBSITE LEAD — ACTION REQUIRED</h1>
    <p style="background:#fff4dd;padding:10px 12px"><b>Routing:</b> ${escapeHtml(route.reason)}</p><h2 style="font-size:17px">Customer</h2>
    ${customer.map(([label, value]) => `<p><b>${label}:</b> ${escapeHtml(value)}</p>`).join("")}
    <h2 style="font-size:17px">Enquiry</h2><p><b>Interested in:</b> ${escapeHtml(lead.request).replace(/\n/g, "<br>")}</p><p><b>Summary:</b> ${escapeHtml(summary).replace(/\n/g, "<br>")}</p>
    ${transcript ? `<h2 style="font-size:17px">Conversation</h2><p style="white-space:pre-wrap">${escapeHtml(transcript)}</p>` : ""}
    <hr style="border:0;border-top:1px solid #eee"><p style="font-size:12px;color:#73766c">Farmeralot · Fast parts for farmlands</p></main></body></html>`;
  return { to: route.to, subject, routing: route.reason, summary, text, html };
}
