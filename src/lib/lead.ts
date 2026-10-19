export type LeadDetails = {
  name: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  request: string;
};

export type LeadMessage = { role: "user" | "assistant"; content: string };
export type LeadRequest = LeadDetails & { messages: LeadMessage[] };

export const emptyLead: LeadDetails = { name: "", company: "", email: "", phone: "", location: "", request: "" };
export const leadLimits = { name: 120, company: 160, email: 254, phone: 40, location: 160, request: 1500 };
export const isEmail = (value: string) => /^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/.test(value);
export const isPhone = (value: string) => /^[+\d\s().-]+$/.test(value) && value.replace(/\D/g, "").length >= 7 && value.replace(/\D/g, "").length <= 15;

export function readLead(value: unknown): LeadRequest | null {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  const details = { ...emptyLead };
  for (const field of Object.keys(emptyLead) as (keyof LeadDetails)[]) {
    const text = body[field] ?? (field === "company" ? "" : null);
    if (typeof text !== "string" || text.length > leadLimits[field] || (field !== "company" && !text.trim())) return null;
    if (field !== "request" && /[\r\n\x00-\x1f]/.test(text)) return null;
    details[field] = text.trim();
  }
  if (!isEmail(details.email) || !isPhone(details.phone)) return null;
  if (!Array.isArray(body.messages) || body.messages.length > 24) return null;
  const messages: LeadMessage[] = [];
  for (const item of body.messages) {
    if (!item || typeof item !== "object" || (item.role !== "user" && item.role !== "assistant") || typeof item.content !== "string" || !item.content.trim() || item.content.length > 1500) return null;
    messages.push({ role: item.role, content: item.content.trim() });
  }
  return { ...details, messages };
}
