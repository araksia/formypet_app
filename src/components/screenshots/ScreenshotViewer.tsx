
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PhoneScreenshot from './PhoneScreenshot';
import PhonePetsScreenshot from './PhonePetsScreenshot';
import CalendarScreenshot from './CalendarScreenshot';
import AddPetScreenshot from './AddPetScreenshot';
import ExpensesScreenshot from './ExpensesScreenshot';
import SettingsScreenshot from './SettingsScreenshot';
import MedicalRecordsScreenshot from './MedicalRecordsScreenshot';
import LoginScreenshot from './LoginScreenshot';
import NotificationsScreenshot from './NotificationsScreenshot';
import Tablet7Screenshot from './Tablet7Screenshot';
import Tablet10Screenshot from './Tablet10Screenshot';

const ScreenshotViewer = () => {
  const [currentView, setCurrentView] = useState<'phone-dashboard' | 'phone-pets' | 'phone-calendar' | 'phone-add-pet' | 'phone-expenses' | 'phone-settings' | 'phone-medical' | 'phone-login' | 'phone-notifications' | 'tablet-7' | 'tablet-10'>('phone-dashboard');

  const downloadPNG = (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    // Create a canvas with the element's content
    import('html2canvas').then((html2canvas) => {
      html2canvas.default(element, {
        backgroundColor: '#f8fafc',
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true
      }).then((canvas) => {
        // Create download link
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    });
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'phone-dashboard':
        return (
          <div id="phone-dashboard-screenshot" className="inline-block">
            <PhoneScreenshot />
          </div>
        );
      case 'phone-pets':
        return (
          <div id="phone-pets-screenshot" className="inline-block">
            <PhonePetsScreenshot />
          </div>
        );
      case 'phone-calendar':
        return (
          <div id="phone-calendar-screenshot" className="inline-block">
            <CalendarScreenshot />
          </div>
        );
      case 'phone-add-pet':
        return (
          <div id="phone-add-pet-screenshot" className="inline-block">
            <AddPetScreenshot />
          </div>
        );
      case 'phone-expenses':
        return (
          <div id="phone-expenses-screenshot" className="inline-block">
            <ExpensesScreenshot />
          </div>
        );
      case 'phone-settings':
        return (
          <div id="phone-settings-screenshot" className="inline-block">
            <SettingsScreenshot />
          </div>
        );
      case 'phone-medical':
        return (
          <div id="phone-medical-screenshot" className="inline-block">
            <MedicalRecordsScreenshot />
          </div>
        );
      case 'phone-login':
        return (
          <div id="phone-login-screenshot" className="inline-block">
            <LoginScreenshot />
          </div>
        );
      case 'phone-notifications':
        return (
          <div id="phone-notifications-screenshot" className="inline-block">
            <NotificationsScreenshot />
          </div>
        );
      case 'tablet-7':
        return (
          <div id="tablet-7-screenshot" className="inline-block">
            <Tablet7Screenshot />
          </div>
        );
      case 'tablet-10':
        return (
          <div id="tablet-10-screenshot" className="inline-block">
            <Tablet10Screenshot />
          </div>
        );
      default:
        return null;
    }
  };

  const getDownloadFilename = () => {
    switch (currentView) {
      case 'phone-dashboard':
        return 'formypet-phone-dashboard.png';
      case 'phone-pets':
        return 'formypet-phone-pets.png';
      case 'phone-calendar':
        return 'formypet-phone-calendar.png';
      case 'phone-add-pet':
        return 'formypet-phone-add-pet.png';
      case 'phone-expenses':
        return 'formypet-phone-expenses.png';
      case 'phone-settings':
        return 'formypet-phone-settings.png';
      case 'phone-medical':
        return 'formypet-phone-medical.png';
      case 'phone-login':
        return 'formypet-phone-login.png';
      case 'phone-notifications':
        return 'formypet-phone-notifications.png';
      case 'tablet-7':
        return 'formypet-tablet-7inch.png';
      case 'tablet-10':
        return 'formypet-tablet-10inch.png';
      default:
        return 'formypet-screenshot.png';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">ForMyPet App Screenshots</h1>
          <p className="text-gray-600 mb-6">Στιγμιότυπα οθόνης για κινητό και tablet</p>
          
          {/* View Selector */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6 max-w-4xl mx-auto">
            <Button
              variant={currentView === 'phone-dashboard' ? 'default' : 'outline'}
              onClick={() => setCurrentView('phone-dashboard')}
              className="text-sm"
            >
              📱 Dashboard
            </Button>
            <Button
              variant={currentView === 'phone-pets' ? 'default' : 'outline'}
              onClick={() => setCurrentView('phone-pets')}
              className="text-sm"
            >
              🐕 Pets
            </Button>
            <Button
              variant={currentView === 'phone-calendar' ? 'default' : 'outline'}
              onClick={() => setCurrentView('phone-calendar')}
              className="text-sm"
            >
              📅 Calendar
            </Button>
            <Button
              variant={currentView === 'phone-add-pet' ? 'default' : 'outline'}
              onClick={() => setCurrentView('phone-add-pet')}
              className="text-sm"
            >
              ➕ Add Pet
            </Button>
            <Button
              variant={currentView === 'phone-expenses' ? 'default' : 'outline'}
              onClick={() => setCurrentView('phone-expenses')}
              className="text-sm"
            >
              💰 Expenses
            </Button>
            <Button
              variant={currentView === 'phone-settings' ? 'default' : 'outline'}
              onClick={() => setCurrentView('phone-settings')}
              className="text-sm"
            >
              ⚙️ Settings
            </Button>
            <Button
              variant={currentView === 'phone-medical' ? 'default' : 'outline'}
              onClick={() => setCurrentView('phone-medical')}
              className="text-sm"
            >
              🏥 Medical
            </Button>
            <Button
              variant={currentView === 'phone-login' ? 'default' : 'outline'}
              onClick={() => setCurrentView('phone-login')}
              className="text-sm"
            >
              🔐 Login
            </Button>
            <Button
              variant={currentView === 'phone-notifications' ? 'default' : 'outline'}
              onClick={() => setCurrentView('phone-notifications')}
              className="text-sm"
            >
              🔔 Notifications
            </Button>
            <Button
              variant={currentView === 'tablet-7' ? 'default' : 'outline'}
              onClick={() => setCurrentView('tablet-7')}
              className="text-sm"
            >
              📲 Tablet 7"
            </Button>
            <Button
              variant={currentView === 'tablet-10' ? 'default' : 'outline'}
              onClick={() => setCurrentView('tablet-10')}
              className="text-sm"
            >
              📲 Tablet 10"
            </Button>
          </div>

          {/* Download Button */}
          <Button
            onClick={() => downloadPNG(`${currentView}-screenshot`, getDownloadFilename())}
            className="mb-6"
            size="lg"
          >
            💾 Download PNG
          </Button>
        </div>

        {/* Screenshot Display */}
        <div className="flex justify-center">
          <Card className="inline-block bg-white shadow-2xl">
            <CardContent className="p-0">
              {renderCurrentView()}
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <div className="text-center mt-8 text-sm text-gray-500 space-y-2">
          <p>Κάντε κλικ στο κουμπί "Download PNG" για να κατεβάσετε το στιγμιότυπο οθόνης</p>
          <p>📱 <strong>Phone Screenshots:</strong> 375x812px (iPhone 13/14/15)</p>
          <p>📲 <strong>Tablet Screenshots:</strong> 7" (768x1024px), 10" (1024x768px)</p>
          <p>🎯 <strong>App Store Ready:</strong> Όλα τα screenshots είναι σε App Store διαστάσεις</p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg max-w-2xl mx-auto">
            <h4 className="font-semibold text-blue-900 mb-2">📋 App Store Requirements:</h4>
            <ul className="text-left text-blue-700 space-y-1">
              <li>• iPhone 6.7": 1290x2796px</li>
              <li>• iPhone 6.5": 1242x2688px</li>
              <li>• iPad Pro 12.9": 2048x2732px</li>
              <li>• iPad Pro 11": 1668x2388px</li>
            </ul>
            <p className="text-xs text-blue-600 mt-2">Τα screenshots θα κλιμακωθούν αυτόματα για τις απαιτούμενες διαστάσεις</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenshotViewer;
