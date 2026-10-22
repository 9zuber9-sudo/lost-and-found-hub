"use client";

import { useState } from "react";
import Link from "next/link";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!supabase || typeof window === "undefined") return;
    setBusy(true);
    setError("");
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (authError) setError(authError.message);
    else setSent(true);
    setBusy(false);
  }

  if (sent) {
    return (
      <section className="lf-auth lf-card" aria-live="polite">
        <h1 className="lf-page-title">Check your email</h1>
        <p className="lf-sub">If an account exists for {email}, we sent a password reset link. Open it on this device to choose a new password.</p>
        <Link className="lf-btn lf-btn-primary" href="/login">Back to sign in</Link>
      </section>
    );
  }

  return (
    <form className="lf-auth lf-card" onSubmit={handleSubmit}>
      <div>
        <h1 className="lf-page-title">Reset your password</h1>
        <p className="lf-sub">Enter the email address on your account and we’ll send you a reset link.</p>
      </div>
      {!isSupabaseConfigured && <p className="lf-note">Supabase is not configured. Check your environment variables and restart the app.</p>}
      <div className="lf-field">
        <label className="lf-label" htmlFor="recovery-email">Email</label>
        <input id="recovery-email" className="lf-input" autoComplete="email" disabled={!isSupabaseConfigured || busy} onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
      </div>
      {error && <p className="lf-error" role="alert">{error}</p>}
      <button className="lf-btn lf-btn-primary" type="submit" disabled={!isSupabaseConfigured || busy}>{busy ? "Sending…" : "Send reset link"}</button>
      <Link className="lf-link" href="/login">Back to sign in</Link>
    </form>
  );
}
