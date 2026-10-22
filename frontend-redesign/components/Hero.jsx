"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

// Parent controls the order; each child fades up one after another
const container = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } };
const rise = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] } },
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
        <motion.span className="lf-pill" variants={rise}>
          <span className="lf-pill-dot" /> Students helping students
        </motion.span>
        <motion.h1 className="lf-h1" variants={rise}>
          Lost it on campus?
          <br />
          <span className="lf-grad">Let’s get it home.</span>
        </motion.h1>
        <motion.p className="lf-lead" variants={rise}>
          Post what you lost or found in under a minute. No more buried WhatsApp messages, just one
          friendly place where students help students.
        </motion.p>
        <motion.div className="lf-cta" variants={rise}>
          <Link href="/items/new?type=lost" className="lf-btn lf-btn-lost">😟 I lost something</Link>
          <Link href="/items/new?type=found" className="lf-btn lf-btn-found">🙌 I found something</Link>
        </motion.div>
        <motion.form className="lf-search" variants={rise} onSubmit={onSearch} role="search">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search “blue bottle”, “ID card”…"
            aria-label="Search items"
          />
          <button type="submit" className="lf-btn lf-btn-sm">Search</button>
        </motion.form>
      </div>

      {/* Three example cards floating gently (CSS animation, off for reduced motion) */}
      <motion.div className="lf-stack" variants={rise} aria-hidden="true">
        <div className="lf-fc lf-fc-one">
          <div className="lf-ph" style={{ background: "#e4e2ff" }}>🪪</div>
          <span className="lf-tag lf-tag-lost">Lost</span>
          <h4>Student ID card</h4>
          <p>Library, 2nd floor</p>
        </div>
        <div className="lf-fc lf-fc-two">
          <span className="lf-returned">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6" /></svg>
            Returned
          </span>
          <div className="lf-ph" style={{ background: "#d4f5e9" }}>🧴</div>
          <span className="lf-tag lf-tag-found">Found</span>
          <h4>Steel water bottle</h4>
          <p>Canteen</p>
        </div>
        <div className="lf-fc lf-fc-three">
          <div className="lf-ph" style={{ background: "#ffe3d6" }}>🔑</div>
          <span className="lf-tag lf-tag-lost">Lost</span>
          <h4>Hostel keys</h4>
          <p>Near Block C</p>
        </div>
      </motion.div>
    </motion.section>
  );
}
