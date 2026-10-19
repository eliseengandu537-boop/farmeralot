"use client";

import { useEffect, useRef } from "react";

type ScrollTextProps = {
  as?: "h1" | "h2";
  lines: string[];
  highlightWord?: string;
  className?: string;
};

export function ScrollText({
  as: Heading = "h2",
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

    heading.dataset.wordReveal = "ready";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          heading.dataset.wordReveal = "visible";
          observer.unobserve(heading);
        }
      },
      { threshold: 0.35, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(heading);
    return () => observer.disconnect();
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
      className={className}
      aria-label={lines.join(" ")}
    >
      {lines.map((line, lineIndex) => (
        <span className="scroll-text-line" aria-hidden="true" key={`${line}-${lineIndex}`}>
          {line.split(/\s+/).map((word, index, words) => {
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
                {index < words.length - 1 ? " " : null}
              </span>
            );
          })}
        </span>
      ))}
    </Heading>
  );
}
