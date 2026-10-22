// Soft pastel blobs drifting slowly + a faint dot grid. Pure CSS, so it is light on phones.
// The animation is switched off automatically for people who prefer reduced motion (see globals.css).
export default function AnimatedBackground() {
  return (
    <div className="lf-bg" aria-hidden="true">
      <div className="lf-blob lf-blob-a" />
      <div className="lf-blob lf-blob-b" />
      <div className="lf-blob lf-blob-c" />
      <div className="lf-dots" />
    </div>
  );
}
