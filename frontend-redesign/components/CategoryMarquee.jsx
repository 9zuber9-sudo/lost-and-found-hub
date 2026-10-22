import { CATEGORIES } from "../lib/categories";

// Sideways auto-scrolling strip of category pills (pure CSS, pauses on hover)
export default function CategoryMarquee() {
  // Repeat the list 4 times so the loop never shows a gap on wide screens
  const loop = [...CATEGORIES, ...CATEGORIES, ...CATEGORIES, ...CATEGORIES];
  return (
    <div className="lf-marq" aria-hidden="true">
      <div className="lf-track">
        {loop.map((c, i) => (
          <span key={i}>{c.emoji} {c.name}</span>
        ))}
      </div>
    </div>
  );
}
