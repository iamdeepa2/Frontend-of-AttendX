import { useState } from "react";
import Icon from "./Icon";
import { toggleTheme } from "../lib/theme";

export default function ThemeToggle({ className = "" }) {
  const [dark, setDark] = useState(
    () => document.documentElement.dataset.theme === "dark",
  );
  const label = dark ? "Switch to light mode" : "Switch to dark mode";
  return (
    <button
      type="button"
      className={`btn-ghost ${className}`.trim()}
      onClick={() => setDark(toggleTheme() === "dark")}
      aria-label={label}
      title={label}
    >
      <Icon name={dark ? "sun" : "moon"} size={18} />
    </button>
  );
}
