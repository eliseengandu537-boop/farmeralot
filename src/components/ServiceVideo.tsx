"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export function ServiceVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlRef = useRef<HTMLButtonElement>(null);
  const intentRef = useRef<"auto" | "play" | "pause">("auto");
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const panel = video.closest<HTMLElement>("[data-stack-panel]");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;

    function syncPlayback() {
      if (!video) return;
      const paused = intentRef.current === "pause" || (reduced.matches && intentRef.current !== "play");
      if (paused || !visible || document.hidden || panel?.inert) video.pause();
      else if (video.paused) void video.play().catch(() => { /* Keep the poster and manual play control. */ });
    }

    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.15;
      syncPlayback();
    }, { threshold: [0, 0.15] });
    visibility.observe(video);

    // Sticky panels still intersect the viewport after the next card covers them.
    const covered = new MutationObserver(syncPlayback);
    if (panel) covered.observe(panel, { attributes: true, attributeFilter: ["inert"] });
    reduced.addEventListener("change", syncPlayback);
    document.addEventListener("visibilitychange", syncPlayback);
    if (controlRef.current) controlRef.current.hidden = false;

    return () => {
      visibility.disconnect();
      covered.disconnect();
      reduced.removeEventListener("change", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
      video.pause();
    };
  }, []);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      intentRef.current = "play";
      void video.play().catch(() => { /* Autoplay restrictions leave the poster visible. */ });
    } else {
      intentRef.current = "pause";
      video.pause();
    }
  }

  return (
    <div className="service-visual service-video-visual">
      <Image className="service-video-backdrop" src="/service-parts-poster.webp" alt="" fill sizes="(max-width: 700px) 88vw, 42vw" />
      <video
        ref={videoRef}
        className="service-video"
        muted
        loop
        playsInline
        preload="none"
        poster="/service-parts-poster.webp"
        width={576}
        height={1024}
        aria-hidden="true"
        tabIndex={-1}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src="/service-parts.mp4" type="video/mp4" />
      </video>
      <button ref={controlRef} hidden className="service-video-control" type="button" onClick={togglePlayback} aria-label={playing ? "Pause farm video" : "Play farm video"}>
        <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>
        <span>{playing ? "Pause" : "Play"}</span>
      </button>
      <div className="visual-caption"><span>KEEP YOUR FARM MOVING</span><span aria-hidden="true">↗</span></div>
    </div>
  );
}
