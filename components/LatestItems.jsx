"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import ItemCard from "./ItemCard";
import { Chips } from "./FilterBar";

const TYPES = [["all", "All"], ["lost", "Lost"], ["found", "Found"]];

// Latest 8 posts for the home page, with quick Lost/Found chips
export default function LatestItems() {
  const reduce = useReducedMotion();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("all");

  useEffect(() => {
    async function load() {
      if (!supabase) return setLoading(false);
      const { data } = await supabase
        .from("items")
        .select("id,type,title,location,category,image_url,reward_details,status,created_at")
        .in("status", ["open", "returned"])
        .order("created_at", { ascending: false })
        .limit(8);
      setItems(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const shown = type === "all" ? items : items.filter((i) => i.type === type);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <p className="lf-hand" style={{ margin: 0 }}>fresh on the board</p>
          <h2 className="lf-h2" style={{ margin: 0 }}>Recently posted</h2>
        </div>
        <Link href="/items" className="lf-btn lf-btn-ghost lf-btn-sm">See everything →</Link>
      </div>
      <div style={{ margin: "20px 0 14px" }}>
        <Chips id="home-type" label="Filter by type" options={TYPES} value={type} onPick={setType} />
      </div>

      {loading ? (
        <div className="lf-grid">{[0, 1, 2, 3].map((n) => <div key={n} className="lf-skel" />)}</div>
      ) : shown.length === 0 ? (
        <motion.div className="lf-card lf-card-flat lf-empty" initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0 : 0.3 }}>
          <span className="lf-empty-emoji" aria-hidden="true">{"¯\\_(ツ)_/¯"}</span>
          <h3>Nothing here yet</h3>
          <p>Be the first to put something on the board.</p>
          <Link href="/items/new" className="lf-btn lf-btn-primary">Post something</Link>
        </motion.div>
      ) : (
        <div className="lf-grid">
          <AnimatePresence mode="popLayout">
            {shown.map((item, i) => <ItemCard key={item.id} item={item} index={i} />)}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
