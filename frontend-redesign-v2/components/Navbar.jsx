"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import * as client from "../lib/supabaseClient";
import ThemeToggle from "./ThemeToggle";

// Works whether lib/supabaseClient.js uses `export const supabase` or `export default`
const supabase = client.supabase || client.default;

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const reduce = useReducedMotion();

  // Get the logged-in user and keep it updated on login/logout
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <motion.nav
      className="lf-nav"
      aria-label="Main"
      initial={reduce ? false : { opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <Link href="/" className="lf-logo">
        {/* little map pin */}
        <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" fill="var(--color-stop-1)" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="12" cy="10" r="2.5" fill="currentColor" />
        </svg>
        <span className="lf-logo-text">Lost &amp; Found</span>
      </Link>
      <div className="lf-links">
        <Link href="/items" className="lf-link">Browse</Link>
        <Link href="/items/new" className="lf-link lf-hide-sm">Post something</Link>
        <ThemeToggle />
        {user ? (
          <>
            <span className="lf-user lf-hide-sm">{user.email}</span>
            <button type="button" className="lf-btn lf-btn-ghost lf-btn-sm" onClick={logout}>Log out</button>
          </>
        ) : (
          <Link href="/login" className="lf-btn lf-btn-primary lf-btn-sm">Log in</Link>
        )}
      </div>
    </motion.nav>
  );
}
