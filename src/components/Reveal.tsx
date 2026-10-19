"use client";

import { useEffect, useRef } from "react";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (
      !element ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    element.style.setProperty("--reveal-delay", `${delay}ms`);
    element.dataset.revealReady = "true";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    function reveal() {
      if (element) element.dataset.revealed = "true";
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          observer.unobserve(element);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -24px 0px" },
    );

    observer.observe(element);
    function motionChanged() {
      if (reduced.matches) { reveal(); observer.disconnect(); }
    }
    element.addEventListener("focusin", reveal);
    reduced.addEventListener("change", motionChanged);
    return () => {
      observer.disconnect();
      element.removeEventListener("focusin", reveal);
      reduced.removeEventListener("change", motionChanged);
      delete element.dataset.revealReady;
    };
  }, [delay]);

  return (
    <div ref={elementRef} className={className ? `reveal ${className}` : "reveal"}>
      {children}
    </div>
  );
}
