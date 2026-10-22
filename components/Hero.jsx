"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

// Parent controls the order; each child fades up one after another
const container = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } } };
const rise = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] } },
};
// Sticky notes "drop" onto the board one by one
const drop = {
  hidden: { opacity: 0, y: -50 },
  show: (i) => ({ opacity: 1, y: 0, transition: { type: "spring", stiffness: 140, damping: 14, delay: 0.5 + i * 0.18 } }),
};

export default function Hero() {
  const [q, setQ] = useState("");
  const router = useRouter();
  const reduce = useReducedMotion();

  function onSearch(e) {
    e.preventDefault();
    const text = q.trim();
    router.push(text ? `/items?q=${encodeURIComponent(text)}` : "/items");
  }

  return (
    <motion.section
      className="lf-section lf-hero"
      variants={container}
      initial={reduce ? false : "hidden"}
      animate="show"
    >
      <div>
        <motion.p className="lf-hand" variants={rise}>psst… lost something?</motion.p>
        <motion.h1 className="lf-h1" variants={rise}>
          Lost something on campus? Let’s <span className="lf-mark">find it</span>.
        </motion.h1>
        <motion.p className="lf-lead" variants={rise}>
          Post what you lost or found, add a photo, and the right person can reach you. Way better than a
          WhatsApp message that gets buried in five minutes.
        </motion.p>
        <motion.div className="lf-cta" variants={rise}>
          <Link href="/items/new?type=lost" className="lf-btn lf-btn-lost">I lost something</Link>
          <Link href="/items/new?type=found" className="lf-btn lf-btn-found">I found something</Link>
        </motion.div>
        <motion.form className="lf-search" variants={rise} onSubmit={onSearch} role="search">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for a bottle, ID card, keys…"
            aria-label="Search items"
          />
          <button type="submit" className="lf-btn lf-btn-sm">Search</button>
        </motion.form>
      </div>

      {/* A little notice board with three example notes (just for decoration) */}
      <div className="lf-board" aria-hidden="true">
        <motion.div className="lf-sticky-pos" custom={0} variants={drop}>
          <div className="lf-sticky lf-sticky-1">Lost: black earbuds case<small>Auditorium, around 2pm</small></div>
        </motion.div>
        <motion.div className="lf-sticky-pos" custom={1} variants={drop}>
          <div className="lf-sticky lf-sticky-2">Found: blue water bottle<small>Near the canteen</small></div>
        </motion.div>
        <motion.div className="lf-sticky-pos" custom={2} variants={drop}>
          <div className="lf-sticky lf-sticky-3">Got my ID back!<small>thank you whoever you are</small></div>
        </motion.div>
      </div>
    </motion.section>
  );
}
