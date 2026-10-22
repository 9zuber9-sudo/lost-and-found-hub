"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../components/AuthProvider";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Ask Supabase whether this signed-in user has the admin role.
  useEffect(() => {
    let cancelled = false;

    async function checkAdmin() {
      if (authLoading) return;
      if (!user || !supabase) {
        setIsAdmin(false);
        setCheckingAdmin(false);
        return;
      }

      setCheckingAdmin(true);
      const { data, error: adminError } = await supabase.rpc("is_admin");
      if (cancelled) return;
      setIsAdmin(Boolean(data));
      setError(adminError?.message || "");
      setCheckingAdmin(false);
    }

    checkAdmin();
    return () => { cancelled = true; };
  }, [authLoading, user]);

  const loadPendingItems = useCallback(async () => {
    if (!supabase) return;
    setLoadingItems(true);
    setError("");
    const { data, error: loadError } = await supabase
      .from("items")
      .select("id,user_id,type,title,description,category,location,date_happened,image_url,reward_details,created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    if (loadError) setError(loadError.message);
    else setItems(data || []);
    setLoadingItems(false);
  }, []);

  useEffect(() => {
    if (isAdmin) loadPendingItems();
  }, [isAdmin, loadPendingItems]);

  async function approve(itemId) {
    if (!supabase) return;
    setBusyId(itemId);
    setError("");
    setMessage("");
    const { error: updateError } = await supabase
      .from("items")
      .update({ status: "open" })
      .eq("id", itemId)
      .eq("status", "pending");
    if (updateError) setError(updateError.message);
    else {
      setMessage("Post approved. It is now on the public board.");
      await loadPendingItems();
    }
    setBusyId("");
  }

  async function reject(itemId) {
    if (!supabase || !window.confirm("Reject and permanently remove this post?")) return;
    setBusyId(itemId);
    setError("");
    setMessage("");
    const { error: deleteError } = await supabase
      .from("items")
      .delete()
      .eq("id", itemId)
      .eq("status", "pending");
    if (deleteError) setError(deleteError.message);
    else {
      setMessage("Post rejected and removed.");
      await loadPendingItems();
    }
    setBusyId("");
  }

  if (authLoading || checkingAdmin) {
    return <div className="lf-page"><p className="lf-sub">Checking admin access…</p></div>;
  }

  if (!user) {
    return (
      <div className="lf-page">
        <p className="lf-hand">campus tools</p>
        <h1 className="lf-page-title">Admin review</h1>
        <p className="lf-sub">Sign in with an admin account to review new posts.</p>
        <Link className="lf-btn lf-btn-primary" href="/login?next=%2Fadmin">Log in</Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="lf-page">
        <p className="lf-hand">campus tools</p>
        <h1 className="lf-page-title">Admin review</h1>
        <p className="lf-note">This account does not have admin access.</p>
      </div>
    );
  }

  return (
    <div className="lf-page">
      <p className="lf-hand">campus tools</p>
      <h1 className="lf-page-title">Review new posts</h1>
      <p className="lf-sub">Approve a post to put it on the public board, or reject it to remove it.</p>

      {error && <p className="lf-error" role="alert">{error}</p>}
      {message && <p className="lf-note" role="status">{message}</p>}
      {loadingItems ? (
        <div className="lf-grid">{[0, 1, 2].map((n) => <div className="lf-skel" key={n} />)}</div>
      ) : items.length === 0 ? (
        <div className="lf-card lf-empty" style={{ marginTop: 24 }}>
          <h2>No posts waiting</h2>
          <p>New submissions will show up here for review.</p>
        </div>
      ) : (
        <div className="lf-grid">
          {items.map((item) => (
            <article className="lf-card" key={item.id}>
              {item.image_url && <Image src={item.image_url} alt={item.title} width={640} height={420} unoptimized className="lf-preview" />}
              <span className={`lf-tag ${item.type === "lost" ? "lf-tag-lost" : "lf-tag-found"}`}>{item.type}</span>
              <h2>{item.title}</h2>
              <p className="lf-meta">{item.category} · {item.location}</p>
              <p>{item.description || "No description provided."}</p>
              {item.reward_details && <p className="lf-help">Reward offered: {item.reward_details}</p>}
              <p className="lf-help">Submitted by {item.user_id}</p>
              <div className="lf-modal-actions">
                <button className="lf-btn lf-btn-primary" disabled={busyId === item.id} onClick={() => approve(item.id)} type="button">
                  {busyId === item.id ? "Saving…" : "Approve"}
                </button>
                <button className="lf-btn lf-btn-ghost" disabled={busyId === item.id} onClick={() => reject(item.id)} type="button">
                  Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
