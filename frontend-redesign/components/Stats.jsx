"use client";
import { useEffect, useState } from "react";
import * as client from "../lib/supabaseClient";
import { CATEGORIES } from "../lib/categories";
import CountUp from "./CountUp";

const supabase = client.supabase || client.default;

// Three real numbers from the database (they show 0 until loaded, or if the query fails)
export default function Stats() {
  const [posts, setPosts] = useState(0);
  const [returned, setReturned] = useState(0);

  useEffect(() => {
    if (!supabase) return;
    async function load() {
      const all = await supabase.from("items").select("*", { count: "exact", head: true }).in("status", ["open", "returned"]);
      const done = await supabase.from("items").select("*", { count: "exact", head: true }).eq("status", "returned");
      setPosts(all.count || 0);
      setReturned(done.count || 0);
    }
    load();
  }, []);

  return (
    <div className="lf-stats">
      <div className="lf-card lf-card-flat lf-stat"><b><CountUp to={posts} /></b><span>Items posted</span></div>
      <div className="lf-card lf-card-flat lf-stat"><b><CountUp to={returned} /></b><span>Items returned</span></div>
      <div className="lf-card lf-card-flat lf-stat"><b><CountUp to={CATEGORIES.length} /></b><span>Categories</span></div>
    </div>
  );
}
