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