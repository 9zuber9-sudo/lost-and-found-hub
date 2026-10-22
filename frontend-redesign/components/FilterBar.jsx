"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CATEGORIES } from "../lib/categories";

const TYPES = [["all", "All"], ["lost", "Lost"], ["found", "Found"]];
const STATUSES = [["all", "All"], ["open", "Open"], ["returned", "Returned"]];

// Row of pill buttons. The dark "active" background slides between options (layoutId).
export function Chips({ label, options, value, onPick, id }) {
  return (
    <div className="lf-chips" role="group" aria-label={label}>
      {options.map(([val, text]) => (
        <button key={val} type="button" className="lf-chip" aria-pressed={value === val} onClick={() => onPick(val)}>
          {value === val && (
            <motion.span layoutId={`lf-chip-${id}`} className="lf-chip-bg" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
          )}
          <span className="lf-chip-text">{text}</span>
        </button>
      ))}
    </div>
  );
}

// Props: value = { q, type, category, status }, onChange(newValue)
export default function FilterBar({ value, onChange }) {
  // Keep the typed text locally and only tell the parent after 350ms of no typing (debounce)
  const [text, setText] = useState(value.q || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (text !== value.q) onChange({ ...value, q: text });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <div className="lf-filters">
      <input
        type="search"
        className="lf-input"
        placeholder="Search by title or description…"
        aria-label="Search items"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="lf-filter-row">
        <Chips id="type" label="Type" options={TYPES} value={value.type} onPick={(type) => onChange({ ...value, type })} />
        <Chips id="status" label="Status" options={STATUSES} value={value.status} onPick={(status) => onChange({ ...value, status })} />
        <select
          className="lf-input"
          style={{ width: "auto" }}
          aria-label="Category"
          value={value.category}
          onChange={(e) => onChange({ ...value, category: e.target.value })}
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
