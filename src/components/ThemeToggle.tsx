"use client";

import { useSyncExternalStore } from "react";

function subscribe(cb: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", cb);
  window.addEventListener("themechange", cb);
  return () => {
    mq.removeEventListener("change", cb);
    window.removeEventListener("themechange", cb);
  };
}

function isDark() {
  const set = document.documentElement.dataset.theme;
  if (set === "dark") return true;
  if (set === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  function toggle() {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    window.dispatchEvent(new Event("themechange"));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      className="border-border hover:bg-border/50 rounded-full border px-3 py-1.5 text-sm"
    >
      <span aria-hidden="true">{dark ? "☀️" : "🌙"}</span> Modo escuro
    </button>
  );
}
