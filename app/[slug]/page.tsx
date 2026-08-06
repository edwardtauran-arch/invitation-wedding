"use client";

import { useEffect, useState } from "react";
import ScreenStart from "../components/ScreenStart";
import MainContent from "../components/MainContent";

type ParamsProps = {
  params: { slug: string };
};

export default function Home({ params: { slug } }: ParamsProps) {
  const [showContent, setShowContent] = useState(false);
  const [name, setName] = useState<string>("");
  const [settings, setSettings] = useState<any>(null);
  const [guestStatus, setGuestStatus] = useState<"checking" | "valid" | "invalid">("checking");

  useEffect(() => {
    // Check if loaded inside live preview iframe
    const urlParams = new URLSearchParams(window.location.search);
    const isPreview = urlParams.get("preview") === "true";
    if (isPreview) {
      setShowContent(true);
    }

    const initializeApp = async () => {
      // Decode slug dan jadikan nama tamu
      const parsedSlug = decodeURIComponent(slug).replace(/-/g, " ").trim();
      setName(parsedSlug);

      let isGuestValid = false;

      if (isPreview) {
        isGuestValid = true;
      } else {
        // Validasi apakah slug ini adalah nama tamu yang terdaftar
        try {
          const validRes = await fetch(`/api/validate-guest?name=${encodeURIComponent(parsedSlug)}`);
          if (validRes.ok) {
            const validData = await validRes.json();
            isGuestValid = validData.valid;
          }
        } catch (error) {
          // handle error
        }
      }

      setGuestStatus(isGuestValid ? "valid" : "invalid");

      // Fetch settings
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };

    initializeApp();

    // Listen for live preview messages from parent window
    const handlePreviewMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "UPDATE_PREVIEW") {
        setSettings(event.data.settings);
      }
    };
    window.addEventListener("message", handlePreviewMessage);

    const contentTimer = setTimeout(() => {
      if (!isPreview) {
        setShowContent(true);
      }
    }, 7000);

    return () => {
      clearTimeout(contentTimer);
      window.removeEventListener("message", handlePreviewMessage);
    };
  }, [slug]);

  // Update tab title dynamically
  useEffect(() => {
    if (settings && settings.coupleNames) {
      document.title = `The Wedding of ${settings.coupleNames.toUpperCase()}`;
    }
  }, [settings]);

  // Loading state
  if (guestStatus === "checking" || !settings) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white font-legan">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-t-white border-white/10 rounded-full animate-spin mx-auto"></div>
          <p className="text-[10px] tracking-widest text-neutral-600 uppercase animate-pulse">Memuat Undangan...</p>
        </div>
      </div>
    );
  }

  // Akses ditolak — slug tidak terdaftar sebagai tamu
  if (guestStatus === "invalid") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white font-legan px-6">
        <h1 className="text-3xl font-ovo mb-4 text-red-500">Akses Ditolak</h1>
        <p className="text-center text-neutral-400 text-sm max-w-sm">
          Maaf, nama Anda tidak terdaftar dalam daftar tamu undangan kami, atau link yang Anda gunakan tidak valid.
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <ScreenStart config={settings} />
      {showContent && <MainContent name={name} config={settings} />}
    </div>
  );
}
