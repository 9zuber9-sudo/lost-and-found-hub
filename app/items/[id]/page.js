"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import ReturnedButton from "@/components/ReturnedButton";
import { emojiFor } from "@/lib/categories";
import { supabase } from "@/lib/supabaseClient";

function contactLink(value) {
  if (value.includes("@")) return { href: `mailto:${value}`, text: "Email the poster", external: false };
  if (/^https?:\/\//i.test(value)) return { href: value, text: "Contact the poster", external: true };
  const phone = value.replace(/\D/g, "");
  return { href: `https://wa.me/${phone}`, text: "Contact on WhatsApp", external: true };
}

export default function ItemDetailPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [item, setItem] = useState(null);
  const [contact, setContact] = useState("");
  const [hiddenDetail, setHiddenDetail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return undefined;
    let cancelled = false;

    async function loadItem() {
      if (!supabase) {
        setError("Supabase is not configured.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      const { data, error: itemError } = await supabase
        .from("items")
        .select("id,user_id,type,title,description,category,location,date_happened,image_url,reward_details,status,created_at")
        .eq("id", id)
        .maybeSingle();

      if (cancelled) return;
      if (itemError) {
        setError(itemError.message);
        setLoading(false);
        return;
      }
      if (!data) {
        setItem(null);
        setLoading(false);
        return;
      }

      setItem(data);
      if (user) {
        // Private columns are fetched through guarded RPCs, never from a public row query.
        const { data: contactRows } = await supabase.rpc("get_item_contact", { p_item_id: data.id });
        if (cancelled) return;
        setContact(contactRows?.[0]?.contact_info ?? "");

        if (data.type === "found" && data.user_id === user.id) {
          const { data: detailRows } = await supabase.rpc("get_my_item_hidden_detail", { p_item_id: data.id });
          if (cancelled) return;
          setHiddenDetail(detailRows?.[0]?.hidden_detail ?? "");
        } else {
          setHiddenDetail("");
        }
      } else {
        setContact("");
        setHiddenDetail("");
      }
      setLoading(false);
    }

    loadItem();
    return () => { cancelled = true; };
  }, [authLoading, id, user]);

  async function markReturned() {
    if (!supabase || !item) throw new Error("The item could not be updated.");
    const { error: updateError } = await supabase.from("items").update({ status: "returned" }).eq("id", item.id);
    if (updateError) throw updateError;
    setItem((current) => ({ ...current, status: "returned" }));
  }

  if (loading) return <div className="lf-page"><div className="lf-card lf-card-flat">Loading item…</div></div>;
  if (error) return <div className="lf-page"><p className="lf-error" role="alert">{error}</p><Link className="lf-link" href="/items">← Back to all items</Link></div>;
  if (!item) return <div className="lf-page"><h1 className="lf-page-title">Item not found</h1><Link className="lf-link" href="/items">← Back to all items</Link></div>;

  const isOwner = user?.id === item.user_id;
  const contactAction = contact ? contactLink(contact) : null;
  const itemDate = item.date_happened
    ? new Date(`${item.date_happened}T00:00:00`).toLocaleDateString()
    : "Not provided";

  return (
    <div className="lf-page">
      <Link href="/items" className="lf-link">← Back to the board</Link>
      <div className="lf-detail">
        <div className="lf-detail-media">
          {item.image_url ? <Image src={item.image_url} alt={item.title} width={1200} height={900} unoptimized /> : <span aria-hidden="true">{emojiFor(item.category)}</span>}
        </div>
        <div className="lf-detail-body">
          <div>
            <span className={`lf-tag ${item.type === "lost" ? "lf-tag-lost" : "lf-tag-found"}`}>{item.type}</span>
            <h1 className="lf-page-title">{item.title}</h1>
          </div>
          <dl className="lf-kv">
            <dt>Category</dt><dd>{item.category}</dd>
            <dt>Location</dt><dd>{item.location}</dd>
            <dt>Date</dt><dd>{itemDate}</dd>
            <dt>Status</dt><dd>{item.status}</dd>
          </dl>
          <p>{item.description}</p>
          {item.type === "lost" && item.reward_details && (
            <div className="lf-reward lf-reward-detail">
              <span aria-hidden="true">🎁</span>
              <span><b>Reward offered</b><br />{item.reward_details}</span>
            </div>
          )}
          {item.status === "pending" ? (
            isOwner && <div className="lf-note"><b>Waiting for review</b>This post will appear on the public board after an admin approves it.</div>
          ) : user ? (
            <div className="lf-note">
              <b>Contact</b>
              {contactAction ? (
                <a href={contactAction.href} rel={contactAction.external ? "noreferrer" : undefined} target={contactAction.external ? "_blank" : undefined}>
                  {contactAction.text}: {contact}
                </a>
              ) : "No contact details were added."}
            </div>
          ) : (
            <Link href="/login" className="lf-btn lf-btn-primary">Log in to see contact details</Link>
          )}
          {isOwner && hiddenDetail && <div className="lf-note"><b>Your hidden detail (only you see this)</b>{hiddenDetail}</div>}
          {isOwner && item.status === "open" && <ReturnedButton onConfirm={markReturned} />}
          {item.status === "returned" && <span className="lf-returned" style={{ position: "static", width: "fit-content" }}>✓ Returned</span>}
        </div>
      </div>
    </div>
  );
}
