"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export function ServiceVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const panel = video.closest<HTMLElement>("[data-stack-panel]");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;

    function syncPlayback() {
      if (!video) return;
      const shouldPlay = visible && !reduced.matches && !document.hidden && !panel?.inert;
      video.autoplay = shouldPlay;
      if (!shouldPlay) video.pause();
      else if (video.paused) void video.play().catch(() => { /* Retry when media is ready or the visitor interacts. */ });
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
    document.addEventListener("pointerup", syncPlayback);
    document.addEventListener("keydown", syncPlayback);
    video.addEventListener("canplay", syncPlayback);

    return () => {
      visibility.disconnect();
      covered.disconnect();
      reduced.removeEventListener("change", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
      document.removeEventListener("pointerup", syncPlayback);
      document.removeEventListener("keydown", syncPlayback);
      video.removeEventListener("canplay", syncPlayback);
      video.autoplay = false;
      video.pause();
    };
  }, []);

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
      >
        <source src="/service-parts.mp4" type="video/mp4" />
      </video>
      <div className="visual-caption"><span>KEEP YOUR FARM MOVING</span><span aria-hidden="true">↗</span></div>
    </div>
  );
}
