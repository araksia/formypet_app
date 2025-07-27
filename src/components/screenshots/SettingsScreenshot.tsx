import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bell, Shield, Palette, HelpCircle, LogOut, Crown, Edit, Camera, Settings, Users } from 'lucide-react';

const SettingsScreenshot = () => {
  return (
    <div className="w-[375px] h-[812px] bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center justify-between">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-gray-900">Ρυθμίσεις</h1>
        <Button variant="ghost" size="sm">
          <Edit className="h-5 w-5" />
        </Button>
      </div>

      {/* Profile Section */}
      <div className="bg-white p-6 border-b">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Avatar className="w-16 h-16">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-lg font-bold">
                ΜΚ
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
              <Camera className="h-3 w-3 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">Μαρία Κωνσταντίνου</h2>
            <p className="text-gray-600">maria.k@email.com</p>
            <div className="flex items-center mt-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-600 mr-2">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
              <Badge variant="outline" className="text-xs">
                3 κατοικίδια
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="flex-1 p-4 space-y-4">
        {/* Notifications */}
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-100 rounded-full p-2">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Ειδοποιήσεις</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-600">Λήψη ειδοποιήσεων για events</p>
                </div>
                <Switch checked={true} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Ειδοποιήσεις Email</p>
                  <p className="text-sm text-gray-600">Εβδομαδιαία ανακεφαλαίωση</p>
                </div>
                <Switch checked={false} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Υπενθυμίσεις Φαρμάκων</p>
                  <p className="text-sm text-gray-600">Ειδοποιήσεις για φάρμακα</p>
                </div>
                <Switch checked={true} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-green-100 rounded-full p-2">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Ασφάλεια & Ιδιωτικότητα</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Δακτυλικό Αποτύπωμα</p>
                  <p className="text-sm text-gray-600">Ξεκλείδωμα με βιομετρικά</p>
                </div>
                <Switch checked={true} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Αυτόματη Σύνδεση</p>
                  <p className="text-sm text-gray-600">Παραμονή συνδεδεμένος</p>
                </div>
                <Switch checked={true} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Family & Sharing */}
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-purple-100 rounded-full p-2">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Οικογένεια & Κοινοποίηση</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Μέλη Οικογένειας</p>
                  <p className="text-sm text-gray-600">2 ενεργά μέλη</p>
                </div>
                <Button variant="outline" size="sm">Διαχείριση</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Κοινοποίηση Δεδομένων</p>
                  <p className="text-sm text-gray-600">Μοίρασμα με κτηνίατρο</p>
                </div>
                <Switch checked={false} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-orange-100 rounded-full p-2">
                <Palette className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Προτιμήσεις Εφαρμογής</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Σκοτεινό Θέμα</p>
                  <p className="text-sm text-gray-600">Εμφάνιση σε σκοτεινό mode</p>
                </div>
                <Switch checked={false} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Γλώσσα</p>
                  <p className="text-sm text-gray-600">Ελληνικά</p>
                </div>
                <Button variant="outline" size="sm">Αλλαγή</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-pink-100 rounded-full p-2">
                <HelpCircle className="h-5 w-5 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Υποστήριξη</h3>
            </div>
            <div className="space-y-2">
              <Button variant="ghost" className="justify-start w-full text-left">
                📧 Επικοινωνία Support
              </Button>
              <Button variant="ghost" className="justify-start w-full text-left">
                📖 Οδηγός Χρήσης
              </Button>
              <Button variant="ghost" className="justify-start w-full text-left">
                ⭐ Αξιολόγηση App
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
          <LogOut className="h-4 w-4 mr-2" />
          Αποσύνδεση
        </Button>
      </div>
    </div>
  );
};

export default SettingsScreenshot;