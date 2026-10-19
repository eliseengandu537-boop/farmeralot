"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ProductMatch = {
  id: number;
  name: string;
  sku: string;
  slug: string;
};

type AssistantReply = {
  answer: string;
  products: ProductMatch[];
};

type QuoteDetails = {
  name: string;
  email: string;
  phone: string;
  location: string;
  request: string;
};

function PartsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M14.6 6.1a5.3 5.3 0 0 0-6.8 6.8l-4.9 4.9a1.8 1.8 0 0 0 2.5 2.5l4.9-4.9a5.3 5.3 0 0 0 6.8-6.8l-3.4 3.4-3.1-.7-.7-3.1 3.4-3.4Z" />
      <path d="m14.7 14.7 4.4 4.4m-1.8-6.9 3.4 3.4" />
    </svg>
  );
}

function isProductMatch(value: unknown): value is ProductMatch {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "number" &&
    "name" in value &&
    typeof value.name === "string" &&
    "sku" in value &&
    typeof value.sku === "string" &&
    "slug" in value &&
    typeof value.slug === "string"
  );
}

function isAssistantReply(value: unknown): value is AssistantReply {
  return (
    typeof value === "object" &&
    value !== null &&
    "answer" in value &&
    typeof value.answer === "string" &&
    "products" in value &&
    Array.isArray(value.products) &&
    value.products.every(isProductMatch)
  );
}

const suggestions = [
  "Help me find a bearing",
  "I need farm supplies delivered",
];

