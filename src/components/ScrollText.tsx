"use client";

import { useEffect, useRef } from "react";

type ScrollTextProps = {
  as?: "h1" | "h2" | "h3";
  id?: string;
  lines: string[];
  highlightWord?: string;
  className?: string;
};

export function ScrollText({
  as: Heading = "h2",
  id,
  lines,
  highlightWord,
  className,
}: ScrollTextProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const heading = headingRef.current;
    if (
      !heading ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    heading.dataset.wordReveal = "ready";
    function reveal() {
      if (heading) heading.dataset.wordReveal = "visible";
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          observer.unobserve(heading);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -20px 0px" },
    );

    observer.observe(heading);
    function motionChanged() {
      if (reduced.matches) { reveal(); observer.disconnect(); }
    }
    heading.addEventListener("focusin", reveal);
    reduced.addEventListener("change", motionChanged);
    return () => {
      observer.disconnect();
      heading.removeEventListener("focusin", reveal);
      reduced.removeEventListener("change", motionChanged);
      delete heading.dataset.wordReveal;
    };
  }, []);

  const normalizedHighlight = highlightWord?.toLowerCase();
  const lineWordOffsets = lines.map((_, index) =>
    lines
      .slice(0, index)
      .reduce((total, previousLine) => total + previousLine.split(/\s+/).length, 0),
  );

  return (
    <Heading
      ref={headingRef}
      id={id}
      className={className}
      aria-label={lines.join(" ")}
    >
      {lines.map((line, lineIndex) => (
        <span className="scroll-text-line" aria-hidden="true" key={`${line}-${lineIndex}`}>
          {line.split(/\s+/).map((word, index) => {
            const delay = (lineWordOffsets[lineIndex] + index) * 48;
            const highlighted = word.toLowerCase() === normalizedHighlight;

            return (
              <span className="scroll-word-mask" key={`${word}-${index}`}>
                <span
                  className={highlighted ? "scroll-word is-highlighted" : "scroll-word"}
                  style={{ transitionDelay: `${delay}ms` }}
                >
                  {word}
                </span>
                {" "}
              </span>
            );
          })}
        </span>
      ))}
    </Heading>
  );
}
