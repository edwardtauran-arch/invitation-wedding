import type { Metadata } from "next";
import { Ovo } from "@next/font/google";
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

export async function generateMetadata() {
  const siteUrl = process.env.URL || process.env.NEXT_PUBLIC_SITE_URL || "https://edwardian.netlify.app";
  
  try {
    const settings = await getDynamicSettings();
    const coupleNames = settings?.coupleNames || "EDWARD & DIAN";
    const slide10Image = settings?.slideImages?.slide10 || "/slide_9.jpg";
    
    // Ensure image is absolute URL for WhatsApp thumbnail
    // WhatsApp requires og:image to be < 300KB, so we route it through Next.js image optimization
    const imagePath = slide10Image.startsWith("http") 
      ? slide10Image 
      : `${slide10Image.startsWith("/") ? "" : "/"}${slide10Image}`;
      
    const absoluteImageUrl = `${siteUrl}/_next/image?url=${encodeURIComponent(imagePath)}&w=1080&q=75`;

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
        className={`bg-[#0a0a0a]  ${ovo.variable} ${thesignature.variable} ${wonder.variable} ${legan.variable}  antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
