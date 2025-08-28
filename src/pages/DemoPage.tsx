import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, SkipForward, RotateCcw, Download } from 'lucide-react';
import Header from '@/components/Header';

const DemoPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const demoSteps = [
    {
      title: "Καλωσήρθατε στο ForMyPet",
      description: "Η εφαρμογή για τη φροντίδα των κατοικιδίων σας",
      component: "welcome",
      duration: 3000
    },
    {
      title: "Dashboard - Αρχική Οθόνη", 
      description: "Δείτε γρήγορα τα στατιστικά και τα επερχόμενα events",
      component: "dashboard",
      duration: 4000
    },
    {
      title: "Προσθήκη Κατοικιδίου",
      description: "Προσθέστε εύκολα νέα κατοικίδια με φωτογραφίες",
      component: "add-pet",
      duration: 4000
    },
    {
      title: "Διαχείριση Κατοικιδίων",
      description: "Δείτε όλα τα κατοικίδιά σας σε μία λίστα",
      component: "pets-list",
      duration: 3000
    },
    {
      title: "Ημερολόγιο Events",
      description: "Προγραμματίστε ραντεβού, φάρμακα και άλλα events",
      component: "calendar",
      duration: 4000
    },
    {
      title: "Παρακολούθηση Εξόδων",
      description: "Κρατήστε αρχεία όλων των εξόδων για τα κατοικίδιά σας",
      component: "expenses",
      duration: 3000
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentStep < demoSteps.length - 1) {
      interval = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, demoSteps[currentStep].duration);
    } else if (currentStep >= demoSteps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(interval);
  }, [currentStep, isPlaying, demoSteps]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const nextStep = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const renderStepComponent = () => {
    const step = demoSteps[currentStep];
    
    switch (step.component) {
      case "welcome":
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🐾</div>
            <h1 className="text-3xl font-bold text-primary mb-2">ForMyPet</h1>
            <p className="text-lg text-muted-foreground">Η εφαρμογή για τη φροντίδα των κατοικιδίων σας</p>
          </div>
        );

      case "dashboard":
        return (
          <div className="space-y-4 p-4">
            {/* Welcome Banner */}
            <Card className="bg-gradient-to-r from-primary to-primary/80 border-0">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="bg-white rounded-2xl p-4 max-w-xs">
                    <p className="text-gray-800 text-sm">
                      "Ευτυχώς που κατέβασε το ForMyPet και δε θα ξεχάσει ξανά να με πάει για μπάνιο!"
                    </p>
                  </div>
                  <div className="flex flex-col items-center ml-6">
                    <div className="text-4xl mb-2">🐕‍🦺</div>
                    <div className="text-white/90 text-xs text-center">Μπάτμαν<br />3 ετών</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold">3</div><div className="text-sm text-muted-foreground">Κατοικίδια</div></CardContent></Card>
              <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold">5</div><div className="text-sm text-muted-foreground">Events</div></CardContent></Card>
            </div>
          </div>
        );

      case "add-pet":
        return (
          <div className="space-y-4 p-4">
            <h2 className="text-xl font-bold">Προσθήκη Νέου Κατοικιδίου</h2>
            <div className="space-y-3">
              <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center border-2 border-dashed border-primary/30">
                <div className="text-center">
                  <div className="text-2xl mb-2">📷</div>
                  <p className="text-sm text-muted-foreground">Προσθήκη φωτογραφίας</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-10 bg-muted rounded-md flex items-center px-3">
                  <span className="text-muted-foreground">Όνομα κατοικιδίου...</span>
                </div>
                <div className="h-10 bg-muted rounded-md flex items-center px-3">
                  <span className="text-muted-foreground">Είδος κατοικιδίου...</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "pets-list":
        return (
          <div className="space-y-4 p-4">
            <h2 className="text-xl font-bold">Τα Κατοικίδιά μου</h2>
            <div className="space-y-3">
              {['Μπάτμαν', 'Λούλα', 'Φίλιππος'].map((name, i) => (
                <Card key={name} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center p-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center mr-4">
                        <span className="text-2xl">{['🐕', '🐱', '🐰'][i]}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold">{name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {['Σκύλος', 'Γάτα', 'Κουνέλι'][i]}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "calendar":
        return (
          <div className="space-y-4 p-4">
            <h2 className="text-xl font-bold">Ημερολόγιο</h2>
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                  {['Δε', 'Τρ', 'Τε', 'Πε', 'Πα', 'Σα', 'Κυ'].map(day => (
                    <div key={day} className="font-semibold text-muted-foreground">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 35 }, (_, i) => (
                    <div key={i} className="aspect-square flex items-center justify-center text-sm">
                      {i < 30 && (
                        <div className={`w-full h-full flex items-center justify-center rounded ${
                          [5, 12, 18, 25].includes(i) ? 'bg-primary text-primary-foreground' : ''
                        }`}>
                          {i + 1}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "expenses":
        return (
          <div className="space-y-4 p-4">
            <h2 className="text-xl font-bold">Έξοδα</h2>
            <Card>
              <CardContent className="p-4">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-primary">€156.50</div>
                  <p className="text-sm text-muted-foreground">Σύνολο μήνα</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span>Κτηνιατρείο - Μπάτμαν</span>
                    <span className="font-semibold">€45.00</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span>Φαγητό - Όλα</span>
                    <span className="font-semibold">€78.50</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span>Παιχνίδια - Λούλα</span>
                    <span className="font-semibold">€33.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <Header title="Interactive Demo" />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Demo Controls */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold mb-2">ForMyPet Interactive Demo</h1>
                <p className="text-muted-foreground">
                  Βήμα {currentStep + 1} από {demoSteps.length}: {demoSteps[currentStep].title}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={togglePlayPause}
                  title={isPlaying ? "Παύση" : "Αναπαραγωγή"}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextStep}
                  disabled={currentStep >= demoSteps.length - 1}
                  title="Επόμενο βήμα"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={resetDemo}
                  title="Επανεκκίνηση"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Πρόοδος</span>
                <span>{Math.round(((currentStep + 1) / demoSteps.length) * 100)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Phone Mockup */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-[320px] h-[640px] bg-black rounded-[2rem] p-2">
                <div className="w-full h-full bg-white rounded-[1.5rem] overflow-hidden">
                  {renderStepComponent()}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-3">{demoSteps[currentStep].title}</h3>
                <p className="text-muted-foreground mb-4">{demoSteps[currentStep].description}</p>
                
                {/* Features List based on current step */}
                <div className="space-y-2">
                  {currentStep === 0 && (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-sm">Εύκολη διαχείριση κατοικιδίων</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-sm">Προγραμματισμός events και υπενθυμίσεων</span>
                      </div>
                    </>
                  )}
                  {currentStep === 1 && (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-sm">Επισκόπηση όλων των κατοικιδίων</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-sm">Επερχόμενα events και υπενθυμίσεις</span>
                      </div>
                    </>
                  )}
                  {/* Add more feature lists for other steps as needed */}
                </div>
              </CardContent>
            </Card>

            {/* Step Navigation */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">Βήματα Demo</h4>
                <div className="space-y-2">
                  {demoSteps.map((step, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-full text-left p-2 rounded-lg transition-colors ${
                        index === currentStep 
                          ? 'bg-primary text-primary-foreground' 
                          : index < currentStep 
                            ? 'bg-muted hover:bg-muted/80' 
                            : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{step.title}</span>
                        <Badge variant={index === currentStep ? "secondary" : "outline"} className="text-xs">
                          {index + 1}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Export Options */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4">Export Options</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Screenshots
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />  
                Screen Recording Guide
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Demo Video
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DemoPage;