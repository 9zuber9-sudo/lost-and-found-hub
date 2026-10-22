"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// "Mark as returned" button + confirmation popup + animated check mark.
// Show it ONLY when the logged-in user owns the item.
// Props: onConfirm = async function that updates the item in Supabase (status = 'returned').
// If onConfirm throws, the error text is shown inside the popup.
export default function ReturnedButton({ onConfirm, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState("idle"); // idle | loading | done
  const [error, setError] = useState("");

  // Close with the Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && state !== "loading" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, state]);

  async function confirm() {
    setState("loading");
    setError("");
    try {
      await onConfirm();
      setState("done");
      setTimeout(() => {
        setOpen(false);
        setState("idle");
      }, 1600);
    } catch (e) {
      setError(e?.message || "Something went wrong. Please try again.");
      setState("idle");
    }
  }

  return (
    <>
      <button type="button" className="lf-btn lf-btn-found" disabled={disabled} onClick={() => setOpen(true)}>
        Mark as returned
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="lf-modal-back"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => state !== "loading" && setOpen(false)}
          >
            <motion.div
              className="lf-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="lf-returned-title"
              initial={{ opacity: 0, y: 30, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {state === "done" ? (
                <>
                  <svg className="lf-check" viewBox="0 0 72 72" fill="none" aria-hidden="true">
                    <motion.circle cx="36" cy="36" r="32" stroke="var(--lf-found)" strokeWidth="4"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
                    <motion.path d="M22 37l10 10 18-21" stroke="var(--lf-found)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.5 }} />
                  </svg>
                  <h3 id="lf-returned-title">Marked as returned!</h3>
                  <p>Thanks for helping someone out.</p>
                </>
              ) : (
                <>
                  <h3 id="lf-returned-title">Mark this item as returned?</h3>
                  <p>Everyone will see a “Returned” stamp on this post.</p>
                  {error && <p className="lf-error" role="alert">{error}</p>}
                  <div className="lf-modal-actions">
                    <button type="button" className="lf-btn lf-btn-ghost" onClick={() => setOpen(false)} disabled={state === "loading"}>
                      Cancel
                    </button>
                    <button type="button" className="lf-btn lf-btn-found" onClick={confirm} disabled={state === "loading"}>
                      {state === "loading" ? "Saving…" : "Yes, it’s returned"}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
