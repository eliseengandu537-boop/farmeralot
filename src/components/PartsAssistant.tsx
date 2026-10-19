"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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
  "I need an alternator for my tractor",
];

export function PartsAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [products, setProducts] = useState<ProductMatch[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
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
    setConversationKey((key) => key + 1);
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
              <span><b id="assistant-title">Farmeralot parts assistant</b><small>AI product finder</small></span>
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
                <h2>Let’s find<br />the right part.</h2>
                <p>Tell me a part number, dimensions, or what machine you’re working with.</p>
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
                    {products.slice(0, 4).map((product) => (
                      <Link href={`/product/${encodeURIComponent(product.slug)}`} key={product.id} onClick={() => setOpen(false)}>
                        <span><b>{product.name}</b><small>{product.sku || "Part details"}</small></span><span aria-hidden="true">↗</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
            {error && <p className="assistant-error" role="alert">{error}</p>}
          </div>
          <form className="assistant-composer" onSubmit={(event) => { event.preventDefault(); void sendMessage(); }}>
            <label className="visually-hidden" htmlFor="assistant-input">Ask about a part</label>
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
              placeholder="Describe the part you need…"
              maxLength={1000}
              rows={2}
              disabled={busy}
            />
            <button type="submit" aria-label="Send message" disabled={busy || !draft.trim()}>↑</button>
          </form>
          <p className="assistant-disclaimer">AI can make mistakes. Confirm fitment with our parts team.</p>
        </section>
      )}
      <button className={`assistant-launcher${open ? " is-open" : ""}`} type="button" aria-expanded={open} aria-label={open ? "Close parts assistant" : "Open AI parts assistant"} onClick={() => setOpen((current) => !current)}>
        <span className="assistant-launcher-icon" aria-hidden="true">{open ? "×" : <PartsIcon />}</span>
        <span>{open ? "Close" : "Ask our AI"}</span>
      </button>
    </div>
  );
}
