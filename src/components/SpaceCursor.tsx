"use client";

import { useEffect, useRef } from "react";

/**
 * SpaceCursor — custom cursor that shows a pulsing ring + trail on desktop.
 * Renders absolutely nothing on touch devices.
 */
export default function SpaceCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -999, y: -999 });
  const ringPos = useRef({ x: -999, y: -999 });

  useEffect(() => {
    // Only on non-touch devices
    if (typeof window === "undefined" || window.matchMedia("(hover: none)").matches) return;

    const root = document.documentElement;
    root.style.cursor = "none";

    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };

    const onDown = () => cursorRef.current?.classList.add("cursor-clicked");
    const onUp = () => cursorRef.current?.classList.remove("cursor-clicked");

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    // Lag the ring slightly for spring feel
    let af: number;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      ringPos.current.x = lerp(ringPos.current.x, posRef.current.x, 0.12);
      ringPos.current.y = lerp(ringPos.current.y, posRef.current.y, 0.12);
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px)`;
      }
      af = requestAnimationFrame(animate);
    };
    af = requestAnimationFrame(animate);

    // Hover effects on interactive elements
    const addHover = (el: Element) => el.addEventListener("mouseenter", () => cursorRef.current?.classList.add("cursor-hover"));
    const removeHover = (el: Element) => el.addEventListener("mouseleave", () => cursorRef.current?.classList.remove("cursor-hover"));

    const queryInteractive = () =>
      document.querySelectorAll("a, button, [role='button'], input, select, textarea");

    const setupHoverListeners = () => {
      queryInteractive().forEach((el) => { addHover(el); removeHover(el); });
    };
    setupHoverListeners();

    const mutationObs = new MutationObserver(setupHoverListeners);
    mutationObs.observe(document.body, { childList: true, subtree: true });

    return () => {
      root.style.cursor = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      cancelAnimationFrame(af);
      mutationObs.disconnect();
    };
  }, []);

  return (
    <>
      {/* Dot */}
      <div
        id="space-cursor-dot"
        ref={cursorRef}
        className="space-cursor-dot"
        style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 99999 }}
      />
      {/* Lagged ring */}
      <div
        id="space-cursor-ring"
        ref={ringRef}
        className="space-cursor-ring"
        style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 99998 }}
      />
      {/* Inject styles once */}
      <style>{`
        .space-cursor-dot {
          width: 6px;
          height: 6px;
          background: rgba(147, 197, 253, 0.9);
          border-radius: 50%;
          margin-left: -3px;
          margin-top: -3px;
          transition: transform 0.06s ease, background 0.2s ease;
          will-change: transform;
        }
        .space-cursor-ring {
          width: 28px;
          height: 28px;
          border: 1.5px solid rgba(147, 197, 253, 0.4);
          border-radius: 50%;
          margin-left: -14px;
          margin-top: -14px;
          will-change: transform;
          transition: width 0.15s ease, height 0.15s ease, border-color 0.2s ease;
        }
        .cursor-clicked .space-cursor-dot {
          transform: translate(var(--x), var(--y)) scale(0.6);
          background: rgba(167, 139, 250, 0.9);
        }
        .cursor-hover ~ .space-cursor-ring,
        .space-cursor-ring.cursor-hover {
          width: 40px;
          height: 40px;
          margin-left: -20px;
          margin-top: -20px;
          border-color: rgba(167, 139, 250, 0.5);
        }
        /* hide on touch screens */
        @media (hover: none) {
          .space-cursor-dot, .space-cursor-ring { display: none; }
        }
      `}</style>
    </>
  );
}
