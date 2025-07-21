import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Smartphone, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  Lock, 
  Eye,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  Mail,
  Settings as SettingsIcon,
  Trash2,
  Download
} from 'lucide-react';

const SettingsPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    eventReminders: true,
    medicationReminders: true,
    familyInvites: true,
    
    // Privacy
    profileVisibility: 'friends',
    shareLocation: false,
    shareActivity: true,
    
    // App preferences
    theme: 'light',
    soundEnabled: true,
    
    // Security
    twoFactorAuth: false,
    biometricLogin: false,
  });

  // Apply theme changes
  useEffect(() => {
    const html = document.documentElement;
    if (settings.theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [settings.theme]);

  const handleSettingChange = async (key: string, value: any) => {
    if (key === 'pushNotifications') {
      if (value) {
        // Request notification permission when enabling push notifications
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
            toast({
              title: "Άρνηση άδειας",
              description: "Οι push ειδοποιήσεις χρειάζονται άδεια από τον browser.",
              variant: "destructive"
            });
            return;
          }
        } else {
          toast({
            title: "Μη υποστηριζόμενο",
            description: "Ο browser σας δεν υποστηρίζει push ειδοποιήσεις.",
            variant: "destructive"
          });
          return;
        }
      } else {
        // When disabling push notifications
        toast({
          title: "Push ειδοποιήσεις απενεργοποιήθηκαν",
          description: "Πρέπει να τις ενεργοποιήσετε για να λαμβάνετε ειδοποιήσεις.",
          variant: "destructive"
        });
      }
    }
    
    setSettings(prev => ({ ...prev, [key]: value }));
    if (key === 'pushNotifications' && value) {
      toast({
        title: "Ρύθμιση ενημερώθηκε",
        description: "Οι push ειδοποιήσεις ενεργοποιήθηκαν επιτυχώς.",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Αποσύνδεση",
        description: "Αποσυνδεθήκατε επιτυχώς.",
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "Σφάλμα",
        description: "Υπήρξε πρόβλημα κατά την αποσύνδεση.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAccount = () => {
    // This would show a confirmation dialog in a real app
    toast({
      title: "Διαγραφή λογαριασμού",
      description: "Η λειτουργία θα είναι διαθέσιμη σύντομα.",
      variant: "destructive",
    });
  };

  const handleHelpSupport = () => {
    window.location.href = 'mailto:info@formypet.gr?subject=Βοήθεια ForMyPet&body=Γεια σας,%0D%0A%0D%0AΘα θέλα βοήθεια με:%0D%0A%0D%0A';
  };

  const handleAbout = () => {
    toast({
      title: "ForMyPet v1.0.0",
      description: "Εφαρμογή διαχείρισης κατοικίδιων. © 2024 ForMyPet",
    });
  };

  const handleDataExport = async () => {
    try {
      toast({
        title: "Εξαγωγή δεδομένων",
        description: "Η εξαγωγή ξεκίνησε. Θα λάβετε email με τα δεδομένα σας.",
      });
      // In a real app, this would trigger an export process
    } catch (error) {
      toast({
        title: "Σφάλμα",
        description: "Υπήρξε πρόβλημα με την εξαγωγή δεδομένων.",
        variant: "destructive"
      });
    }
  };

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    description, 
    children 
  }: { 
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description?: string;
    children: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-start gap-3 flex-1">
        <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium">{title}</h4>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center">
        {children}
      </div>
    </div>
  );

  const ActionItem = ({ 
    icon: Icon, 
    title, 
    description, 
    onClick,
    variant = "default"
  }: { 
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description?: string;
    onClick: () => void;
    variant?: "default" | "destructive";
  }) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between py-4 px-0 hover:bg-muted/50 rounded-lg transition-colors ${
        variant === "destructive" ? "text-destructive" : ""
      }`}
    >
      <div className="flex items-start gap-3 flex-1">
        <Icon className={`h-5 w-5 mt-0.5 ${
          variant === "destructive" ? "text-destructive" : "text-muted-foreground"
        }`} />
        <div className="flex-1 text-left">
          <h4 className="font-medium">{title}</h4>
          {description && (
            <p className={`text-sm mt-1 ${
              variant === "destructive" ? "text-destructive/70" : "text-muted-foreground"
            }`}>{description}</p>
          )}
        </div>
      </div>
      <ChevronRight className={`h-4 w-4 ${
        variant === "destructive" ? "text-destructive" : "text-muted-foreground"
      }`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <Header title="Ρυθμίσεις" />
      
      <div className="p-4 space-y-6">
        
        {/* Account Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Λογαριασμός
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <ActionItem
              icon={User}
              title="Προφίλ"
              description="Επεξεργασία προσωπικών στοιχείων"
              onClick={() => navigate('/profile')}
            />
            <Separator />
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Ειδοποιήσεις
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <SettingItem
              icon={Mail}
              title="Email ειδοποιήσεις"
              description="Λάβετε ειδοποιήσεις στο email σας"
            >
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </SettingItem>
            <Separator />
            <SettingItem
              icon={Smartphone}
              title="Push ειδοποιήσεις"
              description="Ειδοποιήσεις στη συσκευή σας"
            >
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
              />
            </SettingItem>
          </CardContent>
        </Card>

        {/* Support & Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Υποστήριξη & Πληροφορίες
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <ActionItem
              icon={HelpCircle}
              title="Βοήθεια & Υποστήριξη"
              description="FAQ και επικοινωνία"
              onClick={handleHelpSupport}
            />
            <Separator />
            <ActionItem
              icon={Info}
              title="Σχετικά με την εφαρμογή"
              description="Έκδοση, όροι χρήσης"
              onClick={handleAbout}
            />
            <Separator />
            <ActionItem
              icon={Download}
              title="Εξαγωγή δεδομένων"
              description="Κατεβάστε τα δεδομένα σας"
              onClick={handleDataExport}
            />
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Επικίνδυνες Ενέργειες
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <ActionItem
              icon={LogOut}
              title="Αποσύνδεση"
              description="Αποσυνδεθείτε από όλες τις συσκευές"
              onClick={handleLogout}
              variant="destructive"
            />
            <Separator />
            <ActionItem
              icon={Trash2}
              title="Διαγραφή λογαριασμού"
              description="Οριστική διαγραφή του λογαριασμού και όλων των δεδομένων"
              onClick={handleDeleteAccount}
              variant="destructive"
            />
          </CardContent>
        </Card>

        {/* App Version */}
        <div className="text-center text-sm text-muted-foreground py-4">
          ForMyPet v1.0.0
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;