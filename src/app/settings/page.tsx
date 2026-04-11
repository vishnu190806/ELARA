"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, BellOff, Rocket, Telescope, Eye, Zap, RefreshCw, Shield } from "lucide-react";

interface AlertSetting {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  enabled: boolean;
}

const DEFAULT_SETTINGS: AlertSetting[] = [
  {
    id: "isro_launches",
    label: "ISRO Launches",
    description: "Alerts for upcoming ISRO rocket launches",
    icon: <Rocket className="w-4 h-4" />,
    color: "purple",
    enabled: true,
  },
  {
    id: "nasa_events",
    label: "NASA Events",
    description: "ISS passes, crater observations, planetary events",
    icon: <Telescope className="w-4 h-4" />,
    color: "blue",
    enabled: true,
  },
  {
    id: "meteor_showers",
    label: "Meteor Showers",
    description: "Major and minor meteor shower peak nights",
    icon: <Zap className="w-4 h-4" />,
    color: "orange",
    enabled: true,
  },
  {
    id: "eclipses",
    label: "Eclipses",
    description: "Solar and lunar eclipses visible from India",
    icon: <Eye className="w-4 h-4" />,
    color: "amber",
    enabled: false,
  },
  {
    id: "planetary",
    label: "Planetary Events",
    description: "Conjunctions, oppositions, and bright planet events",
    icon: <Eye className="w-4 h-4" />,
    color: "cyan",
    enabled: false,
  },
];

type AlertTiming = "15" | "30" | "60" | "120";

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

export default function SettingsPage() {
  const [settings, setSettings] = useState<AlertSetting[]>(DEFAULT_SETTINGS);
  const [timing, setTiming] = useState<AlertTiming>("30");
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "unsupported">("default");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!("Notification" in window)) {
      setNotifPermission("unsupported");
    } else {
      setNotifPermission(Notification.permission);
    }

    const stored = localStorage.getItem("elara-settings");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.timing) setTiming(parsed.timing);
      } catch {}
    }
  }, []);

  function toggleSetting(id: string) {
    setSettings((prev) => prev.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s));
  }

  async function requestNotifications() {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
  }

  function handleSave() {
    localStorage.setItem("elara-settings", JSON.stringify({ settings, timing }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const enabledCount = settings.filter((s) => s.enabled).length;

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Bell className="w-5 h-5 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Alert Settings</h1>
          </div>
          <p className="text-slate-500 text-sm ml-14">
            {enabledCount} of {settings.length} event types enabled
          </p>
        </motion.div>

        {/* Notification permission banner */}
        {notifPermission !== "granted" && notifPermission !== "unsupported" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3"
          >
            <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-amber-300 text-sm font-medium mb-1">Browser Notifications Required</p>
              <p className="text-slate-500 text-xs mb-3">
                ELARA needs permission to send you alerts before events.
              </p>
              <button
                onClick={requestNotifications}
                disabled={notifPermission === "denied"}
                className="px-4 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {notifPermission === "denied" ? "Permission Denied" : "Enable Notifications"}
              </button>
            </div>
          </motion.div>
        )}

        {/* Alert types */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-6 mb-6"
        >
          <h2 className="text-sm font-semibold text-white mb-5">Event Types</h2>
          <div className="flex flex-col gap-3">
            {settings.map((setting, i) => {
              const colors = colorMap[setting.color];
              return (
                <motion.div
                  key={setting.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.07 }}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border transition-all",
                    setting.enabled ? cn(colors.bg, colors.border) : "bg-white/[0.02] border-white/[0.05]"
                  )}
                >
                  {/* Icon */}
                  <div className={cn("p-2 rounded-lg", setting.enabled ? colors.bg : "bg-white/[0.04]")}>
                    <span className={setting.enabled ? colors.text : "text-slate-600"}>
                      {setting.icon}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium", setting.enabled ? "text-white" : "text-slate-500")}>
                      {setting.label}
                    </p>
                    <p className="text-slate-600 text-xs mt-0.5 truncate">{setting.description}</p>
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => toggleSetting(setting.id)}
                    className={cn(
                      "relative w-11 h-6 rounded-full transition-all duration-300 shrink-0 focus:outline-none",
                      setting.enabled ? "bg-blue-600" : "bg-white/[0.1]"
                    )}
                    aria-label={`Toggle ${setting.label}`}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300",
                        setting.enabled ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Advance notice timing */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-6 mb-6"
        >
          <h2 className="text-sm font-semibold text-white mb-1">Notify Me</h2>
          <p className="text-slate-500 text-xs mb-5">How far in advance would you like to be notified?</p>

          <div className="grid grid-cols-4 gap-2">
            {(["15", "30", "60", "120"] as AlertTiming[]).map((opt) => {
              const label = opt === "120" ? "2 hrs" : `${opt} min`;
              return (
                <button
                  key={opt}
                  onClick={() => setTiming(opt)}
                  className={cn(
                    "py-2.5 rounded-xl text-sm font-medium transition-all border",
                    timing === opt
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-white/[0.04] border-white/[0.08] text-slate-400 hover:bg-white/[0.07] hover:text-white"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </motion.section>

        {/* Save button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="flex justify-end"
        >
          <button
            onClick={handleSave}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all",
              saved
                ? "bg-green-600/20 border border-green-500/30 text-green-400"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-glow-blue-sm"
            )}
          >
            {saved ? (
              <>
                <span className="w-4 h-4 text-lg leading-none">✓</span>
                Saved!
              </>
            ) : (
              "Save Settings"
            )}
          </button>
        </motion.div>
      </div>
    </main>
  );
}
