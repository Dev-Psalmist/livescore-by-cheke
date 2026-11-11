"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function StartupSplash() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("livescore-splash-shown") === "yes") {
        return;
      }

      sessionStorage.setItem("livescore-splash-shown", "yes");
    } catch {
      // Continue normally if browser storage is unavailable.
    }

    setVisible(true);

    const timer = window.setTimeout(() => {
      setVisible(false);
    }, 1800);

    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div
      role="status"
      aria-label="Loading LiveScore by Cheke"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#030907] px-6 transition-opacity"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,201,130,0.13),_transparent_65%)]" />

      <div className="relative flex flex-col items-center">
        <Image
          src="/brand/livescore-logo.svg"
          alt="LiveScore by Cheke"
          width={420}
          height={122}
          priority
          className="h-auto w-[min(82vw,360px)]"
        />

        <p className="mt-5 text-center text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 sm:text-sm">
          Every sport. Every moment.
        </p>

        <div className="mt-10 flex items-center gap-2" aria-hidden="true">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 motion-reduce:animate-none" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 [animation-delay:200ms] motion-reduce:animate-none" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 [animation-delay:400ms] motion-reduce:animate-none" />
        </div>

        <p className="mt-3 text-[10px] font-medium tracking-[0.2em] text-slate-500">
          LOADING YOUR SPORTS WORLD
        </p>
      </div>
    </div>
  );
}
