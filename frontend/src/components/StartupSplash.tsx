"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function StartupSplash() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (pathname !== "/") {
      setVisible(false);
      return;
    }

    try {
      if (sessionStorage.getItem("livescore-glass-splash-v2") === "shown") {
        setVisible(false);
        return;
      }
      sessionStorage.setItem("livescore-glass-splash-v2", "shown");
    } catch {
      // The splash still works when browser storage is unavailable.
    }

    setVisible(true);
    setIsFadingOut(false);

    const fadeTimer = window.setTimeout(() => setIsFadingOut(true), 3300);
    const removeTimer = window.setTimeout(() => setVisible(false), 3800);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, [pathname]);

  if (!visible || pathname !== "/") return null;

  return (
    <div
      role="status"
      aria-label="Loading LiveScore by Cheke"
      className={`lsc-splash fixed inset-0 z-[1000] flex items-center justify-center overflow-hidden px-5 transition-opacity duration-500 ${isFadingOut ? "opacity-0" : "opacity-100"}`}
    >
      <div className="lsc-splash__grid" aria-hidden="true" />
      <div className="lsc-splash__glow lsc-splash__glow--one" aria-hidden="true" />
      <div className="lsc-splash__glow lsc-splash__glow--two" aria-hidden="true" />

      <div className="relative z-10 flex w-full max-w-[560px] flex-col items-center">
        <div className="lsc-splash__stage">
          <div className="lsc-splash__orbit lsc-splash__orbit--outer" aria-hidden="true" />
          <div className="lsc-splash__orbit lsc-splash__orbit--inner" aria-hidden="true" />
          <div className="lsc-splash__glass">
            <div className="lsc-splash__shine" aria-hidden="true" />
            <img
              src="/brand/livescore-logo.svg"
              alt="LiveScore by Cheke"
              className="lsc-splash__logo"
              fetchPriority="high"
            />
          </div>
          <span className="lsc-splash__spark lsc-splash__spark--one" aria-hidden="true" />
          <span className="lsc-splash__spark lsc-splash__spark--two" aria-hidden="true" />
          <span className="lsc-splash__spark lsc-splash__spark--three" aria-hidden="true" />
        </div>

        <p className="lsc-splash__tagline">EVERY SPORT. EVERY MOMENT.</p>
        <div className="lsc-splash__loader" aria-hidden="true">
          <span />
        </div>
        <p className="lsc-splash__loading">Preparing your matchday experience</p>
      </div>

      <style>{`
        .lsc-splash {
          isolation: isolate;
          background: #030907;
          color: #f4f8f6;
        }
        .lsc-splash__grid {
          position: absolute;
          inset: 0;
          opacity: .12;
          background-image: linear-gradient(rgba(109,255,189,.13) 1px, transparent 1px), linear-gradient(90deg, rgba(109,255,189,.13) 1px, transparent 1px);
          background-size: 46px 46px;
          mask-image: radial-gradient(ellipse at center, black, transparent 76%);
        }
        .lsc-splash__glow {
          position: absolute;
          width: min(78vw, 620px);
          aspect-ratio: 1;
          border-radius: 9999px;
          filter: blur(85px);
          pointer-events: none;
        }
        .lsc-splash__glow--one {
          background: rgba(0,230,118,.17);
          top: 15%;
          left: 50%;
          transform: translateX(-50%);
          animation: lsc-breathe 3.2s ease-in-out infinite;
        }
        .lsc-splash__glow--two {
          width: min(55vw, 420px);
          background: rgba(0,115,83,.15);
          bottom: -28%;
          right: -12%;
          animation: lsc-breathe 4s ease-in-out infinite reverse;
        }
        .lsc-splash__stage {
          position: relative;
          display: grid;
          width: min(100%, 510px);
          aspect-ratio: 1.9;
          place-items: center;
          perspective: 900px;
        }
        .lsc-splash__glass {
          position: relative;
          display: grid;
          width: 100%;
          min-height: 132px;
          place-items: center;
          overflow: hidden;
          padding: 25px 18px;
          border: 1px solid rgba(220,255,240,.18);
          border-radius: 28px;
          background: linear-gradient(135deg, rgba(255,255,255,.105), rgba(255,255,255,.025) 48%, rgba(0,230,118,.07));
          box-shadow: 0 24px 90px rgba(0,0,0,.48), inset 0 1px 0 rgba(255,255,255,.22), 0 0 55px rgba(0,230,118,.13);
          backdrop-filter: blur(22px) saturate(150%);
          -webkit-backdrop-filter: blur(22px) saturate(150%);
          animation: lsc-logo-enter 1.25s cubic-bezier(.2,.8,.2,1) both, lsc-float 4s ease-in-out 1.25s infinite;
        }
        .lsc-splash__logo {
          position: relative;
          z-index: 2;
          display: block;
          width: min(100%, 430px);
          height: auto;
          filter: drop-shadow(0 0 16px rgba(0,230,118,.2));
        }
        .lsc-splash__shine {
          position: absolute;
          z-index: 1;
          inset: -80% auto -80% -45%;
          width: 34%;
          transform: rotate(24deg);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.26), transparent);
          animation: lsc-shine 2.5s ease-in-out .65s both;
        }
        .lsc-splash__orbit {
          position: absolute;
          border: 1px solid rgba(109,255,189,.2);
          border-radius: 50%;
          pointer-events: none;
        }
        .lsc-splash__orbit--outer {
          inset: 3% 2%;
          transform: rotate(-9deg);
          animation: lsc-orbit-in 1.6s ease-out both, lsc-orbit-turn 16s linear 1.6s infinite;
        }
        .lsc-splash__orbit--inner {
          inset: 12% 8%;
          border-color: rgba(255,255,255,.12);
          transform: rotate(8deg);
          animation: lsc-orbit-in 1.8s ease-out .15s both, lsc-orbit-turn 22s linear 1.8s infinite reverse;
        }
        .lsc-splash__spark {
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #6dffbd;
          box-shadow: 0 0 15px 4px rgba(0,230,118,.45);
          animation: lsc-spark 2s ease-in-out infinite;
        }
        .lsc-splash__spark--one { top: 17%; left: 12%; }
        .lsc-splash__spark--two { right: 10%; top: 31%; animation-delay: .55s; }
        .lsc-splash__spark--three { bottom: 15%; left: 23%; animation-delay: 1.05s; }
        .lsc-splash__tagline {
          margin-top: 24px;
          color: #b8cbc3;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .34em;
          text-align: center;
          animation: lsc-fade-up .8s ease-out .55s both;
        }
        .lsc-splash__loader {
          width: 132px;
          height: 3px;
          margin-top: 25px;
          overflow: hidden;
          border-radius: 99px;
          background: rgba(255,255,255,.12);
        }
        .lsc-splash__loader span {
          display: block;
          width: 38%;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #00a86b, #6dffbd, #fff);
          box-shadow: 0 0 12px rgba(109,255,189,.8);
          animation: lsc-progress 2.7s cubic-bezier(.45,0,.55,1) both;
        }
        .lsc-splash__loading {
          margin-top: 12px;
          color: rgba(220,235,229,.52);
          font-size: 11px;
          letter-spacing: .06em;
          animation: lsc-fade-up .8s ease-out .8s both;
        }
        @keyframes lsc-logo-enter {
          from { opacity: 0; transform: translateY(22px) rotateX(12deg) scale(.88); filter: blur(12px); }
          to { opacity: 1; transform: translateY(0) rotateX(0) scale(1); filter: blur(0); }
        }
        @keyframes lsc-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes lsc-shine { 0% { left: -45%; } 100% { left: 125%; } }
        @keyframes lsc-orbit-in { from { opacity: 0; scale: .8; } to { opacity: 1; scale: 1; } }
        @keyframes lsc-orbit-turn { to { rotate: 360deg; } }
        @keyframes lsc-spark { 0%,100% { opacity: .25; transform: scale(.65); } 50% { opacity: 1; transform: scale(1.35); } }
        @keyframes lsc-breathe { 0%,100% { opacity: .55; transform: translateX(-50%) scale(.9); } 50% { opacity: 1; transform: translateX(-50%) scale(1.08); } }
        @keyframes lsc-fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes lsc-progress { from { width: 0; } to { width: 100%; } }
        @media (max-width: 520px) {
          .lsc-splash__stage { aspect-ratio: 1.55; }
          .lsc-splash__glass { min-height: 105px; padding: 18px 12px; border-radius: 20px; }
          .lsc-splash__tagline { font-size: 8px; letter-spacing: .25em; }
        }
        @media (prefers-reduced-motion: reduce) {
          .lsc-splash *, .lsc-splash *::before, .lsc-splash *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}
