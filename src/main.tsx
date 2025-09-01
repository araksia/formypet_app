import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { remoteLogger } from './utils/remoteLogger'

console.log("🔥 ForMyPet: main.tsx loading");
remoteLogger.info("main.tsx loading", "main");

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
  } catch (error) {
    console.error("💥 ForMyPet: Failed to render App:", error);
    remoteLogger.error("Failed to render App", "main", { error: error?.toString() });
  }
}
