import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { AuthProvider } from "@/context/AuthContext";
import dynamic from "next/dynamic";

const StarField = dynamic(() => import("@/components/StarField"), { ssr: false });
const SpaceCursor = dynamic(() => import("@/components/SpaceCursor"), { ssr: false });

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
      <body className="antialiased bg-[#0a0a0f] text-slate-100 min-h-screen relative">
        <StarField />
        <SpaceCursor />
        {/* Global Elite Effects */}
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden mix-blend-overlay opacity-50">
          <div className="scan-line" />
        </div>
        <div className="crt-overlay fixed inset-0 opacity-40 mix-blend-multiply z-[90]" />
        
        <AuthProvider>
          <Navbar />
          {children}
          <PWAInstallPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}
