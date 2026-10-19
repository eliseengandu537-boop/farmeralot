"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AssistantLeadForm } from "@/components/AssistantLeadForm";
import { acceptDemoAnswer, demoSteps } from "@/lib/demo-assistant";
import { emptyLead, leadLimits, type LeadDetails, type LeadMessage } from "@/lib/lead";

type ProductMatch = { id: number; name: string; sku: string; slug: string };

function PartsIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M14.6 6.1a5.3 5.3 0 0 0-6.8 6.8l-4.9 4.9a1.8 1.8 0 0 0 2.5 2.5l4.9-4.9a5.3 5.3 0 0 0 6.8-6.8l-3.4 3.4-3.1-.7-.7-3.1 3.4-3.4Z" /><path d="m14.7 14.7 4.4 4.4m-1.8-6.9 3.4 3.4" /></svg>;
}

export function PartsAssistant({ demo }: { demo: boolean }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<LeadMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [products, setProducts] = useState<ProductMatch[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const [lead, setLead] = useState<LeadDetails>({ ...emptyLead });
  const [review, setReview] = useState(false);
  const [conversationKey, setConversationKey] = useState(0);
  const panelRef = useRef<HTMLElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (review) transcriptRef.current?.scrollTo({ top: 0, behavior: "instant" });
    else transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: reduced ? "instant" : "smooth" });
  }, [messages, busy, open, review]);
  useEffect(() => {
    if (open) {
      if (review) panelRef.current?.querySelector<HTMLInputElement>(".assistant-quote-form input")?.focus();
      else inputRef.current?.focus();
    }
  }, [open, review, conversationKey]);
  useEffect(() => () => requestRef.current?.abort(), []);

  function close() { setOpen(false); launcherRef.current?.focus(); }
  function resetConversation() {
    requestRef.current?.abort(); requestRef.current = null;
    setBusy(false); setMessages([]); setProducts([]); setError(""); setDraft("");
    setStep(0); setLead({ ...emptyLead }); setReview(false); setConversationKey((key) => key + 1);
  }
  async function sendMessage(value = draft) {
    const content = value.trim();
    if (!content || busy || requestRef.current) return;
    const nextMessages: LeadMessage[] = [...messages, { role: "user" as const, content }].slice(-24);
    setDraft(""); setError("");
    if (demo) {
      const result = acceptDemoAnswer(step, content);
      if (result.error) { setMessages([...nextMessages, { role: "assistant", content: result.error }]); return; }
      setLead({ ...lead, [demoSteps[step].field]: result.value ?? "" });
      const nextStep = step + 1; setStep(nextStep);
      setMessages([...nextMessages, { role: "assistant", content: demoSteps[nextStep]?.question || "Thanks. Check your details below and preview the lead email for the admin." }]);
      if (nextStep === demoSteps.length) setReview(true);
      return;
    }
    setMessages(nextMessages); setBusy(true);
    const controller = new AbortController(); requestRef.current = controller;
    try {
      const response = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: nextMessages.slice(-8) }), signal: AbortSignal.any([controller.signal, AbortSignal.timeout(25_000)]) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The assistant couldn’t answer. Please try again.");
      if (typeof result.answer !== "string" || !Array.isArray(result.products)) throw new Error("The assistant returned an invalid answer. Please retry.");
      if (controller.signal.aborted) return;
      setMessages([...nextMessages, { role: "assistant" as const, content: result.answer }].slice(-24));
      setProducts(result.products.filter((item: ProductMatch) => item && typeof item.id === "number" && typeof item.slug === "string" && typeof item.name === "string"));
      setLead((current) => ({ ...current, request: current.request || content }));
    } catch (cause) { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Please try again."); }
    finally { if (requestRef.current === controller) { requestRef.current = null; setBusy(false); } }
  }

  return <div className="assistant-root" data-assistant-mode={demo ? "demo" : "live"}>
    <section hidden={!open} ref={panelRef} className="assistant-panel" role="dialog" aria-modal="false" aria-labelledby="assistant-title" id="parts-assistant" data-lenis-prevent onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); close(); } }}>
      <header className="assistant-header"><div className="assistant-identity"><span className="assistant-avatar"><PartsIcon /></span><span><b id="assistant-title">Farmeralot assistant</b><small>{demo ? "AI assistant demo" : "AI parts & enquiry assistant"}</small></span></div><div className="assistant-header-actions"><button type="button" onClick={resetConversation} aria-label="Start a new chat" title="New chat">↻</button><button type="button" onClick={close} aria-label="Close assistant">×</button></div></header>
      {demo && <p className="assistant-demo-banner"><span aria-hidden="true" />Presentation demo · Guided replies · No emails sent</p>}
      <div className="assistant-transcript" ref={transcriptRef}>
        {review ? <AssistantLeadForm key={conversationKey} initial={lead} messages={messages} demo={demo} onReset={resetConversation} /> : <>
          {messages.length === 0 ? <div className="assistant-welcome"><span className="eyebrow">From your first question to the right part</span><h2>Let’s find what<br />your farm needs.</h2><p>Tell me what you’re looking for. I’ll help put your enquiry together for the Farmeralot team.</p><div className="assistant-suggestions">{["I need a tractor part", "I need farm supplies delivered"].map((text) => <button type="button" key={text} onClick={() => void sendMessage(text)} disabled={busy}>{text}<span aria-hidden="true">↗</span></button>)}</div></div> : <>
            <div className="assistant-messages" role="log" aria-live="polite" aria-relevant="additions text">{messages.map((message, index) => <p className={`assistant-message ${message.role}`} key={`${index}-${message.role}`}><span className="visually-hidden">{message.role === "user" ? "You: " : "Assistant: "}</span>{message.content}</p>)}{busy && <p className="assistant-message assistant-typing" role="status">Looking into that for you…</p>}</div>
            {products.length > 0 && <div className="assistant-product-matches"><span className="eyebrow">Catalogue matches</span>{products.slice(0, 5).map((product) => <Link href={`/product/${encodeURIComponent(product.slug)}`} key={product.id} onClick={close}><span><b>{product.name}</b><small>{product.sku || "Part details"}</small></span><span aria-hidden="true">↗</span></Link>)}</div>}
            {demo && step === 3 && <button className="assistant-skip" type="button" onClick={() => void sendMessage("Skip")}>Skip company name →</button>}
          </>}
          {error && <p className="assistant-error" role="alert">{error}</p>}
          <button className="assistant-details-link" type="button" disabled={busy} onClick={() => setReview(true)}>Prefer to fill in your details? <span>→</span></button>
        </>}
      </div>
      {!review && <form className="assistant-composer" onSubmit={(event) => { event.preventDefault(); void sendMessage(); }}><label className="visually-hidden" htmlFor="assistant-input">Message the Farmeralot assistant</label><textarea id="assistant-input" ref={inputRef} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void sendMessage(); } }} placeholder={demo ? demoSteps[step]?.placeholder : "What does your farm need?"} maxLength={demo ? leadLimits[demoSteps[step]?.field || "request"] : 1000} rows={2} disabled={busy} /><button type="submit" aria-label="Send message" disabled={busy || !draft.trim()}>↑</button></form>}
      <p className="assistant-disclaimer">{demo ? "Use sample details. This demo does not use live AI." : "AI can make mistakes. Our team confirms fitment and availability."}</p>
    </section>
    <button ref={launcherRef} className={`assistant-launcher${open ? " is-open" : ""}`} type="button" aria-expanded={open} aria-controls={open ? "parts-assistant" : undefined} aria-label={open ? "Close parts assistant" : "Get your quote"} onClick={() => setOpen((current) => !current)}><span className="assistant-launcher-icon" aria-hidden="true">{open ? "×" : <PartsIcon />}</span><span>{open ? "Close" : "Get your quote"}</span><span aria-hidden="true">{open ? "" : "↗"}</span></button>
  </div>;
}
