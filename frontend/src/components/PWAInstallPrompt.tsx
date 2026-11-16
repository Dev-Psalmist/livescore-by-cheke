"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

export default function PWAInstallPrompt() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const standaloneMode = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    const iosStandalone = (
      navigator as Navigator & { standalone?: boolean }
    ).standalone;

    setIsInstalled(standaloneMode || iosStandalone === true);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallEvent(null);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt,
    );
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function installApp() {
    if (!installEvent) return;

    try {
      await installEvent.prompt();
      await installEvent.userChoice;
    } finally {
      setInstallEvent(null);
    }
  }

  if (!installEvent || isInstalled || isDismissed) {
    return null;
  }

  return (
    <aside
      aria-label="Install LiveScore by Cheke"
      className="fixed inset-x-3 bottom-20 z-[70] mx-auto flex max-w-lg items-center gap-3 rounded-2xl border border-emerald-400/20 bg-[#0b1713]/95 p-3 text-white shadow-2xl shadow-black/40 backdrop-blur-xl sm:bottom-6 sm:inset-x-auto sm:right-6"
    >
      <Image
        src="/brand/livescore-icon.svg"
        alt=""
        width={44}
        height={44}
        className="h-11 w-11 shrink-0 rounded-xl"
      />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">Take LiveScore with you</p>
        <p className="mt-0.5 text-xs text-slate-300">
          Install the app for quick access from your home screen.
        </p>
      </div>

      <button
        type="button"
        onClick={installApp}
        className="shrink-0 rounded-xl bg-emerald-400 px-3 py-2 text-xs font-black text-[#07110d] transition hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        Install
      </button>

      <button
        type="button"
        onClick={() => setIsDismissed(true)}
        aria-label="Dismiss install message"
        className="shrink-0 rounded-lg px-2 py-2 text-lg leading-none text-slate-400 transition hover:bg-white/10 hover:text-white"
      >
        ×
      </button>
    </aside>
  );
}
