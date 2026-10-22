"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ItemForm from "@/components/ItemForm";
import { useAuth } from "@/components/AuthProvider";

function NewItemContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const requestedType = searchParams.get("type");
  const initialType = requestedType === "found" ? "found" : "lost";

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=%2Fitems%2Fnew");
  }, [loading, router, user]);

  if (loading || !user) return <div className="lf-page">Checking your account…</div>;

  return (
    <div className="lf-page">
      <p className="lf-hand">give an item its way home</p>
      <h1 className="lf-page-title">Post an item</h1>
      <p className="lf-sub">Add a few details so the right person can recognize it.</p>
      <div style={{ marginTop: 24 }}>
        <ItemForm initialType={initialType} />
      </div>
    </div>
  );
}

export default function NewItemPage() {
  return <Suspense fallback={<div className="lf-page">Loading the form…</div>}><NewItemContent /></Suspense>;
}
