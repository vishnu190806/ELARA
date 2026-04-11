"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if it's iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Handle Android/Chrome install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    // Show prompt after 30 seconds
    const timer = setTimeout(() => {
      // Only show if not already installed/standalone
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
      if (!isStandalone) {
        setShowPrompt(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
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
        <div className="bg-[#12121e] border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
          {/* Animated background glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full group-hover:bg-blue-500/20 transition-all duration-500" />
          
          <button 
            onClick={() => setShowPrompt(false)}
            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
              <Download className="w-6 h-6 text-white" />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-semibold text-white tracking-tight">Install ELARA</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Add to your home screen for offline access and instant sky event alerts.
              </p>
            </div>
          </div>

          <div className="mt-5">
            {isIOS ? (
              <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
                <span>Tap</span>
                <Share className="w-3.5 h-3.5 text-blue-400" />
                <span>then "Add to Home Screen"</span>
              </div>
            ) : (
              <button
                onClick={handleInstall}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all active:scale-95 shadow-lg shadow-blue-600/20"
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
