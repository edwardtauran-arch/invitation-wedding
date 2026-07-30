"use client";

import { useEffect, useState } from "react";
import ScreenStart from "./components/ScreenStart";
import MainContent from "./components/MainContent";

export default function Home() {
  const [showContent, setShowContent] = useState(false);
  const [name, setName] = useState<string>("");
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    // Check if loaded inside live preview iframe to skip ScreenStart timer
    const urlParams = new URLSearchParams(window.location.search);
    const isPreview = urlParams.get("preview") === "true";
    if (isPreview) {
      setShowContent(true);
    }
    
    const toParam = urlParams.get("to");
    if (toParam) {
      setName(decodeURIComponent(toParam).trim());
    }

    // Fetch dynamic settings
    const fetchSettings = async () => {
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
    
    fetchSettings();

    // Listen for live preview messages from parent window
    const handlePreviewMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "UPDATE_PREVIEW") {
        setSettings(event.data.settings);
      }
    };
    window.addEventListener("message", handlePreviewMessage);

    const contentTimer = setTimeout(() => {
      // Only transition if not in preview mode to preserve ScreenStart
      if (!isPreview) {
        setShowContent(true);
      }
    }, 7000);

    return () => {
      clearTimeout(contentTimer);
      window.removeEventListener("message", handlePreviewMessage);
    };
  }, []);

  // Update client tab document title dynamically once settings are loaded
  useEffect(() => {
    if (settings && settings.coupleNames) {
      document.title = `The Wedding of ${settings.coupleNames.toUpperCase()}`;
    }
  }, [settings]);

  if (!settings) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white font-legan">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-t-white border-white/10 rounded-full animate-spin mx-auto"></div>
          <p className="text-[10px] tracking-widest text-neutral-600 uppercase animate-pulse">Memuat Undangan...</p>
        </div>
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
