import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered successfully');
      })
      .catch((registrationError) => {
        console.log('SW registration failed');
      });
  });
}

// Add PWA install prompt
let deferredPrompt: any;
window.addEventListener('beforeinstallprompt', (e) => {
  deferredPrompt = e;
});

// Add to global so components can access it
(window as any).installApp = () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        // User accepted the install prompt
      }
      deferredPrompt = null;
    });
  }
};

createRoot(document.getElementById("root")!).render(<App />);
