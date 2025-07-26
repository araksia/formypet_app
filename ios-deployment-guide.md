# iOS Deployment Guide για ForMyPet

## Προαπαιτούμενα

1. **Mac με macOS** (για Xcode)
2. **Xcode 14+** (από Mac App Store)
3. **Apple Developer Account** ($99/year)
4. **App Store Connect Access**

## Βήματα για Deployment

### 1. Προετοιμασία Περιβάλλοντος

```bash
# Clone το project από GitHub
git clone [your-github-repo-url]
cd formypet-mobile

# Εγκατάσταση dependencies
npm install

# Προσθήκη iOS platform (αν δεν υπάρχει)
npx cap add ios
```

### 2. Δημιουργία iOS Build

```bash
# Τρέξε το build script
node build-scripts/build-ios.js
```

### 3. Ρύθμιση στο Xcode

Όταν ανοίξει το Xcode:

1. **Bundle Identifier**: Βεβαιώσου ότι είναι `gr.formypet.app`
2. **Team**: Επίλεξε το Apple Developer Team σου
3. **Version**: Όρισε την έκδοση (π.χ. 1.0.0)
4. **Build Number**: Αυτόματα αυξανόμενος αριθμός

### 4. App Icons & Assets

- **App Icon**: 1024x1024px (περιλαμβάνεται στο public/app-store-icon.png)
- **Splash Screen**: Περιλαμβάνεται στο public/splash-ios.png

### 5. Δικαιώματα (Info.plist)

Τα ακόλουθα permissions θα προστεθούν αυτόματα:
- Camera access για φωτογραφίες
- Photo library access
- Push notifications

### 6. Archive για App Store

1. Στο Xcode, επίλεξε **"Any iOS Device (arm64)"**
2. **Product > Archive**
3. Περίμενε το Archive να ολοκληρωθεί
4. **Window > Organizer**
5. Επίλεξε το Archive και κάνε κλικ **"Distribute App"**
6. Επίλεξε **"App Store Connect"**
7. Ακολούθησε τα βήματα για upload

### 7. App Store Connect Configuration

1. Μπες στο [App Store Connect](https://appstoreconnect.apple.com)
2. Δημιούργησε νέα εφαρμογή
3. Συμπλήρωσε τα metadata:
   - **App Name**: ForMyPet
   - **Description**: Εφαρμογή διαχείρισης κατοικιδίων
   - **Keywords**: κατοικίδια, pets, υγεία, ημερολόγιο
   - **Category**: Lifestyle ή Medical
4. Upload screenshots (απαιτούνται για διάφορες οθόνες)
5. Ρύθμισε pricing (Free ή Paid)

### 8. Review Process

- Κάνε submit για review
- Η Apple θα κάνει review σε 1-7 ημέρες
- Αν εγκριθεί, η app θα είναι διαθέσιμη στο App Store

## Σημαντικές Σημειώσεις

- **Privacy Policy**: Απαιτείται URL για privacy policy
- **Age Rating**: Ρύθμισε κατάλληλα για την εφαρμογή
- **Test Flight**: Χρησιμοποίησε για beta testing πριν το launch
- **Metadata Localization**: Μπορείς να προσθέσεις ελληνικά

## Troubleshooting

- Αν αποτύχει το build, ελέγξε τα certificates στο Xcode
- Για signing issues, χρησιμοποίησε "Automatically manage signing"
- Βεβαιώσου ότι έχεις την τελευταία έκδοση του Xcode

## Χρήσιμοι Σύνδεσμοι

- [Apple Developer Portal](https://developer.apple.com)
- [App Store Connect](https://appstoreconnect.apple.com)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)