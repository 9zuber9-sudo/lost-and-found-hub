"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import Toast from "@/components/Toast";

const MAX_PHOTO_SIZE = 3 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function ItemForm({ initialType = "lost" }) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const { user } = useAuth();
  const [type, setType] = useState(initialType);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [rewardDetails, setRewardDetails] = useState("");
  const [contact, setContact] = useState("");
  const [hiddenDetail, setHiddenDetail] = useState("");
  const [photo, setPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const closeToast = useCallback(() => setShowToast(false), []);

  useEffect(() => {
    if (!previewUrl) return undefined;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function onFile(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;

    if (!PHOTO_TYPES.includes(selected.type)) {
      setErrors((current) => ({ ...current, photo: "Choose a JPEG, PNG, WebP, or GIF image." }));
      setPhoto(null);
      setPreviewUrl("");
      return;
    }
    if (selected.size > MAX_PHOTO_SIZE) {
      setErrors((current) => ({ ...current, photo: "Choose an image smaller than 3 MB." }));
      setPhoto(null);
      setPreviewUrl("");
      return;
    }

    setErrors((current) => ({ ...current, photo: "" }));
    setPhoto(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!supabase || !user) return;

    const nextErrors = {};
    if (!title.trim()) nextErrors.title = "Add a short title.";
    if (!category) nextErrors.category = "Choose a category.";
    if (!location.trim()) nextErrors.location = "Add where it was lost or found.";
    if (!date) nextErrors.date = "Choose the date.";
    if (!contact.trim()) nextErrors.contact = "Add a way for the owner or finder to contact you.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setShowToast(false);

    try {
      let imageUrl = null;
      if (photo) {
        // Keep each user's uploads in their own folder in the public bucket.
        const safeName = photo.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${user.id}/${Date.now()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from("item-images")
          .upload(path, photo, { contentType: photo.type, upsert: false });
        if (uploadError) throw uploadError;

        imageUrl = supabase.storage.from("item-images").getPublicUrl(path).data.publicUrl;
      }

      const { data, error: insertError } = await supabase
        .from("items")
        .insert({
          type,
          title: title.trim(),
          description: description.trim(),
          category,
          location: location.trim(),
          date_happened: date,
          reward_details: type === "lost" ? rewardDetails.trim() || null : null,
          image_url: imageUrl,
          contact_info: contact.trim(),
          hidden_detail: type === "found" ? hiddenDetail.trim() || null : null,
        })
        .select("id")
        .single();
      if (insertError) throw insertError;

      setToastType("success");
      setToastMessage("Submitted for review. It will appear on the board after approval.");
      setShowToast(true);
      window.setTimeout(() => router.push(`/items/${data.id}`), 900);
    } catch (error) {
      setToastType("error");
      setToastMessage(error.message || "Could not post the item. Please try again.");
      setShowToast(true);
      setSubmitting(false);
    }
  }

  return (
    <>
      <form className="lf-form lf-card" onSubmit={handleSubmit}>
        <div className="lf-seg" role="radiogroup" aria-label="Item type">
          <button aria-checked={type === "lost"} className={`lf-seg-btn ${type === "lost" ? "is-lost" : ""}`} onClick={() => setType("lost")} role="radio" type="button">I lost it</button>
          <button aria-checked={type === "found"} className={`lf-seg-btn ${type === "found" ? "is-found" : ""}`} onClick={() => setType("found")} role="radio" type="button">I found it</button>
        </div>

        <div className="lf-field">
          <label className="lf-label" htmlFor="title">What is it?</label>
          <input className="lf-input" id="title" maxLength={100} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Blue steel bottle" required value={title} />
          {errors.title && <p className="lf-error">{errors.title}</p>}
        </div>

        <div className="lf-field">
          <label className="lf-label" htmlFor="description">Description</label>
          <textarea className="lf-input" id="description" maxLength={1000} onChange={(event) => setDescription(event.target.value)} value={description} />
        </div>

        <div className="lf-field">
          <label className="lf-label" htmlFor="category">Category</label>
          <select className="lf-input" id="category" onChange={(event) => setCategory(event.target.value)} required value={category}>
            <option value="">Choose one</option>
            {CATEGORIES.map((item) => <option key={item.name} value={item.name}>{item.emoji} {item.name}</option>)}
          </select>
          {errors.category && <p className="lf-error">{errors.category}</p>}
        </div>

        <div className="lf-field">
          <label className="lf-label" htmlFor="location">Where was it {type}?</label>
          <input className="lf-input" id="location" maxLength={160} onChange={(event) => setLocation(event.target.value)} required value={location} />
          {errors.location && <p className="lf-error">{errors.location}</p>}
        </div>

        <div className="lf-field">
          <label className="lf-label" htmlFor="date">Date</label>
          <input className="lf-input" id="date" onChange={(event) => setDate(event.target.value)} required type="date" value={date} />
          {errors.date && <p className="lf-error">{errors.date}</p>}
        </div>

        {type === "lost" && (
          <div className="lf-field">
            <label className="lf-label" htmlFor="reward-details">Reward (optional)</label>
            <input className="lf-input" id="reward-details" maxLength={120} onChange={(event) => setRewardDetails(event.target.value)} placeholder="e.g. ₹200 or a thank-you treat" value={rewardDetails} />
            <p className="lf-help">You and the finder can agree on the details directly. Any payment happens outside the app.</p>
          </div>
        )}

        <div className="lf-field">
          <label className="lf-label" htmlFor="contact">Contact details</label>
          <input className="lf-input" id="contact" maxLength={200} onChange={(event) => setContact(event.target.value)} placeholder="Email, phone, or WhatsApp" required value={contact} />
          <p className="lf-help">Only signed-in users can see these details.</p>
          {errors.contact && <p className="lf-error">{errors.contact}</p>}
        </div>

        <label className="lf-drop">
          <span>Tap to add a photo (images only, max 3 MB)</span>
          <input accept="image/*" aria-label="Choose an item photo" onChange={onFile} type="file" />
          {photo && <span className="lf-help">{photo.name}</span>}
          {previewUrl && <Image className="lf-preview" src={previewUrl} alt="Preview of the selected item" width={800} height={600} unoptimized />}
        </label>
        {errors.photo && <p className="lf-error" role="alert">{errors.photo}</p>}

        <AnimatePresence initial={false}>
          {type === "found" && (
            <motion.div animate={{ height: "auto", opacity: 1 }} className="lf-field" exit={{ height: 0, opacity: 0, transition: { duration: reduce ? 0 : 0.2 } }} initial={reduce ? false : { height: 0, opacity: 0 }} style={{ overflow: "hidden" }} transition={{ duration: reduce ? 0 : 0.25 }}>
              <label className="lf-label" htmlFor="hidden-detail">Hidden ownership detail (optional)</label>
              <textarea className="lf-input" id="hidden-detail" maxLength={300} onChange={(event) => setHiddenDetail(event.target.value)} placeholder="A detail the real owner can tell you privately" value={hiddenDetail} />
              <p className="lf-help">This stays private and is never shown on the public item page.</p>
            </motion.div>
          )}
        </AnimatePresence>

        <button className="lf-btn lf-btn-primary" disabled={submitting} type="submit">
          {submitting ? "Posting…" : "Post it"}
        </button>
      </form>
      <Toast show={showToast} message={toastMessage} type={toastType} onClose={closeToast} />
    </>
  );
}
