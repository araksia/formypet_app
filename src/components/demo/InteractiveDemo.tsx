import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Home, Heart, Calendar, Euro, Trophy, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PhoneScreenshot from '../screenshots/PhoneScreenshot';
import PhonePetsScreenshot from '../screenshots/PhonePetsScreenshot';
import CalendarScreenshot from '../screenshots/CalendarScreenshot';
import AddPetScreenshot from '../screenshots/AddPetScreenshot';
import ExpensesScreenshot from '../screenshots/ExpensesScreenshot';
import SettingsScreenshot from '../screenshots/SettingsScreenshot';
import MedicalRecordsScreenshot from '../screenshots/MedicalRecordsScreenshot';

type DemoScreen = 'dashboard' | 'pets' | 'calendar' | 'add-pet' | 'expenses' | 'settings' | 'medical';

interface DemoScreenConfig {
  id: DemoScreen;
  title: string;
  component: React.ComponentType;
  icon: React.ComponentType<any>;
  color: string;
}

const demoScreens: DemoScreenConfig[] = [
  { id: 'dashboard', title: 'Αρχική', component: PhoneScreenshot, icon: Home, color: 'bg-blue-500' },
  { id: 'pets', title: 'Κατοικίδια', component: PhonePetsScreenshot, icon: Heart, color: 'bg-pink-500' },
  { id: 'calendar', title: 'Ημερολόγιο', component: CalendarScreenshot, icon: Calendar, color: 'bg-green-500' },
  { id: 'add-pet', title: 'Προσθήκη Κατοικιδίου', component: AddPetScreenshot, icon: Heart, color: 'bg-purple-500' },
  { id: 'expenses', title: 'Έξοδα', component: ExpensesScreenshot, icon: Euro, color: 'bg-yellow-500' },
  { id: 'medical', title: 'Ιατρικά', component: MedicalRecordsScreenshot, icon: Trophy, color: 'bg-red-500' },
  { id: 'settings', title: 'Ρυθμίσεις', component: SettingsScreenshot, icon: Settings, color: 'bg-gray-500' },
];

interface InteractiveDemoProps {
  fullscreen?: boolean;
  onClose?: () => void;
}

const InteractiveDemo = ({ fullscreen = false, onClose }: InteractiveDemoProps) => {
  const [currentScreen, setCurrentScreen] = useState<DemoScreen>('dashboard');
  const currentIndex = demoScreens.findIndex(screen => screen.id === currentScreen);
  const currentScreenConfig = demoScreens[currentIndex];

  const goToNext = () => {
    const nextIndex = (currentIndex + 1) % demoScreens.length;
    setCurrentScreen(demoScreens[nextIndex].id);
  };

  const goToPrevious = () => {
    const prevIndex = currentIndex === 0 ? demoScreens.length - 1 : currentIndex - 1;
    setCurrentScreen(demoScreens[prevIndex].id);
  };

  const goToScreen = (screenId: DemoScreen) => {
    setCurrentScreen(screenId);
  };

  const CurrentComponent = currentScreenConfig.component;

  const containerClass = fullscreen 
    ? "fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
    : "w-full max-w-4xl mx-auto";

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center space-y-6 w-full">
        
        {/* Header with title and navigation */}
        <div className="flex items-center justify-between w-full max-w-2xl">
          {fullscreen && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-white hover:text-gray-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Κλείσιμο
            </Button>
          )}
          
          <div className="text-center flex-1">
            <h2 className={`text-xl font-semibold ${fullscreen ? 'text-white' : 'text-foreground'}`}>
              {currentScreenConfig.title}
            </h2>
            <p className={`text-sm ${fullscreen ? 'text-gray-300' : 'text-muted-foreground'}`}>
              {currentIndex + 1} από {demoScreens.length}
            </p>
          </div>

          {!fullscreen && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('/demo?fullscreen=true', '_blank')}
            >
              Πλήρης οθόνη
            </Button>
          )}
        </div>

        {/* Screen navigation buttons */}
        <div className="flex flex-wrap justify-center gap-2 max-w-4xl">
          {demoScreens.map((screen) => {
            const IconComponent = screen.icon;
            return (
              <Button
                key={screen.id}
                variant={currentScreen === screen.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => goToScreen(screen.id)}
                className="text-xs"
              >
                <IconComponent className="h-3 w-3 mr-1" />
                {screen.title}
              </Button>
            );
          })}
        </div>

        {/* Main demo screen */}
        <div className="relative flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPrevious}
            className="absolute left-0 z-10 -translate-x-12 hover:bg-primary/10"
            disabled={demoScreens.length <= 1}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentScreen}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <Card className="bg-white shadow-2xl overflow-hidden">
                <CardContent className="p-0">
                  <CurrentComponent />
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          <Button
            variant="ghost"
            size="sm"
            onClick={goToNext}
            className="absolute right-0 z-10 translate-x-12 hover:bg-primary/10"
            disabled={demoScreens.length <= 1}
          >
            <ArrowRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Progress indicator */}
        <div className="flex space-x-2">
          {demoScreens.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                index === currentIndex 
                  ? (fullscreen ? 'bg-white' : 'bg-primary') 
                  : (fullscreen ? 'bg-white/30' : 'bg-muted')
              }`}
            />
          ))}
        </div>

        {/* Touch/keyboard instructions */}
        <div className={`text-xs text-center ${fullscreen ? 'text-gray-400' : 'text-muted-foreground'}`}>
          <p>Χρησιμοποιήστε τα βέλη ή κάντε κλικ στα κουμπιά για περιήγηση</p>
          <p>Πατήστε τα κουμπιά παραπάνω για άμεση μετάβαση σε οθόνη</p>
        </div>
      </div>
    </div>
  );
};

export default InteractiveDemo;