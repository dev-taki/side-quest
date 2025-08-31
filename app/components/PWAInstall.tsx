'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallProps {
  showOnAuth?: boolean; // Show during authentication flows
  showAfterAuth?: boolean; // Show after successful authentication
}

// Utility function to clear PWA dismiss flag (can be called externally)
export const clearPWADismissFlag = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pwa-install-dismissed');
  }
};

export default function PWAInstall({ showOnAuth = false, showAfterAuth = false }: PWAInstallProps) {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if user has dismissed the prompt before
    const hasDismissed = localStorage.getItem('pwa-install-dismissed');
    
    // Show if:
    // 1. We're in auth flow and user hasn't dismissed before, OR
    // 2. We're showing after auth and user hasn't dismissed before
    if ((!showOnAuth && !showAfterAuth) || hasDismissed === 'true') {
      return;
    }

    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener);
    };
  }, [showOnAuth, showAfterAuth]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    // Store the dismiss flag in localStorage
    localStorage.setItem('pwa-install-dismissed', 'true');
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-[#f5f5f5] rounded-lg flex items-center justify-center mr-3">
              <Download className="h-5 w-5 text-[#3B3B3B]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Install Side Quest</h3>
              <p className="text-xs text-gray-600">Add to home screen for quick access</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-[#8c52ff] text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-[#7a47e6] transition-colors"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
}
