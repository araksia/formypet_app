import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("🔥 ForMyPet: main.tsx loading");

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("💥 ForMyPet: Root element not found! This will cause black screen.");
} else {
  console.log("✅ ForMyPet: Root element found, creating React root");
  
  try {
    const root = createRoot(rootElement);
    console.log("🌱 ForMyPet: React root created, rendering App");
    root.render(<App />);
    console.log("✅ ForMyPet: App rendered successfully");
  } catch (error) {
    console.error("💥 ForMyPet: Failed to render App:", error);
  }
}
