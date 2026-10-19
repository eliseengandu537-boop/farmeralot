import { isEmail, isPhone, leadLimits, type LeadDetails } from "./lead";

export const demoSteps: { field: keyof LeadDetails; question: string; placeholder: string }[] = [
  { field: "request", question: "What part or farm supply do you need? A machine model or part number helps too.", placeholder: "Tell me what your farm needs…" },
  { field: "location", question: "Which town or suburb and province are you in? This helps the team arrange delivery and, later, connect you with the right area representative.", placeholder: "e.g. Pretoria, Gauteng" },
  { field: "name", question: "Who should the sales team contact? Please share your name.", placeholder: "Your name" },
  { field: "company", question: "What is your farm or company called? You can skip this if it’s a personal enquiry.", placeholder: "Farm or company name, or type Skip" },
  { field: "email", question: "What email address should the team use to reply? Use a sample address for this demo.", placeholder: "e.g. farmer@example.com" },
  { field: "phone", question: "And what phone number can the team call? You’ll be able to check and edit everything next.", placeholder: "Phone number" },
];

export function acceptDemoAnswer(step: number, input: string): { value?: string; error?: string } {
  const field = demoSteps[step]?.field;
  const value = input.trim();
  if (!field) return { error: "Your enquiry is ready to review below." };
  if (field === "request" && /^(hi|hello|hey|good morning|good afternoon)[!.\s]*$/i.test(value)) return { error: demoSteps[0].question };
  if (!value || value.length > leadLimits[field]) return { error: `Please keep your answer within ${leadLimits[field]} characters.` };
  if (field === "email" && !isEmail(value)) return { error: "Please use a valid email address, such as farmer@example.com." };
  if (field === "phone" && !isPhone(value)) return { error: "Please enter a phone number with 7–15 digits, including an area or country code." };
  if (field !== "request" && /[\r\n\x00-\x1f]/.test(value)) return { error: "Please enter this detail on one line." };
  if (field === "company" && /^(skip|none|n\/a|no company)$/i.test(value)) return { value: "" };
  return { value };
}
