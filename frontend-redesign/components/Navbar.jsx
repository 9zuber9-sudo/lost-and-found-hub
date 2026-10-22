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
      initial={reduce ? false : { opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <Link href="/" className="lf-logo">
        <span className="lf-logo-mark">🔎</span>
        <span className="lf-logo-text">Campus Lost &amp; Found</span>
      </Link>
      <div className="lf-links">
        <Link href="/items" className="lf-link">Browse</Link>
        <Link href="/items/new" className="lf-link lf-hide-sm">Post item</Link>
        <ThemeToggle />
        {user ? (
          <>
            <span className="lf-user lf-hide-sm">{user.email}</span>
            <button type="button" className="lf-btn lf-btn-sm" onClick={logout}>Logout</button>
          </>
        ) : (
          <Link href="/login" className="lf-btn lf-btn-sm">Log in</Link>
        )}
      </div>
    </motion.nav>
  );
}
