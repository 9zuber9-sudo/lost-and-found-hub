"use client";
import { motion, useReducedMotion } from "framer-motion";

export default function Template({ children }) {
  const reduce = useReducedMotion();
  return (
    <motion.main
      className="lf-main"
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.main>
  );
}
