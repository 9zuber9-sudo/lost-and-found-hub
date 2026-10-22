"use client";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { emojiFor } from "../lib/categories";
import { timeAgo } from "../lib/format";

// One note on the board. `item` = a row from the `items` table, `index` = position (for the staggered entrance).
// The little tilt, the tape on top and the hover "straighten up" are done in CSS (see .lf-item in globals.css).
export default function ItemCard({ item, index = 0 }) {
  const reduce = useReducedMotion();
  const returned = item.status === "returned";

  return (
    <motion.div
      className="lf-item-wrap"
      layout={!reduce}
      initial={reduce ? false : { opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay: Math.min(index, 8) * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {returned && (
        <span className="lf-returned">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 12l5 5L20 6" />
          </svg>
          Returned
        </span>
      )}
      <Link href={`/items/${item.id}`} className="lf-item">
        <div className="lf-item-media">
          {item.image_url ? (
            <Image src={item.image_url} alt={`${item.title} (${item.type} item)`} width={640} height={420} unoptimized />
          ) : (
            <span aria-hidden="true">{emojiFor(item.category)}</span>
          )}
        </div>
        <span className={`lf-tag ${item.type === "lost" ? "lf-tag-lost" : "lf-tag-found"}`}>
          {item.type === "lost" ? "Lost" : "Found"}
        </span>
        {item.type === "lost" && item.reward_details && (
          <span className="lf-reward">🎁 Reward: {item.reward_details}</span>
        )}
        <h3>{item.title}</h3>
        <div className="lf-meta">
          <span>{item.location || "Unknown place"}</span>
          <span>· {timeAgo(item.created_at)}</span>
        </div>
      </Link>
    </motion.div>
  );
}
