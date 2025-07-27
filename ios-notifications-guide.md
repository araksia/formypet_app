# iOS Push Notifications Setup για ForMyPet

## 📱 Push Notifications στο iPhone

Τα push notifications είναι ήδη προγραμματισμένα στην εφαρμογή, αλλά για να δουλέψουν πλήρως στο iPhone χρειάζονται κάποιες επιπλέον ρυθμίσεις:

## ✅ Τι έχει ήδη γίνει:

- 🔧 **Capacitor Plugin**: Το `@capacitor/push-notifications` είναι εγκατεστημένο
- 📝 **Hook Implementation**: Το `usePushNotifications.ts` χειρίζεται τις ειδοποιήσεις
- ⚙️ **App Integration**: Οι ειδοποιήσεις αρχικοποιούνται στο App.tsx
- 🎛️ **Settings Page**: Έλεγχος ενεργοποίησης/απενεργοποίησης

## 🚨 Τι χρειάζεται για πλήρη λειτουργία:

### 1. Apple Developer Account Requirements

**Για Production (App Store):**
- 📜 **APNs Certificate**: Πρέπει να δημιουργηθεί στο Apple Developer Portal
- 🔐 **APNs Key**: Εναλλακτικά, μπορεί να χρησιμοποιηθεί APNs Key (προτιμότερο)
- 📱 **Bundle ID**: Πρέπει να είναι καταχωρημένο στο Developer Portal

### 2. Backend Server για Αποστολή Notifications

Χρειάζεται backend service που:
- 📋 Αποθηκεύει τα device tokens
- ⏰ Στέλνει notifications με βάση τα scheduled events
- 📡 Επικοινωνεί με τους Apple Push Notification servers

### 3. iOS Capabilities Configuration

Στο Xcode project:
- ✅ **Push Notifications capability** (ήδη προστέθηκε στο config)
- ✅ **Background App Refresh** (για notifications όταν η app είναι κλειστή)

## 🛠️ Implementation Steps:

### Βήμα 1: APNs Configuration
```bash
# Στο Apple Developer Portal:
1. Δημιούργησε APNs Key ή Certificate
2. Κατέβασε το .p8 key file
3. Σημείωσε το Key ID και Team ID
```

### Βήμα 2: Backend Integration
Η εφαρμογή χρειάζεται backend για:
- Event scheduling notifications
- Token management
- Notification delivery

### Βήμα 3: Testing
```javascript
// Local notifications για testing (δουλεύουν χωρίς backend)
import { LocalNotifications } from '@capacitor/local-notifications';

const scheduleLocalNotification = async () => {
  await LocalNotifications.schedule({
    notifications: [
      {
        title: "Υπενθύμιση Event",
        body: "Ώρα για φάρμακο του Rex!",
        id: 1,
        schedule: { at: new Date(Date.now() + 1000 * 5) }, // 5 seconds
        sound: "default"
      }
    ]
  });
};
```

## 📋 Τρέχουσα Κατάσταση:

✅ **Ναι, θα δουλέψουν βασικά:**
- Permission requests
- Local notifications
- In-app notification handling
- Settings toggle

❌ **Δεν θα δουλέψουν πλήρως:**
- Remote push notifications από server
- Scheduled notifications για events
- Notifications όταν η app είναι κλειστή

## 🔧 Για πλήρη λειτουργία:

1. **Άμεσα διαθέσιμο**: Local notifications για immediate reminders
2. **Χρειάζεται backend**: Remote push notifications για scheduled events
3. **Apple Developer setup**: APNs certificates/keys

## 💡 Προτάσεις:

- **Phase 1**: Local notifications για immediate testing
- **Phase 2**: Supabase Edge Functions για backend notifications
- **Phase 3**: Full APNs integration με Apple certificates

Θέλεις να προσθέσω local notifications για άμεση λειτουργία;