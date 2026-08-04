"use client";

import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Cek apakah sudah pernah di-dismiss
      const isDismissed = localStorage.getItem("pwa-install-dismissed");
      if (!isDismissed) {
        setTimeout(() => setShowInstall(true), 3000);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstall(false);
    }
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    setShowInstall(false);
    setDismissed(true);
    localStorage.setItem("pwa-install-dismissed", "true");
  }

  // Jangan tampilkan kalau sudah di-dismiss atau browser tidak support
  if (!showInstall || dismissed || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 md:hidden">
      <div className="rounded-2xl bg-gradient-to-r from-[#B91C1C] to-[#D62828] p-4 shadow-2xl border border-red-400/30">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Smartphone className="h-6 w-6 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">Install Q-Distro</p>
            <p className="text-xs text-red-100 mt-0.5 leading-relaxed">
              Tambahkan ke homescreen untuk akses lebih cepat!
            </p>
          </div>

          {/* Close */}
          <button
            onClick={handleDismiss}
            className="shrink-0 p-1 rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleInstall}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#B91C1C] hover:bg-red-50 active:scale-95 transition-all shadow-lg"
          >
            <Download className="h-4 w-4" />
            Install Sekarang
          </button>
          <button
            onClick={handleDismiss}
            className="rounded-xl border border-white/30 px-4 py-2.5 text-xs font-semibold text-white/80 hover:bg-white/10 transition-colors"
          >
            Nanti Saja
          </button>
        </div>
      </div>
    </div>
  );
}
