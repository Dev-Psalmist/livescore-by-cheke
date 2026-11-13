"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AuthNavigation() {
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
      setReady(true);
      return;
    }

    const supabase = createClient();

    void supabase.auth.getUser().then(({ data }) => {
      setSignedIn(Boolean(data.user));
      setReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session?.user));
      setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!ready) {
    return <div aria-hidden="true" className="h-9 w-24 animate-pulse rounded-lg bg-white/[0.06]" />;
  }

  if (signedIn) {
    return (
      <Link
        href="/account"
        className="rounded-lg border border-emerald-400/30 px-3 py-2 text-xs font-black text-emerald-300 transition hover:bg-emerald-400/10 sm:px-4 sm:text-sm"
      >
        My Account
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/login" className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-emerald-400/40 hover:text-white sm:px-4 sm:text-sm">Sign in</Link>
      <Link href="/register" className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-black text-[#101820] transition hover:bg-emerald-300 sm:px-4 sm:text-sm">Join free</Link>
    </div>
  );
}
