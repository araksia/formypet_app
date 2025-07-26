#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🍎 Building ForMyPet for iOS Production...');

// Update capacitor config for production
const capacitorConfig = {
  appId: "gr.formypet.app",
  appName: "ForMyPet",
  webDir: "dist",
  bundledWebRuntime: false,
  ios: {
    scheme: "ForMyPet",
    path: "ios"
  },
  android: {
    path: "android"
  },
  plugins: {
    Camera: {
      permissions: ["camera", "photos"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF"
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidScaleType: "CENTER_CROP",
      showSpinner: false
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
  execSync('npx cap sync ios', { stdio: 'inherit' });
  
  // Open in Xcode (for manual build and archive)
  console.log('🛠️ Opening in Xcode...');
  execSync('npx cap open ios', { stdio: 'inherit' });
  
  console.log('✅ iOS project opened in Xcode!');
  console.log('📝 Next steps:');
  console.log('1. In Xcode, select "Any iOS Device (arm64)" as target');
  console.log('2. Go to Product > Archive to create archive for App Store');
  console.log('3. Use Window > Organizer to upload to App Store Connect');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}