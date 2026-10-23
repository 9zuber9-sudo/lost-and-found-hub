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
  const [activeTab, setActiveTab] = useState("new");

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

  const loadItems = useCallback(async () => {
    if (!supabase) return;
    setLoadingItems(true);
    setError("");
    const { data, error: loadError } = await supabase
      .from("items")
      .select("id,user_id,type,title,description,category,location,date_happened,image_url,reward_details,status,created_at")

      .order("created_at", { ascending: false });
    if (loadError) setError(loadError.message);
    else setItems(data || []);
    setLoadingItems(false);
  }, []);

  useEffect(() => {
    if (isAdmin) loadItems();
  }, [isAdmin, loadItems]);

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
      await loadItems();
    }
    setBusyId("");
  }

  async function removeItem(item, action) {
    if (!supabase) return;
    const isDecline = action === "decline";
    const prompt = isDecline
      ? `Decline "${item.title}"? This will remove the pending post.`
      : `Permanently delete "${item.title}"?`;
    if (!window.confirm(prompt)) return;

    setBusyId(item.id);
    setError("");
    setMessage("");

    try {
      if (item.image_url) {
        const imageUrl = new URL(item.image_url);
        const marker = "/storage/v1/object/public/item-images/";
        const markerIndex = imageUrl.pathname.indexOf(marker);
        if (markerIndex !== -1) {
          const imagePath = decodeURIComponent(imageUrl.pathname.slice(markerIndex + marker.length));
          const { error: imageError } = await supabase.storage.from("item-images").remove([imagePath]);
          if (imageError) throw imageError;
        }
      }

      const { error: deleteError } = await supabase.from("items").delete().eq("id", item.id);
      if (deleteError) throw deleteError;
      setMessage(isDecline ? "Post declined and removed." : "Post deleted.");
      await loadItems();
    } catch (deleteError) {
      setError(deleteError.message || `Could not ${isDecline ? "decline" : "delete"} this post.`);
    } finally {
      setBusyId("");
    }
  }
  const renderPostCard = (item, isPending) => (
    <article className="lf-card lf-admin-card" key={item.id}>
      {item.image_url ? (
        <div className="lf-admin-image-wrap">
          <Image src={item.image_url} alt={item.title} width={640} height={420} unoptimized className="lf-admin-image" />
        </div>
      ) : (
        <div className="lf-admin-image-placeholder" aria-hidden="true">{item.type === "lost" ? "?" : "✓"}</div>
      )}
      <div className="lf-admin-card-body">
        <div className="lf-admin-card-topline">
          <span className={`lf-tag ${item.type === "lost" ? "lf-tag-lost" : "lf-tag-found"}`}>{item.type}</span>
          <span className={`lf-admin-status lf-admin-status-${item.status}`}>{item.status}</span>
        </div>
        <h3>{item.title}</h3>
        <p className="lf-admin-meta">{item.category || "Other"}<span aria-hidden="true">·</span>{item.location || "Location not provided"}</p>
        <p className="lf-admin-description">{item.description || "No description provided."}</p>
        {item.reward_details && <p className="lf-reward"><strong>Reward:</strong> {item.reward_details}</p>}
        <p className="lf-admin-submitter">Submitted by <span>{item.user_id}</span></p>
      </div>
      <div className="lf-admin-actions">
        {isPending ? (
          <>
            <button className="lf-btn lf-btn-primary" disabled={busyId === item.id} onClick={() => approve(item.id)} type="button">
              {busyId === item.id ? "Saving…" : "Approve"}
            </button>
            <button className="lf-btn lf-btn-lost" disabled={busyId === item.id} onClick={() => removeItem(item, "decline")} type="button">
              {busyId === item.id ? "Declining…" : "Decline"}
            </button>
          </>
        ) : (
          <button className="lf-btn lf-btn-lost" disabled={busyId === item.id} onClick={() => removeItem(item, "delete")} type="button">
            {busyId === item.id ? "Deleting…" : "Delete post"}
          </button>
        )}
      </div>
    </article>
  );
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
      <h1 className="lf-page-title">Manage posts</h1>
      <p className="lf-sub">Review new submissions and remove posts that should no longer be on the board.</p>

      {error && <p className="lf-error" role="alert">{error}</p>}
      {message && <p className="lf-note" role="status">{message}</p>}
      <div className="lf-admin-tabs" role="tablist" aria-label="Post status">
        <button className="lf-admin-tab" type="button" role="tab" aria-selected={activeTab === "new"} onClick={() => setActiveTab("new")}>
          New <span>{items.filter((item) => item.status === "pending").length}</span>
        </button>
        <button className="lf-admin-tab" type="button" role="tab" aria-selected={activeTab === "old"} onClick={() => setActiveTab("old")}>
          Old <span>{items.filter((item) => item.status !== "pending").length}</span>
        </button>
      </div>

      {loadingItems ? (
        <div className="lf-admin-list">{[0, 1, 2].map((n) => <div className="lf-skel" key={n} />)}</div>
      ) : (
        <section className="lf-admin-tabpanel" role="tabpanel">
          <div className="lf-admin-section-heading">
            <div>
              <p className="lf-hand">{activeTab === "new" ? "needs your review" : "already reviewed"}</p>
              <h2>{activeTab === "new" ? "New posts" : "Old posts"}</h2>
            </div>
            <p>{activeTab === "new" ? "Approve posts to publish them, or decline to remove them." : "Approved and returned posts on the board."}</p>
          </div>
          {items.filter((item) => activeTab === "new" ? item.status === "pending" : item.status !== "pending").length > 0 ? (
            <div className="lf-admin-list">
              {items
                .filter((item) => activeTab === "new" ? item.status === "pending" : item.status !== "pending")
                .map((item) => renderPostCard(item, activeTab === "new"))}
            </div>
          ) : (
            <div className="lf-card lf-admin-empty">
              <h3>{activeTab === "new" ? "All caught up" : "No old posts yet"}</h3>
              <p>{activeTab === "new" ? "New submissions will appear here." : "Approved posts will appear here."}</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
