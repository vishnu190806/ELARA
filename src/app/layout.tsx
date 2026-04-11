import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "ELARA — Sky Event Tracker",
  description: "AI-powered sky event alarm for Indian stargazers. Track NASA launches, ISRO missions, meteor showers and more.",
  keywords: ["sky events", "astronomy", "ISRO", "NASA", "stargazing India", "meteor shower"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ELARA",
  },
  openGraph: {
    title: "ELARA — Sky Event Tracker",
    description: "Your personal AI sky-event assistant for Indian stargazers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", inter.variable)}>
      <body className="antialiased bg-[#0a0a0f] text-slate-100 min-h-screen">
        <Navbar />
        {children}
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
