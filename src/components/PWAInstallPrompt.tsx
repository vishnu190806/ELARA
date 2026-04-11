"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function PWAInstallPrompt() {
  const { preferences, updatePreferences } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    const timer = setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
      
      // Don't show if already in standalone mode
      if (isStandalone) return;

      // Don't show if explicitly dismissed by user in their cloud preferences
      if (preferences?.pwaPromptDismissed) return;

      setShowPrompt(true);
    }, 15000);

    return () => clearTimeout(timer);
  }, [preferences]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
      updatePreferences({ pwaInstalled: true });
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    updatePreferences({ pwaPromptDismissed: true });
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-4 right-4 z-[100] md:left-auto md:right-6 md:w-96"
      >
        <div className="bg-[#12121e]/90 border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full group-hover:bg-blue-500/20 transition-all duration-500" />
          
          <button 
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">
              <Download className="w-6 h-6 text-white" />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-semibold text-white tracking-tight">App Experience</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Install ELARA for a native feel, offline access and instant sky alerts.
              </p>
            </div>
          </div>

          <div className="mt-5">
            {isIOS ? (
              <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
                <span>Tap</span>
                <Share className="w-3.5 h-3.5 text-blue-400" />
                <span>then &quot;Add to Home Screen&quot;</span>
              </div>
            ) : (
              <button
                onClick={handleInstall}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all active:scale-95 shadow-lg shadow-blue-600/20"
              >
                Install Now
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
