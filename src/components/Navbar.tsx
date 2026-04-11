"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, MapPin } from "lucide-react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/isro", label: "ISRO" },
  { href: "/settings", label: "Settings" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Frosted glass background */}
      <div className="absolute inset-0 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5" />

      <nav className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8">
            {/* Hexagonal logo mark */}
            <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
              <polygon
                points="16,2 28,9 28,23 16,30 4,23 4,9"
                stroke="url(#logo-grad)"
                strokeWidth="1.5"
                fill="rgba(59,130,246,0.08)"
              />
              <circle cx="16" cy="16" r="4" fill="url(#logo-grad)" />
              <defs>
                <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3b82f6" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)" }} />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            ELARA
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${pathname === item.href ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Location indicator */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 bg-white/[0.04] px-3 py-1.5 rounded-full border border-white/[0.06]">
          <MapPin className="w-3 h-3 text-blue-400" />
          <span>Hyderabad</span>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="relative md:hidden border-t border-white/[0.06] bg-[#0a0a0f]/95 backdrop-blur-xl"
        >
          <div className="px-4 py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-blue-500/10 text-blue-400"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </header>
  );
}
