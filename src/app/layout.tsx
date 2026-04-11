import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "ELARA — Sky Event Tracker",
  description: "AI-powered sky event alarm for Indian stargazers. Track NASA launches, ISRO missions, meteor showers and more.",
  keywords: ["sky events", "astronomy", "ISRO", "NASA", "stargazing India", "meteor shower"],
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
      </body>
    </html>
  );
}
