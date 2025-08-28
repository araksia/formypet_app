import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Smartphone, Monitor, Download, Play, Settings, Zap } from 'lucide-react';

const ScreenRecordingGuide = () => {
  const [activeOS, setActiveOS] = useState<'ios' | 'android' | 'desktop'>('ios');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Οδηγός Screen Recording</h1>
        <p className="text-muted-foreground text-lg">
          Μάθετε πώς να κάνετε εγγραφή οθόνης της εφαρμογής ForMyPet για demo videos
        </p>
      </div>

      <Tabs value={activeOS} onValueChange={(value) => setActiveOS(value as 'ios' | 'android' | 'desktop')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ios" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            iOS
          </TabsTrigger>
          <TabsTrigger value="android" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Android
          </TabsTrigger>
          <TabsTrigger value="desktop" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Desktop
          </TabsTrigger>
        </TabsList>

        {/* iOS Guide */}
        <TabsContent value="ios">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📱 Εγγραφή Οθόνης σε iPhone/iPad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Setup */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Αρχική Ρύθμιση
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <Badge className="mt-0.5">1</Badge>
                    <div>
                      <p className="font-medium">Προσθήκη στο Control Center</p>
                      <p className="text-sm text-muted-foreground">
                        Ρυθμίσεις → Κέντρο Ελέγχου → Προσθήκη "Screen Recording"
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <Badge className="mt-0.5">2</Badge>
                    <div>
                      <p className="font-medium">Ενεργοποίηση Μικροφώνου (προαιρετικά)</p>
                      <p className="text-sm text-muted-foreground">
                        Long press το Screen Recording button → Ενεργοποιήστε το Microphone
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recording Steps */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  Βήματα Εγγραφής
                </h3>
                <div className="grid gap-3">
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <Badge variant="outline">1</Badge>
                    <div>
                      <p className="font-medium">Άνοιγμα ForMyPet App</p>
                      <p className="text-sm text-muted-foreground">Βεβαιωθείτε ότι η εφαρμογή είναι έτοιμη για demo</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <Badge variant="outline">2</Badge>
                    <div>
                      <p className="font-medium">Swipe από πάνω-δεξιά</p>
                      <p className="text-sm text-muted-foreground">Ανοίξτε το Control Center</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <Badge variant="outline">3</Badge>
                    <div>
                      <p className="font-medium">Πατήστε το Screen Recording</p>
                      <p className="text-sm text-muted-foreground">Περιμένετε την αντίστροφη μέτρηση 3 δευτερολέπτων</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <Badge variant="outline">4</Badge>
                    <div>
                      <p className="font-medium">Κάντε το Demo</p>
                      <p className="text-sm text-muted-foreground">Πλοηγηθείτε στην εφαρμογή κανονικά</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <Badge variant="outline">5</Badge>
                    <div>
                      <p className="font-medium">Διακοπή Εγγραφής</p>
                      <p className="text-sm text-muted-foreground">Πατήστε τη κόκκινη ένδειξη στο status bar ή στο Control Center</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Συμβουλές για iOS</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Κλείστε τις ειδοποιήσεις πριν την εγγραφή</li>
                  <li>• Χρησιμοποιήστε Do Not Disturb mode</li>
                  <li>• Βεβαιωθείτε ότι η μπαταρία είναι &gt;50%</li>
                  <li>• Το video αποθηκεύεται στο Photos app</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Android Guide */}
        <TabsContent value="android">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🤖 Εγγραφή Οθόνης σε Android
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  Μέθοδος 1: Native Screen Recorder (Android 11+)
                </h3>
                <div className="grid gap-3">
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <Badge variant="outline">1</Badge>
                    <div>
                      <p className="font-medium">Swipe κάτω από την κορυφή</p>
                      <p className="text-sm text-muted-foreground">Ανοίξτε το Quick Settings panel</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <Badge variant="outline">2</Badge>
                    <div>
                      <p className="font-medium">Βρείτε το "Screen Record"</p>
                      <p className="text-sm text-muted-foreground">Πατήστε το εικονίδιο (ή προσθέστε το αν δεν υπάρχει)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <Badge variant="outline">3</Badge>
                    <div>
                      <p className="font-medium">Επιλέξτε ρυθμίσεις</p>
                      <p className="text-sm text-muted-foreground">Audio, ποιότητα video, κ.λπ.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <Badge variant="outline">4</Badge>
                    <div>
                      <p className="font-medium">Πατήστε "Start"</p>
                      <p className="text-sm text-muted-foreground">Η εγγραφή αρχίζει μετά από countdown</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Download className="h-5 w-5 text-primary" />
                  Μέθοδος 2: Third-Party Apps
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Card className="border-2">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">AZ Screen Recorder</h4>
                      <p className="text-sm text-muted-foreground mb-3">Δωρεάν, χωρίς watermark</p>
                      <Badge variant="secondary">Προτεινόμενο</Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Mobizen</h4>
                      <p className="text-sm text-muted-foreground mb-3">Δωρεάν με καλή ποιότητα</p>
                      <Badge variant="outline">Εναλλακτικό</Badge>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">💡 Συμβουλές για Android</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Κλείστε background apps για καλύτερη performance</li>
                  <li>• Επιλέξτε 1080p resolution για καλή ποιότητα</li>
                  <li>• Ενεργοποιήστε "Show touches" στο Developer Options</li>
                  <li>• Χρησιμοποιήστε airplane mode για διακοπή ειδοποιήσεων</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Desktop Guide */}
        <TabsContent value="desktop">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🖥️ Εγγραφή Οθόνης σε Desktop
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Προτεινόμενα Tools
                </h3>
                <div className="grid gap-4">
                  <Card className="border-2 border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold mb-2">OBS Studio</h4>
                          <p className="text-sm text-muted-foreground mb-2">Professional, δωρεάν, open source</p>
                          <Badge className="mb-2">Προτεινόμενο</Badge>
                        </div>
                        <Button size="sm" variant="outline">Download</Button>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        ✅ Streaming & Recording ✅ Scene switching ✅ Filters & Effects
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">Loom</h4>
                        <p className="text-sm text-muted-foreground mb-2">Εύκολο, cloud-based</p>
                        <Badge variant="secondary">Web-based</Badge>
                        <div className="text-xs text-muted-foreground mt-2">
                          ✅ Instant sharing ✅ Auto transcription
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">QuickTime (macOS)</h4>
                        <p className="text-sm text-muted-foreground mb-2">Native macOS tool</p>
                        <Badge variant="outline">Built-in</Badge>
                        <div className="text-xs text-muted-foreground mt-2">
                          ✅ Simple ✅ High quality ✅ Free
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Setup για Mobile App Demo</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <Badge className="mt-0.5">1</Badge>
                    <div>
                      <p className="font-medium">Χρησιμοποιήστε Device Simulator</p>
                      <p className="text-sm text-muted-foreground">
                        Chrome DevTools → Toggle Device Toolbar (Ctrl+Shift+M)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <Badge className="mt-0.5">2</Badge>
                    <div>
                      <p className="font-medium">Επιλέξτε iPhone/Android preset</p>
                      <p className="text-sm text-muted-foreground">
                        Προτείνεται: iPhone 12/13/14 (390x844)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <Badge className="mt-0.5">3</Badge>
                    <div>
                      <p className="font-medium">Ρυθμίστε την εγγραφή</p>
                      <p className="text-sm text-muted-foreground">
                        Select περιοχή → Focus στο device simulator
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">💡 Pro Tips για Desktop</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Καθαρίστε το desktop πριν την εγγραφή</li>
                  <li>• Χρησιμοποιήστε 1080p+ resolution</li>
                  <li>• Κρύψτε desktop notifications</li>
                  <li>• Έχετε σκριπτ έτοιμο για το demo flow</li>
                  <li>• Κάντε test recording πρώτα</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Demo Script Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>📝 Demo Script Προτάσεις</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="p-3 border rounded-lg">
              <h4 className="font-semibold mb-2">🎬 Σύντομο Demo (30 δευτερόλεπτα)</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                <li>Άνοιγμα app → Dashboard view</li>
                <li>Γρήγορη περιήγηση στα pets</li>
                <li>Προσθήκη νέου event στο calendar</li>
                <li>Τέλος με overview των features</li>
              </ol>
            </div>
            
            <div className="p-3 border rounded-lg">
              <h4 className="font-semibold mb-2">🎥 Αναλυτικό Demo (2-3 λεπτά)</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                <li>Welcome screen & login</li>
                <li>Dashboard tour με stats</li>
                <li>Προσθήκη νέου κατοικιδίου</li>
                <li>Calendar με events</li>
                <li>Expenses tracking</li>
                <li>Settings & family sharing</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScreenRecordingGuide;