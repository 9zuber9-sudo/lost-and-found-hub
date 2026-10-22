"use client";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Small message that slides up from the bottom, then hides itself.
// Usage: <Toast show={show} message="Item posted!" onClose={() => setShow(false)} />
// (wrap onClose in useCallback if you pass a new function on every render)
export default function Toast({ show, message, type = "success", onClose, duration = 3200 }) {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(timer);
  }, [show, duration, onClose]);

  return (
    <div className="lf-toast-wrap" aria-live="polite">
      <AnimatePresence>
        {show && (
          <motion.div
            key="toast"
            className="lf-toast"
            role="status"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <span className="lf-toast-icon" aria-hidden="true">{type === "error" ? "!" : "✓"}</span>
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
