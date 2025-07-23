
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PhoneScreenshot from './PhoneScreenshot';
import PhonePetsScreenshot from './PhonePetsScreenshot';
import Tablet7Screenshot from './Tablet7Screenshot';
import Tablet10Screenshot from './Tablet10Screenshot';

const ScreenshotViewer = () => {
  const [currentView, setCurrentView] = useState<'phone-dashboard' | 'phone-pets' | 'tablet-7' | 'tablet-10'>('phone-dashboard');

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
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <Button
              variant={currentView === 'phone-dashboard' ? 'default' : 'outline'}
              onClick={() => setCurrentView('phone-dashboard')}
            >
              📱 Phone Dashboard
            </Button>
            <Button
              variant={currentView === 'phone-pets' ? 'default' : 'outline'}
              onClick={() => setCurrentView('phone-pets')}
            >
              📱 Phone Pets
            </Button>
            <Button
              variant={currentView === 'tablet-7' ? 'default' : 'outline'}
              onClick={() => setCurrentView('tablet-7')}
            >
              📲 Tablet 7"
            </Button>
            <Button
              variant={currentView === 'tablet-10' ? 'default' : 'outline'}
              onClick={() => setCurrentView('tablet-10')}
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
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Κάντε κλικ στο κουμπί "Download PNG" για να κατεβάσετε το στιγμιότυπο οθόνης</p>
          <p>Διαστάσεις: Phone (375x812px), Tablet 7" (768x1024px), Tablet 10" (1024x768px)</p>
        </div>
      </div>
    </div>
  );
};

export default ScreenshotViewer;
