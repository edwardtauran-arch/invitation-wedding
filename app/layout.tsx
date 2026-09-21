import type { Metadata } from "next";
import { Ovo, Ms_Madi } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { config } from "@/lib/config";
import { getDynamicSettings } from "@/lib/dbHelper";

export const dynamic = "force-dynamic";

const legan = localFont({
  src: "./fonts/Legan.woff",
  variable: "--font-legan",
  weight: "100 900",
});

const thesignature = localFont({
  src: "./fonts/Thesignature.ttf",
  variable: "--font-thesignature",
  weight: "100 900",
});

const wonder = localFont({
  src: "./fonts/Wonder.woff",
  variable: "--font-wonder",
  weight: "100 900",
});

const ovo = Ovo({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-ovo",
});

const dancingScript = Ms_Madi({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dancing",
});

export async function generateMetadata() {
  // Gunakan NEXT_PUBLIC_SITE_URL jika ada, atau otomatis dari VERCEL_URL, atau fallback ke vercel
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || vercelUrl || "https://edwardian.vercel.app";
  
  try {
    const settings = await getDynamicSettings();
    const coupleNames = settings?.coupleNames || "EDWARD & DIAN";
    const slide10Image = settings?.slideImages?.slide10 || "/slide_9.jpg";
    
    // Jika gambar sudah absolute URL (dari Supabase/CDN), pakai langsung
    // Jika relative path, route ke _next/image agar ukuran < 300KB (syarat WhatsApp)
    let absoluteImageUrl: string;
    if (slide10Image.startsWith("http")) {
      absoluteImageUrl = slide10Image;
    } else {
      const imagePath = slide10Image.startsWith("/") ? slide10Image : `/${slide10Image}`;
      absoluteImageUrl = `${siteUrl}/_next/image?url=${encodeURIComponent(imagePath)}&w=1200&q=80`;
    }

    return {
      title: `THE Wedding of ${coupleNames.toUpperCase()}`,
      description: `Wedding Invitation of ${coupleNames.toUpperCase()}, Crafted with Love`,
      openGraph: {
        title: `THE Wedding of ${coupleNames.toUpperCase()}`,
        description: `Kami mengundang Anda untuk hadir di acara pernikahan kami.`,
        url: siteUrl,
        siteName: `The Wedding of ${coupleNames}`,
        images: [
          {
            url: absoluteImageUrl,
            width: 1200,
            height: 630,
            alt: `The Wedding of ${coupleNames}`,
          },
        ],
        type: 'website',
      },
    };
  } catch (error) {
    return {
      title: "The Wedding Invitation",
      description: "Wedding Invitation, Crafted with Love",
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" translate="no">
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body
        className={`bg-[#0a0a0a]  ${ovo.variable} ${thesignature.variable} ${wonder.variable} ${legan.variable} ${dancingScript.variable}  antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
