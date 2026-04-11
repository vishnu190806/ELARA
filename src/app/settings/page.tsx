"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Rocket, Telescope, Eye, RefreshCw, Shield } from "lucide-react";




function cn(...cls: (string | false | undefined)[]) {
  return cls.filter(Boolean).join(" ");
}

const colorMap: Record<string, { bg: string; border: string; text: string; ring: string }> = {
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400", ring: "focus:ring-purple-500/30" },
  blue:   { bg: "bg-blue-500/10",   border: "border-blue-500/30",   text: "text-blue-400",   ring: "focus:ring-blue-500/30" },
  orange: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", ring: "focus:ring-orange-500/30" },
  amber:  { bg: "bg-amber-500/10",  border: "border-amber-500/30",  text: "text-amber-400",  ring: "focus:ring-amber-500/30" },
  cyan:   { bg: "bg-cyan-500/10",   border: "border-cyan-500/30",   text: "text-cyan-400",   ring: "focus:ring-cyan-500/30" },
};

import { useAuth } from "@/context/AuthContext";
import { requestNotificationPermission } from "@/lib/firebase/messaging";
import { LogIn } from "lucide-react";

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
      <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] pt-24 pb-20 px-4">
        <div className="max-w-md mx-auto glass-card p-10 text-center">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Sync Your Observer Profile</h1>
          <p className="text-slate-500 mb-8">Login to save your notification preferences and get personalized sky alerts across all your devices.</p>
          <button
            onClick={() => login()}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
          >
            <LogIn className="w-5 h-5" />
            Sign in with Google
          </button>
        </div>
      </main>
    );
  }

  const settingItems = [
    { id: "launches", label: "Rocket Launches", icon: <Rocket className="w-4 h-4" />, color: "purple", desc: "Alerts for NASA, SpaceX, and global space missions" },
    { id: "isroOnly", label: "ISRO Exclusive", icon: <Telescope className="w-4 h-4" />, color: "blue", desc: "Prioritize alerts for Indian Space Research missions" },
    { id: "allEvents", label: "Stargazing Events", icon: <Eye className="w-4 h-4" />, color: "cyan", desc: "Meteor showers, eclipses, and planetary conjunctions" },
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Bell className="w-5 h-5 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Observer Settings</h1>
          </div>
          <p className="text-slate-500 text-sm ml-14">Personalize your sky event alerting experience</p>
        </motion.div>

        {/* Push Permission */}
        {notifPermission !== "granted" && (
          <motion.div className="mb-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-4">
            <Shield className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
            <div className="flex-1">
              <p className="text-amber-300 text-sm font-semibold mb-1">Push Alerts Disabled</p>
              <p className="text-slate-500 text-xs mb-4">Grant permission to receive real-time notifications for upcoming space events.</p>
              <button
                onClick={handleEnablePush}
                className="px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-semibold transition-all active:scale-95"
              >
                Configure Notifications
              </button>
            </div>
          </motion.div>
        )}

        <motion.section className="glass-card p-6 mb-6">
          <h2 className="text-sm font-semibold text-white mb-6 uppercase tracking-wider text-slate-400">Notification Preferences</h2>
          <div className="flex flex-col gap-4">
            {settingItems.map((item) => {
              const colors = colorMap[item.color];
              const isEnabled = (localPrefs as UserPreferences)?.[item.id as keyof UserPreferences];
              return (
                <div key={item.id} className={cn("flex items-center gap-4 p-4 rounded-xl border transition-all h-20", isEnabled ? cn(colors.bg, colors.border) : "bg-white/[0.02] border-white/[0.05]")}>
                   <div className={cn("p-2.5 rounded-lg shrink-0", isEnabled ? colors.bg : "bg-white/[0.04]")}>
                    <span className={isEnabled ? colors.text : "text-slate-600"}>{item.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-bold", isEnabled ? "text-white" : "text-slate-500")}>{item.label}</p>
                    <p className="text-slate-600 text-[10px] mt-0.5 leading-tight">{item.desc}</p>
                  </div>
                  <button onClick={() => handleToggle(item.id)} className={cn("relative w-11 h-6 rounded-full transition-all duration-300 shrink-0", isEnabled ? "bg-blue-600" : "bg-white/[0.1]")}>
                    <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300", isEnabled ? "translate-x-5" : "translate-x-0")} />
                  </button>
                </div>
              );
            })}
          </div>
        </motion.section>

        <motion.div className="flex justify-end gap-4 mt-8">
          <button
            onClick={handleSave}
            className={cn("px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2", saved ? "bg-green-600/20 text-green-400 border border-green-500/30" : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20")}
          >
            {saved ? "✓ Settings Updated" : "Sync Preferences"}
          </button>
        </motion.div>
      </div>
    </main>
  );
}
