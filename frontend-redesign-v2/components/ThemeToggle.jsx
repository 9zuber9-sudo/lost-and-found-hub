"use client";
import { useEffect, useState } from "react";

// Button that switches between light and dark mode and remembers the choice
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = document.documentElement.dataset.theme;
    setDark(saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  function toggle() {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("lf-theme", next);
    } catch (e) {}
    setDark(!dark);
  }

  return (
    <button
      type="button"
      className="lf-icon"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? "☀︎" : "☾"}
    </button>
  );
}
