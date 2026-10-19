"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/** Smooth wheel input while preserving native touch, keyboard and route scrolling. */
export function ScrollExperience() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(hover: hover) and (pointer: fine)");
    const stackViewport = window.matchMedia("(min-width: 900px) and (min-height: 760px)");
    const hero = document.querySelector<HTMLElement>("[data-hero]");
    const panels = Array.from(document.querySelectorAll<HTMLElement>("[data-stack-panel]"));
    const header = document.querySelector<HTMLElement>(".site-header");
    let lenis: Lenis | undefined;
    let frame = 0;
    let pageHeight = 1;
    let heroHeight = 1;
    let heroTop = 0;
    let panelGeometry: { top: number; height: number; pin: number }[] = [];

    function paint() {
      frame = 0;
      const scroll = window.scrollY;
      const stacking = !reduced.matches && stackViewport.matches;
      root.style.setProperty("--reading-progress", String(clamp(scroll / pageHeight)));
      header?.classList.toggle("is-scrolled", scroll > 32);

      if (hero && !reduced.matches) {
        const progress = clamp((scroll - heroTop) / heroHeight);
        hero.style.setProperty("--hero-shift", `${progress * heroHeight * (desktop.matches ? 0.17 : 0.06)}px`);
        hero.style.setProperty("--hero-scale", String(1.04 + progress * 0.06));
      }

      panels.forEach((panel, index) => {
        const next = panelGeometry[index + 1];
        const current = panelGeometry[index];
        const cover = stacking && next && current
          ? clamp((scroll + current.pin + current.height - next.top) / current.height)
          : 0;
        panel.style.setProperty("--panel-scale", String(1 - cover * 0.045));
        panel.style.setProperty("--panel-shade", String(cover * 0.3));
        // Covered links must not remain in the keyboard's focus order.
        panel.inert = cover > 0.97;
      });
    }

    function requestPaint() {
      if (!frame) frame = requestAnimationFrame(paint);
    }

    function measure() {
      pageHeight = Math.max(1, root.scrollHeight - window.innerHeight);
      heroHeight = hero?.offsetHeight || 1;
      heroTop = hero ? hero.getBoundingClientRect().top + window.scrollY : 0;
      // Measure natural positions instead of transformed, pinned rectangles.
      const stack = panels[0]?.parentElement;
      let naturalTop = stack ? stack.getBoundingClientRect().top + window.scrollY : 0;
      panelGeometry = panels.map((panel) => {
        const style = getComputedStyle(panel);
        const record = { top: naturalTop, height: panel.offsetHeight, pin: Number.parseFloat(style.top) || 0 };
        naturalTop += record.height + (Number.parseFloat(style.marginBottom) || 0);
        return record;
      });
      requestPaint();
    }

    function configure() {
      lenis?.destroy();
      lenis = undefined;
      root.classList.toggle("motion-enabled", !reduced.matches);
      if (!reduced.matches && desktop.matches) {
        lenis = new Lenis({
          autoRaf: true,
          lerp: 0.085,
          smoothWheel: true,
          syncTouch: false,
          stopInertiaOnNavigate: true,
          // Lenis reads the CSS scroll-padding; a second offset would double it.
          anchors: { duration: 1.1, lerp: 0 },
          prevent: (node) => Boolean(node.closest("[data-lenis-prevent], .assistant-panel, textarea, select")),
        });
      }
      if (reduced.matches) {
        hero?.style.removeProperty("--hero-shift");
        hero?.style.removeProperty("--hero-scale");
      }
      measure();
    }

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(document.body);
    window.addEventListener("scroll", requestPaint, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("pageshow", measure);
    reduced.addEventListener("change", configure);
    desktop.addEventListener("change", configure);
    stackViewport.addEventListener("change", requestPaint);
    configure();

    return () => {
      lenis?.destroy();
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", requestPaint);
      window.removeEventListener("resize", measure);
      window.removeEventListener("pageshow", measure);
      reduced.removeEventListener("change", configure);
      desktop.removeEventListener("change", configure);
      stackViewport.removeEventListener("change", requestPaint);
      root.classList.remove("motion-enabled");
      panels.forEach((panel) => { panel.inert = false; });
    };
  }, [pathname]);

  return <div className="reading-progress" aria-hidden="true" />;
}