export function PartsAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [products, setProducts] = useState<ProductMatch[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteBusy, setQuoteBusy] = useState(false);
  const [quoteSent, setQuoteSent] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [quoteDetails, setQuoteDetails] = useState<QuoteDetails>({
    name: "",
    email: "",
    phone: "",
    location: "",
    request: "",
  });
  const [conversationKey, setConversationKey] = useState(0);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    transcriptRef.current?.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, busy, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function sendMessage(value = draft) {
    const content = value.trim();
    if (!content || busy) return;

    const userMessage: Message = { role: "user", content };
    const nextMessages = [...messages, userMessage].slice(-8);
    setMessages(nextMessages);
    setDraft("");
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "The assistant couldn't answer. Please try again.";
        throw new Error(message);
      }
      if (!isAssistantReply(result)) {
        throw new Error("The assistant returned an invalid response. Please retry.");
      }

      const assistantMessage: Message = { role: "assistant", content: result.answer };
      setMessages([...nextMessages, assistantMessage].slice(-8));
      setProducts(result.products);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function resetConversation() {
    setMessages([]);
    setProducts([]);
    setError("");
    setDraft("");
    setQuoteOpen(false);
    setQuoteSent(false);
    setQuoteError("");
    setQuoteDetails({ name: "", email: "", phone: "", location: "", request: "" });
    setConversationKey((key) => key + 1);
  }

  async function submitQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (quoteBusy || quoteSent) return;

    setQuoteBusy(true);
    setQuoteError("");
    try {
      const response = await fetch("/api/quote-request", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...quoteDetails, messages }),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "We couldn't send your request. Please try again.";
        throw new Error(message);
      }
      setQuoteSent(true);
    } catch (submitError) {
      setQuoteError(submitError instanceof Error ? submitError.message : "Please try again.");
    } finally {
      setQuoteBusy(false);
    }
  }

  return (
    <div className="assistant-root">
      {open && (
        <section
          className="assistant-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="assistant-title"
          key={conversationKey}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
        >
          <header className="assistant-header">
            <div className="assistant-identity">
              <span className="assistant-avatar"><PartsIcon /></span>
              <span><b id="assistant-title">Farmeralot farm assistant</b><small>Products, parts &amp; delivery</small></span>
            </div>
            <div className="assistant-header-actions">
              <button type="button" onClick={resetConversation} aria-label="Start a new chat" title="New chat">↻</button>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant">×</button>
            </div>
          </header>
          <div className="assistant-transcript" ref={transcriptRef} aria-live="polite">
            {messages.length === 0 ? (
              <div className="assistant-welcome">
                <span className="eyebrow">Here to help</span>
                <h2>What does<br />your farm need?</h2>
                <p>Ask about a part, an everyday farm essential, or getting an order delivered to your farm.</p>
                <div className="assistant-suggestions">
                  {suggestions.map((suggestion) => (
                    <button type="button" key={suggestion} onClick={() => void sendMessage(suggestion)} disabled={busy}>{suggestion}<span aria-hidden="true">↗</span></button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="assistant-messages">
                {messages.map((message, index) => (
                  <p className={`assistant-message ${message.role}`} key={`${index}-${message.role}`}>{message.content}</p>
                ))}
                {busy && <p className="assistant-message assistant-typing" role="status">Checking the catalogue…</p>}
                {products.length > 0 && (
                  <div className="assistant-product-matches">
                    <span className="eyebrow">Catalogue matches</span>
                    {products.slice(0, 5).map((product) => (
                      <Link href={`/product/${encodeURIComponent(product.slug)}`} key={product.id} onClick={() => setOpen(false)}>
                        <span><b>{product.name}</b><small>{product.sku || "Part details"}</small></span><span aria-hidden="true">↗</span>
                      </Link>
                    ))}
                  </div>
                )}
                {messages.some((message) => message.role === "assistant") && (
                  <button className="assistant-quote-trigger" type="button" onClick={() => setQuoteOpen((current) => !current)}>
                    {quoteOpen ? "Close quote details" : "Get your quote"} <span aria-hidden="true">↗</span>
                  </button>
                )}
              </div>
            )}
            {quoteOpen && (
              <form className="assistant-quote-form" onSubmit={(event) => void submitQuote(event)}>
                {quoteSent ? (
                  <div className="assistant-quote-success" role="status">
                    <b>Request sent</b>
                    <span>Thanks. The Farmalot team will follow up about your request.</span>
                  </div>
                ) : (
                  <>
                    <div><span className="eyebrow">Request a quote</span><h3>Where should we send it?</h3><p>Share your details and the sales team will follow up about the items you discussed.</p></div>
                    <label>Your name<input name="name" autoComplete="name" required maxLength={120} value={quoteDetails.name} onChange={(event) => setQuoteDetails({ ...quoteDetails, name: event.target.value })} /></label>
                    <label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} value={quoteDetails.email} onChange={(event) => setQuoteDetails({ ...quoteDetails, email: event.target.value })} /></label>
                    <label>Phone number<input name="phone" type="tel" autoComplete="tel" required maxLength={40} value={quoteDetails.phone} onChange={(event) => setQuoteDetails({ ...quoteDetails, phone: event.target.value })} /></label>
                    <label>Town or delivery area<input name="location" autoComplete="address-level2" required maxLength={120} value={quoteDetails.location} onChange={(event) => setQuoteDetails({ ...quoteDetails, location: event.target.value })} /></label>
                    <label>What would you like delivered?<textarea name="request" required maxLength={1500} rows={3} value={quoteDetails.request} onChange={(event) => setQuoteDetails({ ...quoteDetails, request: event.target.value })} /></label>
                    <p className="assistant-quote-privacy">Your contact details are used only to respond to this request. Please don’t include sensitive information.</p>
                    {quoteError && <p className="assistant-error" role="alert">{quoteError}</p>}
                    <button className="assistant-quote-submit" type="submit" disabled={quoteBusy}>{quoteBusy ? "Sending request…" : "Send quote request"}</button>
                  </>
                )}
              </form>
            )}
            {error && <p className="assistant-error" role="alert">{error}</p>}
          </div>
          <form className="assistant-composer" onSubmit={(event) => { event.preventDefault(); void sendMessage(); }}>
            <label className="visually-hidden" htmlFor="assistant-input">Ask about products, parts, or farm delivery</label>
            <textarea
              id="assistant-input"
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              placeholder="What does your farm need?"
              maxLength={1000}
              rows={2}
              disabled={busy}
            />
            <button type="submit" aria-label="Send message" disabled={busy || !draft.trim()}>↑</button>
          </form>
          <p className="assistant-disclaimer">AI can make mistakes. Confirm fitment with our parts team.</p>
        </section>
      )}
      <button className={`assistant-launcher${open ? " is-open" : ""}`} type="button" aria-expanded={open} aria-label={open ? "Close parts assistant" : "Get your quote"} onClick={() => setOpen((current) => !current)}>
        <span className="assistant-launcher-icon" aria-hidden="true">{open ? "×" : <PartsIcon />}</span>
        <span>{open ? "Close" : "Get your quote"}</span>
      </button>
    </div>
  );
}
