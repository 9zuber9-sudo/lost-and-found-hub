// Faint paper dots + three little hand-drawn doodles (squiggle, ring, plus) that wander slowly.
// Pure CSS animation, so it is light on phones. It stops for people who prefer reduced motion (see globals.css).
export default function AnimatedBackground() {
  return (
    <div className="lf-bg" aria-hidden="true">
      <div className="lf-dots" />
      <svg className="lf-doodle lf-doodle-1" viewBox="0 0 100 40"><path d="M5 22 Q20 2 35 22 T65 22 T95 22" /></svg>
      <svg className="lf-doodle lf-doodle-2" viewBox="0 0 70 70"><circle cx="35" cy="35" r="26" /></svg>
      <svg className="lf-doodle lf-doodle-3" viewBox="0 0 60 60"><path d="M30 8v44M8 30h44" /></svg>
    </div>
  );
}
