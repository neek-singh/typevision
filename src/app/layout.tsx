import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteShell from "@/components/layout/site-shell";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TypeVision | English & Hindi Krutidev Typing Practice",
    template: "%s | TypeVision",
  },
  description: "Improve your typing speed and accuracy with standard lessons and tests. Supports English QWERTY and Hindi Krutidev legacy keyboard layouts with real-time analytics.",
  keywords: [
    "typing", "krutidev", "typing test", "wpm", "hindi typing", "english typing",
    "touch typing", "typing practice", "remington keyboard", "krutidev 010"
  ],
  authors: [{ name: "TypeVision Team" }],
  metadataBase: new URL("https://typing-platform.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TypeVision | English & Hindi Krutidev Practice",
    description: "Improve your typing speed and accuracy with standard lessons and tests. Supports English QWERTY and Hindi Krutidev Remington keyboard layouts with live analytics.",
    url: "https://typing-platform.vercel.app",
    siteName: "TypeVision",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TypeVision | English & Hindi Krutidev Practice",
    description: "Improve your typing speed and accuracy with standard lessons and tests. Supports English QWERTY and Hindi Krutidev layouts.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-white"
        suppressHydrationWarning
      >
        <SiteShell>{children}</SiteShell>
        <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
