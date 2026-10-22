"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

export default function ResetPasswordForm() {
  const [checking, setChecking] = useState(true);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return;
    }

    let mounted = true;
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY" || session) setRecoveryReady(true);
      setChecking(false);
    });

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!mounted) return;
      if (data.session) setRecoveryReady(true);
      if (sessionError) setError("This reset link is invalid or has expired. Request a new one.");
      setChecking(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!supabase) return;
    setError("");
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) setError(updateError.message);
    else setUpdated(true);
    setBusy(false);
  }

  if (checking) return <div className="lf-auth lf-card"><p className="lf-sub">Checking your reset link…</p></div>;

  if (updated) {
    return (
      <section className="lf-auth lf-card" aria-live="polite">
        <h1 className="lf-page-title">Password updated</h1>
        <p className="lf-sub">Your new password is ready. Sign in with it now.</p>
        <Link className="lf-btn lf-btn-primary" href="/login">Go to sign in</Link>
      </section>
    );
  }

  if (!isSupabaseConfigured || !recoveryReady) {
    return (
      <section className="lf-auth lf-card">
        <h1 className="lf-page-title">Reset link unavailable</h1>
        <p className="lf-error" role="alert">{!isSupabaseConfigured ? "Supabase is not configured. Check your environment variables." : error || "This reset link is invalid or has expired. Request a new one."}</p>
        <Link className="lf-btn lf-btn-primary" href="/forgot-password">Request another reset link</Link>
        <Link className="lf-link" href="/login">Back to sign in</Link>
      </section>
    );
  }

  return (
    <form className="lf-auth lf-card" onSubmit={handleSubmit}>
      <div>
        <h1 className="lf-page-title">Choose a new password</h1>
        <p className="lf-sub">Use at least 6 characters for your new password.</p>
      </div>
      <div className="lf-field">
        <label className="lf-label" htmlFor="new-password">New password</label>
        <input id="new-password" className="lf-input" autoComplete="new-password" disabled={busy} minLength={6} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
      </div>
      <div className="lf-field">
        <label className="lf-label" htmlFor="confirm-password">Confirm new password</label>
        <input id="confirm-password" className="lf-input" autoComplete="new-password" disabled={busy} minLength={6} onChange={(event) => setConfirmPassword(event.target.value)} required type="password" value={confirmPassword} />
      </div>
      {error && <p className="lf-error" role="alert">{error}</p>}
      <button className="lf-btn lf-btn-primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Save new password"}</button>
    </form>
  );
}
