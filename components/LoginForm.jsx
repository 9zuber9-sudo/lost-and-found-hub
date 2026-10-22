"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

export default function LoginForm() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function goToNextPage() {
    const requested = new URLSearchParams(window.location.search).get("next");
    const safePath = requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/";
    router.replace(safePath);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError("");
    setMessage("");

    if (mode === "signup") {
      const { data, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) setError(authError.message);
      else if (data.session) goToNextPage();
      else setMessage("Check your email for a confirmation link, then sign in.");
    } else {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) setError(authError.message);
      else goToNextPage();
    }
    setBusy(false);
  }

  if (!loading && user) {
    return (
      <div className="lf-auth lf-card">
        <h1 className="lf-page-title">You’re signed in</h1>
        <p className="lf-sub">{user.email}</p>
        <button className="lf-btn lf-btn-primary" onClick={goToNextPage} type="button">Continue</button>
      </div>
    );
  }

  return (
    <form className="lf-auth lf-card" onSubmit={handleSubmit}>
      <div>
        <h1 className="lf-page-title">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
        <p className="lf-sub">Use your college email to continue.</p>
      </div>

      <div aria-label="Sign in or sign up" className="lf-seg" role="group">
        <button className={`lf-seg-btn ${mode === "signin" ? "is-active" : ""}`} onClick={() => { setMode("signin"); setError(""); setMessage(""); }} type="button">Sign in</button>
        <button className={`lf-seg-btn ${mode === "signup" ? "is-active" : ""}`} onClick={() => { setMode("signup"); setError(""); setMessage(""); }} type="button">Create account</button>
      </div>

      {!isSupabaseConfigured && (
        <p className="lf-note">Add your Supabase URL and publishable key to <code>.env.local</code>, then restart the development server.</p>
      )}

      <div className="lf-field">
        <label className="lf-label" htmlFor="email">Email</label>
        <input id="email" className="lf-input" autoComplete="email" disabled={!isSupabaseConfigured || busy} onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
      </div>

      <div className="lf-field">
        <label className="lf-label" htmlFor="password">Password</label>
        <input id="password" className="lf-input" autoComplete={mode === "signup" ? "new-password" : "current-password"} disabled={!isSupabaseConfigured || busy} minLength={6} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
      </div>

      {error && <p className="lf-error" role="alert">{error}</p>}
      {message && <p className="lf-note" role="status">{message}</p>}
      <button className="lf-btn lf-btn-primary" type="submit" disabled={!isSupabaseConfigured || busy || loading}>
        {busy ? "Please wait…" : "Continue"}
      </button>
    </form>
  );
}
