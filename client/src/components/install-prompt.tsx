import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Download, X } from 'lucide-react';

export function InstallPrompt() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setIsInstallable(true);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallPrompt(false);
      return;
    }

    // For iOS Safari - show install instructions immediately
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    if (isIOS && isSafari) {
      setIsInstallable(true);
      setShowInstallPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    if (isIOS && isSafari) {
      // Show iOS install instructions
      alert('For å installere GAINLY:\n\n1. Trykk på Del-knappen (□↗) nederst\n2. Scroll ned og velg "Legg til på startskjerm"\n3. Trykk "Legg til"');
    } else if ((window as any).installApp) {
      (window as any).installApp();
    }
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  // Don't show if user previously dismissed or if not installable
  if (!showInstallPrompt || !isInstallable || localStorage.getItem('installPromptDismissed')) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-lg p-4 shadow-lg border border-emerald-400/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
            <Download className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Installer GAINLY</h3>
            <p className="text-emerald-100 text-xs">Legg til på startskjerm for best opplevelse</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleInstall}
            size="sm"
            className="bg-white text-emerald-600 hover:bg-emerald-50 text-xs px-3 py-1"
          >
            Installer
          </Button>
          <Button
            onClick={handleDismiss}
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/10 p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}