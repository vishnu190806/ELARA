"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/isro", label: "ISRO" },
  { href: "/settings", label: "Settings" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, login, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 group/navbar">
      {/* Dynamic navbar background with variable blur */}
      <div className="absolute inset-0 bg-[#0a0a0f]/60 backdrop-blur-2xl border-b border-white/[0.04] transition-all duration-500 group-hover/navbar:bg-[#0a0a0f]/80" />

      {/* Underglow for the navbar */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent blur-[2px]" />

      <nav className="relative max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
        {/* Elite Logo */}
        <Link href="/" className="flex items-center gap-3 py-4 group">
          <div className="relative">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]">
                <defs>
                  <linearGradient id="logo-hex-grad" x1="0" y1="0" x2="32" y2="32">
                    <stop stopColor="#3b82f6" />
                    <stop offset="1" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <path
                  d="M16 2L29.8564 10V22L16 30L2.14359 22V10L16 2Z"
                  fill="url(#logo-hex-grad)"
                  fillOpacity="0.05"
                  stroke="url(#logo-hex-grad)"
                  strokeWidth="2"
                  className="group-hover:stroke-blue-400 transition-colors"
                />
                <circle cx="16" cy="16" r="4.5" fill="url(#logo-hex-grad)" className="animate-pulse" />
              </svg>
            </div>
            {/* Logo corner accents */}
            <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-blue-400/50 group-hover:border-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-300" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-blue-400/50 group-hover:border-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-300" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-[0.15em] text-white leading-none">
              ELARA
            </span>
            <span className="text-[8px] font-bold text-blue-400 uppercase tracking-[0.4em] mt-1 opacity-60">System Core</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/[0.05]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-5 py-2.5 rounded-full text-sm font-bold tracking-tight transition-all duration-300 hover:text-white ${
                  isActive ? "text-white" : "text-slate-400"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 bg-blue-600 shadow-[0_4px_12px_rgba(59,130,246,0.3)] rounded-full z-0"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Desktop Interface Controls */}
        <div className="flex items-center gap-4">
          <div className="hidden xl:flex flex-col items-right text-right mr-2">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Hyd-Station</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">LAT 17.385 / LNG 78.486</span>
          </div>

          {user ? (
            <div className="flex items-center gap-3 bg-white/[0.03] pr-1.5 pl-4 py-1.5 rounded-2xl border border-white/5">
              <div className="flex flex-col items-end">
                <span className="text-[8px] text-blue-400 font-bold uppercase tracking-widest">Observer</span>
                <span className="text-xs text-white font-bold truncate max-w-[80px]">{user.displayName}</span>
              </div>
              <button
                onClick={() => logout()}
                className="p-2.5 bg-white/5 hover:bg-red-500/10 rounded-xl transition-all group/logout"
              >
                <LogOut className="w-4 h-4 text-slate-400 group-hover/logout:text-red-400 transition-colors" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => login()}
              className="relative px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold transition-all hover:bg-blue-500 active:scale-95 shadow-[0_8px_20px_rgba(37,99,235,0.2)] overflow-hidden group/login"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/login:translate-x-full transition-transform duration-1000" />
              <div className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                <span>Initialize</span>
              </div>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-3 bg-white/[0.03] border border-white/[0.05] rounded-xl text-slate-300 hover:text-white transition-all active:scale-90"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Premium Mobile Menu Expansion */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[-1] md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] bg-[#0a0a0f] border-l border-white/5 z-40 md:hidden flex flex-col pt-24 px-6 shadow-2xl"
            >
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-4 ml-4">Terminal Access</p>
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-5 py-4 rounded-2xl text-base font-bold transition-all border ${
                        isActive
                          ? "bg-blue-600/10 border-blue-500/20 text-blue-400"
                          : "bg-white/[0.02] border-transparent text-slate-400 hover:bg-white/[0.05]"
                      }`}
                    >
                      {item.label}
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-auto mb-10 p-6 rounded-3xl bg-blue-600/5 border border-blue-500/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mainframe Active</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
                  CONNECTION SECURE<br />
                  ENCRYPTION: AES-256<br />
                  NODE: HYD-STATION-01
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
