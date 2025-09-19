import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { remoteLogger } from './utils/remoteLogger'
import { iOSLogger } from './utils/iOSLogger'

// Extend window interface for Capacitor
declare global {
  interface Window {
    Capacitor?: any;
    hideLoading?: () => void;
  }
}

console.log("🔥 ForMyPet: main.tsx loading");
remoteLogger.info("main.tsx loading", "main");
iOSLogger.log("main.tsx loading");

// iOS WebView specific logging
if (typeof window !== 'undefined') {
  console.log("📱 ForMyPet: Window object available");
  console.log("📱 ForMyPet: User Agent:", navigator.userAgent);
  console.log("📱 ForMyPet: Location:", window.location.href);
  console.log("📱 ForMyPet: Capacitor available:", typeof window.Capacitor);
  iOSLogger.log("Window object available", { 
    userAgent: navigator.userAgent,
    location: window.location.href,
    capacitor: typeof window.Capacitor
  });
  
  if (window.webkit) {
    console.log("📱 ForMyPet: iOS WebKit detected");
    iOSLogger.log("iOS WebKit detected");
  }
  
  // Additional iOS debugging
  const isIOSUserAgent = /iPad|iPhone|iPod/.test(navigator.userAgent);
  console.log("📱 ForMyPet: iOS User Agent detected:", isIOSUserAgent);
  iOSLogger.log("iOS User Agent Check", { isIOSUserAgent });
}

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ ForMyPet SW: Service Worker registered successfully:', registration.scope);
      })
      .catch((error) => {
        console.error('❌ ForMyPet SW: Service Worker registration failed:', error);
      });
  });
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("💥 ForMyPet: Root element not found! This will cause black screen.");
  remoteLogger.error("Root element not found! This will cause black screen.", "main");
} else {
  console.log("✅ ForMyPet: Root element found, creating React root");
  remoteLogger.info("Root element found, creating React root", "main");
  
  try {
    const root = createRoot(rootElement);
    console.log("🌱 ForMyPet: React root created, rendering App");
    remoteLogger.info("React root created, rendering App", "main");
    root.render(<App />);
    console.log("✅ ForMyPet: App rendered successfully");
    remoteLogger.info("App rendered successfully", "main");
    
    // Hide loading fallback on successful render
    if (typeof window !== 'undefined' && window.hideLoading) {
      console.log("🔄 ForMyPet: Calling window.hideLoading()");
      window.hideLoading();
    }
    
    // Additional post-render debugging for iOS
    setTimeout(() => {
      console.log("📱 ForMyPet: Post-render check - DOM loaded");
      iOSLogger.log("App rendered and DOM ready");
    }, 100);
  } catch (error) {
    console.error("💥 ForMyPet: Failed to render App:", error);
    remoteLogger.error("Failed to render App", "main", { error: error?.toString() });
  }
}
