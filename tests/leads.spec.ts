import { expect, test } from "@playwright/test";
import { NextRequest } from "next/server";
import { POST as submitLead } from "../src/app/api/quote-request/route";
import { POST as askAssistant } from "../src/app/api/assistant/route";
import { resolveLeadRoute, type RoutingConfig } from "../src/lib/lead-routing";
import { readLead, type LeadRequest } from "../src/lib/lead";
import { buildLeadEmail } from "../src/lib/lead-email";

const sample: LeadRequest = { name: "Demo Farmer", company: "Example Farm", email: "farmer@example.com", phone: "0120000000", location: "Pretoria, Gauteng", request: "Two alternators for a tractor. Please confirm fitment.", messages: [{ role: "user", content: "I need two alternators." }] };
const config: RoutingConfig = { admin: ["eliseenweb@gmail.com"], enabled: true, territories: [{ name: "Pretoria rep", email: "pretoria@example.com", areas: ["Pretoria", "Tshwane"] }, { name: "Cape Town rep", email: "cape@example.com", areas: ["Cape Town"] }] };
const originalFetch = globalThis.fetch;
const names = ["ASSISTANT_MODE", "RESEND_API_KEY", "RESEND_FROM_EMAIL", "SALES_EMAIL_TO", "SALES_ROUTING_ENABLED", "SALES_REP_ROUTES_JSON", "OPENAI_API_KEY"];
const saved = Object.fromEntries(names.map((name) => [name, process.env[name]]));
test.beforeEach(() => { process.env.ASSISTANT_MODE = "demo"; process.env.SALES_ROUTING_ENABLED = "false"; process.env.SALES_EMAIL_TO = "eliseenweb@gmail.com"; });
test.afterEach(() => { globalThis.fetch = originalFetch; for (const name of names) { if (saved[name] === undefined) delete process.env[name]; else process.env[name] = saved[name]; } });
const request = (body: unknown) => new NextRequest("http://localhost/api/quote-request", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": "12345678-1234-1234-1234-123456789abc", "x-real-ip": crypto.randomUUID() }, body: JSON.stringify(body) });

test("territories match complete area names and uncertain locations go to admin", () => {
  expect(resolveLeadRoute("pretoria, GAUTENG", config).to).toEqual(["pretoria@example.com"]);
  expect(resolveLeadRoute("Cape Town, Western Cape", config).to).toEqual(["cape@example.com"]);
  expect(resolveLeadRoute("Pretoriaville", config).to).toEqual(config.admin);
  expect(resolveLeadRoute("Pretoria or Cape Town", config).to).toEqual(config.admin);
  expect(resolveLeadRoute("Durban", config).to).toEqual(config.admin);
  expect(resolveLeadRoute("Pretoria", { ...config, enabled: false }).to).toEqual(config.admin);
  expect(resolveLeadRoute("Pretoria", { ...config, territories: [...config.territories, { name: "Overlapping rep", email: "other@example.com", areas: ["Pretoria"] }] }).to).toEqual(config.admin);
});

test("lead validation and email formatting reject malformed contacts and escape HTML", () => {
  expect(readLead({ ...sample, email: "bad\r\nBcc: victim@example.com" })).toBeNull();
  expect(readLead({ ...sample, phone: "call me" })).toBeNull();
  expect(readLead({ ...sample, location: "Pretoria\r\nBcc: other" })).toBeNull();
  const email = buildLeadEmail({ ...sample, company: '<script>alert("bad")</script>', request: "Bearings < 20mm & bolts" }, resolveLeadRoute(sample.location, { ...config, enabled: false }), true);
  expect(email.html).not.toContain("<script>");
  expect(email.html).toContain("&lt;script&gt;");
  expect(email.html).toContain("Bearings &lt; 20mm &amp; bolts");
  expect(email.subject).toContain("[DEMO]");
  expect(email.text).toContain("no email sent or lead saved");
});

test("demo cannot send email or call AI even with configured keys and a forged live flag", async () => {
  process.env.OPENAI_API_KEY = "test-only-key"; process.env.RESEND_API_KEY = "test-only-key"; process.env.RESEND_FROM_EMAIL = "sales@example.com";
  let outgoing = 0;
  globalThis.fetch = async () => { outgoing++; throw new Error("Unexpected outbound request"); };
  const response = await submitLead(request({ ...sample, mode: "live", to: ["untrusted@example.com"] }));
  expect(response.status).toBe(200);
  expect(response.headers.get("cache-control")).toBe("no-store");
  const result = await response.json();
  expect(result.status).toBe("preview"); expect(result.sent).toBe(false);
  expect(result.email.to).toEqual(["eliseenweb@gmail.com"]);
  expect((await askAssistant(new NextRequest("http://localhost/api/assistant", { method: "POST", body: JSON.stringify({ messages: sample.messages }) }))).status).toBe(409);
  expect(outgoing).toBe(0);
});

test("missing credentials and provider errors cannot report success; retry uses the same email key", async () => {
  process.env.ASSISTANT_MODE = "live";
  delete process.env.RESEND_API_KEY; delete process.env.RESEND_FROM_EMAIL;
  expect((await submitLead(request(sample))).status).toBe(503);
  process.env.RESEND_API_KEY = "test-only-key"; process.env.RESEND_FROM_EMAIL = "sales@example.com";
  const keys: string[] = [];
  globalThis.fetch = async (_url, options) => {
    keys.push(new Headers(options?.headers).get("Idempotency-Key") || "");
    const payload = JSON.parse(String(options?.body));
    expect(payload.to).toEqual(["eliseenweb@gmail.com"]);
    expect(payload.reply_to).toBe(sample.email);
    return keys.length === 1 ? new Response("unavailable", { status: 503 }) : Response.json({ id: "provider-message-id" });
  };
  expect((await submitLead(request(sample))).status).toBe(502);
  expect(await (await submitLead(request(sample))).json()).toEqual({ status: "sent" });
  expect(keys[0]).toBe(keys[1]);
});

test("invalid JSON, invalid fields and oversized bodies fail before any delivery", async () => {
  globalThis.fetch = async () => { throw new Error("Must not send"); };
  expect((await submitLead(request({ ...sample, email: "invalid" }))).status).toBe(400);
  expect((await submitLead(request({ ...sample, messages: Array.from({ length: 25 }, () => sample.messages[0]) }))).status).toBe(400);
  const invalidJson = await submitLead(new NextRequest("http://localhost/api/quote-request", { method: "POST", body: "not json" }));
  expect(invalidJson.status).toBe(400);
  expect((await submitLead(request({ ...sample, request: "x".repeat(60_000) }))).status).toBe(413);
});
