import { isEmail } from "./lead";
import { SALES_EMAIL } from "./store-config";

export type SalesTerritory = { name: string; email: string; areas: string[] };
export type LeadRoute = { to: string[]; label: string; reason: string };
export type RoutingConfig = { admin: string[]; enabled: boolean; territories: SalesTerritory[] };

const normalize = (value: string) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export function readRoutingConfig(): RoutingConfig {
  const admin = (process.env.SALES_EMAIL_TO || SALES_EMAIL).split(",").map((email) => email.trim()).filter(Boolean);
  if (!admin.length || admin.some((email) => !isEmail(email))) throw new Error("Invalid admin inbox configuration.");
  const enabled = process.env.SALES_ROUTING_ENABLED === "true";
  let territories: SalesTerritory[] = [];
  if (enabled) {
    try {
      const parsed: unknown = JSON.parse(process.env.SALES_REP_ROUTES_JSON || "[]");
      if (Array.isArray(parsed) && parsed.length <= 100 && parsed.every((row) => row && typeof row.name === "string" && row.name.trim() && typeof row.email === "string" && isEmail(row.email) && Array.isArray(row.areas) && row.areas.length && row.areas.every((area: unknown) => typeof area === "string" && normalize(area).length > 1))) territories = parsed;
    } catch { /* Unconfirmed or invalid territories go to the admin for review. */ }
  }
  return { admin, enabled, territories };
}

export function resolveLeadRoute(location: string, config: RoutingConfig): LeadRoute {
  const fallback = (reason: string): LeadRoute => ({ to: config.admin, label: "Admin inbox", reason });
  if (!config.enabled) return fallback("Admin inbox — regional routing is not enabled.");
  const normalized = ` ${normalize(location)} `;
  const matches = config.territories.filter((rep) => rep.areas.some((area) => normalized.includes(` ${normalize(area)} `)));
  const distinct = [...new Map(matches.map((rep) => [rep.email.toLowerCase(), rep])).values()];
  if (distinct.length !== 1) return fallback(distinct.length ? "More than one territory matched — admin review required." : "No confirmed territory matched — admin review required.");
  const rep = distinct[0];
  return { to: [rep.email], label: rep.name, reason: `Matched to ${rep.name} for ${location}.` };
}
