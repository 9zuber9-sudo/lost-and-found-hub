"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";
import FilterBar from "../../components/FilterBar";
import ItemCard from "../../components/ItemCard";

function Browser() {
  const reduce = useReducedMotion();
  const params = useSearchParams();
  const [filters, setFilters] = useState({ q: params.get("q") || "", type: "all", category: params.get("category") || "all", status: "all" });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Re-fetch from Supabase every time a filter changes
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      if (!supabase) {
        setError("Supabase is not configured.");
        setLoading(false);
        return;
      }
      let query = supabase
        .from("items")
        .select("id,type,title,location,category,image_url,status,created_at")
        .in("status", filters.status === "all" ? ["open", "returned"] : [filters.status])
        .order("created_at", { ascending: false });
      if (filters.type !== "all") query = query.eq("type", filters.type);
      if (filters.category !== "all") query = query.eq("category", filters.category);
      const q = filters.q.replace(/[,()%]/g, " ").trim(); // remove characters that would break the filter
      if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
      const { data, error } = await query;
      if (cancelled) return;
      if (error) setError(error.message);
      else setItems(data || []);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [filters]);

  return (
    <div className="lf-page">
      <p className="lf-hand" style={{ margin: 0 }}>the whole board</p>
      <h1 className="lf-page-title">Find your stuff</h1>
      <p className="lf-sub">Everything students have posted, newest first.</p>

      <FilterBar value={filters} onChange={setFilters} />

      {error && <p className="lf-error" role="alert">{error}</p>}
      {!loading && !error && <p className="lf-count">{items.length} item{items.length === 1 ? "" : "s"} found</p>}

      {loading ? (
        <div className="lf-grid">{[0, 1, 2, 3, 4, 5, 6, 7].map((n) => <div key={n} className="lf-skel" />)}</div>
      ) : items.length === 0 ? (
        <motion.div className="lf-card lf-card-flat lf-empty" initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0 : 0.3 }}>
          <span className="lf-empty-emoji" aria-hidden="true">{"¯\\_(ツ)_/¯"}</span>
          <h3>Nothing matches that</h3>
          <p>Try different words, or post it yourself so others can find it.</p>
          <Link href="/items/new" className="lf-btn lf-btn-primary">Post something</Link>
        </motion.div>
      ) : (
        <div className="lf-grid">
          <AnimatePresence mode="popLayout">
            {items.map((item, i) => <ItemCard key={item.id} item={item} index={i} />)}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// useSearchParams needs a Suspense wrapper in Next.js
export default function ItemsPage() {
  return (
    <Suspense fallback={<div className="lf-page"><div className="lf-grid">{[0, 1, 2, 3].map((n) => <div key={n} className="lf-skel" />)}</div></div>}>
      <Browser />
    </Suspense>
  );
}
