#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Building ForMyPet for Android Production...');

// Update capacitor config for production
const capacitorConfig = {
  appId: "gr.formypet.app",
  appName: "ForMyPet",
  webDir: "dist",
  plugins: {
    Camera: {
      permissions: ["camera", "photos"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF"
    }
  }
};

fs.writeFileSync('capacitor.config.json', JSON.stringify(capacitorConfig, null, 2));

try {
  // Build the web app
  console.log('📦 Building web app...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Sync with Capacitor
  console.log('🔄 Syncing with Capacitor...');
  execSync('npx cap sync android', { stdio: 'inherit' });
  
  // Build Android APK
  console.log('📱 Building Android APK...');
  execSync('npx cap build android', { stdio: 'inherit' });
  
  console.log('✅ Android build completed successfully!');
  console.log('📍 APK location: android/app/build/outputs/apk/');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}