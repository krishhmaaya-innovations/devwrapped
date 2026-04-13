"use client";

import { useEffect } from "react";

/**
 * Reads the stored theme from localStorage and applies it to <html data-theme>.
 * Acts as a client-side fallback in case the inline FOWT-prevention script in
 * <head> is overwritten during React 19 hydration (known issue with RSC production
 * builds). Runs once on mount, synchronously before first paint is not guaranteed
 * here — the inline script in layout.tsx still handles FOWT; this handles
 * post-hydration correctness.
 */
export function ThemeSyncer() {
  useEffect(() => {
    const stored = localStorage.getItem("devwrapped-theme");
    if (stored === "light" || stored === "dark") {
      document.documentElement.setAttribute("data-theme", stored);
    }
  }, []);

  return null;
}
