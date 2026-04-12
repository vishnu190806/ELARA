"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Eye, RefreshCw, Shield, LogIn, Activity, Terminal } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { requestNotificationPermission } from "@/lib/firebase/messaging";

function cn(...cls: (string | false | undefined)[]) {
  return cls.filter(Boolean).join(" ");
}

const colorMap: Record<string, { bg: string; border: string; text: string; ring: string; shadow: string }> = {
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", ring: "focus:ring-purple-500/30", shadow: "shadow-purple-500/20" },
  blue:   { bg: "bg-blue-500/10",   border: "border-blue-500/20",   text: "text-blue-400",   ring: "focus:ring-blue-500/30", shadow: "shadow-blue-500/20" },
  orange: { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400", ring: "focus:ring-orange-500/30", shadow: "shadow-orange-500/20" },
  cyan:   { bg: "bg-cyan-500/10",   border: "border-cyan-500/20",   text: "text-cyan-400",   ring: "focus:ring-cyan-500/30", shadow: "shadow-cyan-500/20" },
};

interface UserPreferences {
  launches: boolean;
  isroOnly: boolean;
  allEvents: boolean;
  notificationsEnabled: boolean;
}

export default function SettingsPage() {
  const { user, preferences, loading, login, updatePreferences } = useAuth();
  const [localPrefs, setLocalPrefs] = useState<UserPreferences | null>(null);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "unsupported">("default");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!("Notification" in window)) {
      setNotifPermission("unsupported");
    } else {
      setNotifPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences as UserPreferences);
    }
  }, [preferences]);

  async function handleToggle(key: string) {
    if (!localPrefs) return;
    const updated = { ...localPrefs, [key]: !localPrefs[key as keyof UserPreferences] } as UserPreferences;
    setLocalPrefs(updated);
  }

  async function handleEnablePush() {
    const token = await requestNotificationPermission(user?.uid);
    if (token) {
      setNotifPermission("granted");
      updatePreferences({ notificationsEnabled: true });
    }
  }

  async function handleSave() {
    if (!user || !localPrefs) return;
    await updatePreferences(localPrefs);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050508] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <RefreshCw className="w-12 h-12 text-blue-500 animate-[spin_3s_linear_infinite]" />
            <div className="absolute inset-0 blur-xl bg-blue-500/20 animate-pulse" />
          </div>
          <div className="space-y-2 text-center">
            <p className="text-blue-400 font-mono text-xs uppercase tracking-[0.3em] font-bold">Synchronizing...</p>
            <p className="text-slate-600 text-[10px] uppercase tracking-widest leading-relaxed">Accessing Encrypted Subsystems</p>
          </div>
        </div>
      </main>
    );
  }

  const settingItems = [
    { id: "launches", label: "Mission Launch Notifications", icon: <Rocket className="w-4 h-4" />, color: "purple", desc: "Global mission updates (NASA, SpaceX, ESA)" },
    { id: "isroOnly", label: "ISRO Priority Channels", icon: <Activity className="w-4 h-4" />, color: "blue", desc: "Exclusive coverage for Indian Space Agency payloads" },
    { id: "allEvents", label: "Deep Space Observations", icon: <Eye className="w-4 h-4" />, color: "cyan", desc: "Celestial events: Transits, Eclipses, & Meteor Showers" },
  ];

  return (
    <main className="min-h-screen bg-[#050508] relative overflow-hidden selection:bg-blue-500/30">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.05)_0%,transparent_50%)]" />
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      <div className="relative max-w-2xl mx-auto px-6 pt-32 pb-24">
        
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-12 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/10 mb-6">
            <Terminal className="w-3 h-3 text-blue-500" />
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Preferences Terminal</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-4">
            System <span className="text-blue-500">Config</span>
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed max-w-md">
            Configure your observational parameters and high-priority mission notification channels.
          </p>
        </motion.div>

        {!user ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative isolate"
          >
            <div className="absolute inset-0 bg-blue-600/5 blur-3xl -z-10 rounded-full" />
            <div className="glass-card p-10 text-center border-white/[0.04]">
              <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-8 relative group">
                <Shield className="w-10 h-10 text-blue-400" />
                <div className="absolute inset-0 border-2 border-dashed border-blue-500/20 rounded-3xl animate-[spin_8s_linear_infinite]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Encryption Gateway</h2>
              <p className="text-slate-500 mb-10 text-sm max-w-[280px] mx-auto leading-relaxed font-medium">
                Please authenticate using your Observer credentials to access and modify mission preferences.
              </p>
              <button
                onClick={() => login()}
                className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold transition-all shadow-[0_8px_32px_rgba(37,99,235,0.25)] hover:shadow-[0_12px_48px_rgba(37,99,235,0.35)] active:scale-95 group"
              >
                <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                Initialize Uplink
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Notification Permissions Alert */}
            <AnimatePresence>
              {notifPermission !== "granted" && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-5 rounded-3xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-4 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-2xl group-hover:bg-amber-500/10 transition-colors" />
                  <div className="p-2 bg-amber-500/10 rounded-xl">
                    <Shield className="w-5 h-5 text-amber-500 shrink-0" />
                  </div>
                  <div className="flex-1 pr-4">
                    <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1.5">Interrupted Uplink</p>
                    <p className="text-slate-400 text-xs leading-relaxed mb-5 font-medium">System cannot push real-time alerts without authorized notification access.</p>
                    <button
                      onClick={handleEnablePush}
                      className="px-5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[11px] font-bold uppercase tracking-wider transition-all border border-amber-500/10"
                    >
                      Grant Access
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Preferences Section */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-2 border-white/[0.04] bg-white/[0.01]"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8 px-2">
                  <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Comms Channels</h2>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-blue-500" />
                    <div className="w-4 h-[1px] bg-blue-500/20" />
                  </div>
                </div>

                <div className="space-y-3">
                  {settingItems.map((item) => {
                    const colors = colorMap[item.color];
                    const isEnabled = (localPrefs as UserPreferences)?.[item.id as keyof UserPreferences];
                    return (
                      <div 
                        key={item.id} 
                        className={cn(
                          "group relative flex items-center gap-5 p-5 rounded-3xl border transition-all duration-300", 
                          isEnabled 
                            ? "bg-[#0a0a12] border-blue-500/20 shadow-[0_4px_24px_rgba(0,0,0,0.2)]" 
                            : "bg-white/[0.01] border-white/[0.03] hover:border-white/[0.08]"
                        )}
                      >
                         <div className={cn(
                           "p-4 rounded-2xl shrink-0 transition-all duration-500", 
                           isEnabled ? cn(colors.bg, "scale-110 shadow-lg", colors.shadow) : "bg-white/[0.03]"
                         )}>
                          <span className={cn("transition-colors duration-500", isEnabled ? colors.text : "text-slate-600")}>{item.icon}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={cn("text-base font-bold tracking-tight mb-1 transition-colors duration-300", isEnabled ? "text-white" : "text-slate-500")}>
                            {item.label}
                          </p>
                          <p className="text-slate-600 text-[11px] font-medium leading-relaxed uppercase tracking-tight opacity-80 group-hover:opacity-100 transition-opacity">
                            {item.desc}
                          </p>
                        </div>

                        <button 
                          onClick={() => handleToggle(item.id)} 
                          className={cn(
                            "relative w-14 h-8 rounded-full transition-all duration-500 shrink-0 p-1 overflow-hidden", 
                            isEnabled ? "bg-blue-600" : "bg-white/[0.05] border border-white/[0.05]"
                          )}
                        >
                          <motion.div 
                            animate={{ x: isEnabled ? 24 : 0 }}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            className="bg-white w-6 h-6 rounded-full shadow-lg relative z-10" 
                          />
                          {isEnabled && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent" 
                            />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.section>

            {/* Control Actions */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-between gap-6 pt-4"
            >
              <div className="hidden sm:flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Linked: {user.email}</span>
              </div>
              
              <button
                onClick={handleSave}
                disabled={saved}
                className={cn(
                  "px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-3 active:scale-95 group", 
                  saved 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                    : "bg-white text-black hover:bg-slate-100 shadow-[0_16px_32px_rgba(255,255,255,0.05)]"
                )}
              >
                {saved ? (
                  <>SYSTEM UPDATED</>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
                    Commit Changes
                  </>
                )}
              </button>
            </motion.div>
          </div>
        )}
      </div>

      {/* Footer System Info */}
      <div className="fixed bottom-6 left-6 flex items-center gap-4 text-slate-700 uppercase font-mono text-[9px] tracking-widest pointer-events-none">
        <span className="opacity-50">ELARA-v3.0.4</span>
        <div className="w-1 h-1 bg-white/10 rounded-full" />
        <span className="opacity-50">UTC: {new Date().toISOString().split('T')[1].slice(0, 8)}</span>
      </div>
    </main>
  );
}
