"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ScrollText } from "@/components/ScrollText";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = true;
    function syncPlayback() {
      if (!video) return;
      if (paused || reduced.matches || document.hidden || !visible) video.pause();
      else void video.play().catch(() => { /* The poster remains if autoplay is unavailable. */ });
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    });
    observer.observe(video);
    reduced.addEventListener("change", syncPlayback);
    document.addEventListener("visibilitychange", syncPlayback);
    syncPlayback();
    return () => {
      observer.disconnect();
      reduced.removeEventListener("change", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
      video.pause();
    };
  }, [paused]);

  return (
    <section className="hero" data-hero aria-labelledby="hero-heading">
      <video ref={videoRef} className="hero-video" muted loop playsInline preload="none" poster="/farm-poster.jpg" aria-hidden="true" tabIndex={-1}>
        <source src="/farmeralot-background.mp4" type="video/mp4" />
      </video>
      <div className="hero-atmosphere" aria-hidden="true" />
      <div className="hero-copy">
        <span className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> Fast parts for farmlands</span>
        <ScrollText id="hero-heading" as="h1" className="hero-title" lines={["Keep your", "world turning."]} highlightWord="world" />
        <p>From the right machinery part to your everyday farm essentials. Practical support. Nationwide delivery. Right to your farm gate.</p>
        <div className="hero-actions">
          <Link className="button button-copper" href="/shop">Explore the catalogue <span aria-hidden="true">↗</span></Link>
          <Link className="button button-ghost" href="/request-quote">Let’s find your part <span aria-hidden="true">→</span></Link>
        </div>
        <div className="hero-proof"><span className="proof-line" /> Built around the way you work.</div>
      </div>
      <div className="hero-note" aria-hidden="true"><span>FROM THE WORKSHOP</span><span className="hero-note-line" /><span>TO THE FARM GATE.</span></div>
      <div className="hero-bottom">
        <a className="hero-scroll" href="#our-service"><span className="scroll-circle" aria-hidden="true">↓</span><span>Discover the difference</span></a>
        <span className="hero-location">South Africa <span> / </span> Built for the field</span>
        <button className="video-toggle" type="button" aria-label={paused ? "Play background video" : "Pause background video"} aria-pressed={paused} onClick={() => setPaused(!paused)}>
          <span aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span>
        </button>
      </div>
    </section>
  );
}
