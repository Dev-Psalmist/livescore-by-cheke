"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LiquidGlassLogo } from "@/components/liquid-glass-logo";

export default function StartupSplash() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // The branded intro is only for the public home page. It must never
    // cover login, registration, match pages, or other public routes.
    if (pathname !== "/") {
      setVisible(false);
      return;
    }

    try {
      if (sessionStorage.getItem("livescore-splash-shown") === "yes") {
        setVisible(false);
        return;
      }

      sessionStorage.setItem("livescore-splash-shown", "yes");
    } catch {
      // Continue normally if browser storage is unavailable.
    }

    setVisible(true);

    // The logo-only ReactDrops sequence lasts 1.8 seconds at speed 1.
    // This gives it room to finish before the splash fades away.
    const timer = window.setTimeout(() => {
      setVisible(false);
    }, 2450);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (!visible || pathname !== "/") {
    return null;
  }

  return (
    <div
      role="status"
      aria-label="Loading LiveScore by Cheke"
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#030907] px-3"
    >
      {/* Subtle emerald atmosphere that matches the app's accent palette. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 48%, rgba(0,230,118,0.14) 0%, rgba(0,230,118,0.055) 27%, transparent 66%), radial-gradient(ellipse at 50% 100%, rgba(0,70,48,0.2), transparent 58%)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-[820px] items-center justify-center">
        <LiquidGlassLogo
          logo="/brand/livescore-logo.svg"
          ending="logo"
          theme="dark"
          logoColor="original"
          logoSize={420}
          logoScale={0.9}
          finalLogoScale={1}
          tile
          tileColor="#06251b"
          background="#030907"
          depth={2.9}
          dispersion={1.2}
          relief={1.1}
          caustics={1.15}
          highlights={1.3}
          bloom={0.7}
          echoTint={0.95}
          speed={0.9}
          loop={false}
          maxDpr={2}
          aria-label="LiveScore by Cheke"
          style={{
            width: "100%",
            height: "min(78svh, 560px)",
            background: "transparent",
          }}
        />
      </div>
    </div>
  );
}
