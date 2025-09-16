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

// Ensure root element exists
const rootElement = document.getElementById("root");
if (!rootElement) {
  document.body.innerHTML = '<div style="color: white; background: #0f172a; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: system-ui;"><h1>GAINLY Loading...</h1></div>';
} else {
  createRoot(rootElement).render(<App />);
}
