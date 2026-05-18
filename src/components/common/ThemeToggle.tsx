import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const getIsDark = () => {
    if (typeof document === "undefined") return false;
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  const [isDark, setIsDark] = useState(getIsDark());

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setIsDark(getIsDark());
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  const toggle = () => {
    // Enable synchronized transitions for all elements
    document.body.classList.add("theme-transition");
    
    setIsDark(prev => !prev);
    
    // Remove the class after the transition finishes (400ms + buffer)
    setTimeout(() => {
      document.body.classList.remove("theme-transition");
    }, 450);
  };

  return (
    <button
      onClick={toggle}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/40 hover:scale-105"
      aria-label="Toggle color theme"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      type="button"
    >
      <span className={`absolute inset-0 rounded-full transition-colors ${
        isDark 
          ? "bg-indigo-600 dark:bg-indigo-500" 
          : "bg-amber-400"
      }`} />
      
      <span className={`absolute top-0.5 left-0.5 inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${
        isDark ? "translate-x-5" : "translate-x-0"
      }`}>
        {isDark ? (
          <svg className="h-3 w-3 text-indigo-700" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.64 13A9 9 0 1111 2.36 7 7 0 0021.64 13z" />
          </svg>
        ) : (
          <svg className="h-3 w-3 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        )}
      </span>
    </button>
  );
}
