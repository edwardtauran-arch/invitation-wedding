"use client";

import { config as defaultConfig } from "@/lib/config";
import { useEffect, useState } from "react";
import { TypeAnimation } from "react-type-animation";

interface ScreenStartProps {
  config?: any;
}

const ScreenStart = ({ config: propConfig }: ScreenStartProps) => {
  const activeConfig = propConfig || defaultConfig;
  const [showScreenStart, setShowScreenStart] = useState(true);
  const [fadeClass, setFadeClass] = useState("opacity-100");

  useEffect(() => {
    const fadeInTimer = setTimeout(() => {
      setFadeClass("opacity-100");
    }, 100); 

    
    const fadeOutTimer = setTimeout(() => {
      setFadeClass("opacity-0");
    }, 6000); 

    const removeScreenStart = setTimeout(() => {
      setShowScreenStart(false);
    }, 7000);

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(removeScreenStart);
    };
  }, []);

  if (!showScreenStart) {
    return null;
  }

  const toTitleCase = (str: string) => {
    if (!str) return "";
    return str.toLowerCase().split(" ").map(w => {
      if (w === "&" || w === "dan" || w === "and") return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(" ");
  };

  return (
    <div
      className={` text-white flex flex-col justify-center items-center min-h-screen transition-opacity duration-1000 ${fadeClass}`}
    >
      <TypeAnimation
        sequence={[
          "THE WEDDING OF",
          2000, 
          activeConfig.coupleNames.toUpperCase(),
          1000,
        ]}
        wrapper="span"
        speed={20}
        style={{
          fontSize: "2em",
          display: "inline-block",
        }}
        className="font-legan text-sm"
        repeat={0} // Animasi terus diulang
      />
    </div>
  );
};

export default ScreenStart;
