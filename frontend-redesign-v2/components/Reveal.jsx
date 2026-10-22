"use client";
import { motion, useReducedMotion } from "framer-motion";

// Wrap anything in <Reveal> and it fades up when it scrolls into view (only once)
export default function Reveal({ children, delay = 0, y = 24, className = "" }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
