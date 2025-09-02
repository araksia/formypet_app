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
  resources: {
    icon: {
      source: "public/app-icon.png",
      foreground: "public/app-icon.png",
      background: "#ffffff"
    },
    splash: {
      source: "public/splash-paws.png",
      backgroundColor: "#ffffff"
    }
  },
  ios: {
    scheme: "ForMyPet",
    path: "ios",
    minVersion: "15.0"
  },
  android: {
    path: "android"
  },
  plugins: {
    Camera: {
      permissions: ["camera", "photos"],
      iosImageWillSave: true,
      iosImageSaveToGallery: false,
      androidImagePickerActivity: "com.getcapacitor.camera.CameraImagePickerActivity"
    },
    LocalNotifications: {
      smallIcon: "ic_stat_notification",
      iconColor: "#4ADE80"
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
      useFcm: true,
      iconColor: "#4ADE80"
    },
    FirebaseAnalytics: {
      enabled: true
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      spinnerColor: "#999999",
      iosSpinnerStyle: "small",
      splashFullScreen: true,
      splashImmersive: true
    },
    Browser: {
      windowName: "_system"
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