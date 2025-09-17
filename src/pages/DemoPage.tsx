import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Heart, 
  Calendar, 
  Euro, 
  Trophy, 
  Play,
  Download,
  Star,
  Shield,
  Zap,
  Users,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import InteractiveDemo from '@/components/demo/InteractiveDemo';

const DemoPage = () => {
  const [showFullscreenDemo, setShowFullscreenDemo] = useState(false);
  const [isFullscreenParam, setIsFullscreenParam] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('fullscreen') === 'true') {
      setIsFullscreenParam(true);
      setShowFullscreenDemo(true);
    }
  }, []);

  const features = [
    {
      icon: Heart,
      title: "Διαχείριση Κατοικιδίων",
      description: "Κρατήστε όλες τις πληροφορίες των κατοικιδίων σας οργανωμένες",
      color: "text-pink-500"
    },
    {
      icon: Calendar,
      title: "Έξυπνο Ημερολόγιο",
      description: "Προγραμματίστε εμβολιασμούς, επισκέψεις και φαρμακευτική αγωγή",
      color: "text-blue-500"
    },
    {
      icon: Euro,
      title: "Παρακολούθηση Εξόδων",
      description: "Ελέγξτε τα έξοδα φροντίδας των κατοικιδίων σας",
      color: "text-green-500"
    },
    {
      icon: Trophy,
      title: "Συστήματα Επιτευγμάτων",
      description: "Κερδίστε επιτεύγματα και βελτιώστε τη φροντίδα",
      color: "text-yellow-500"
    }
  ];

  const stats = [
    { number: "10K+", label: "Χρήστες", icon: Users },
    { number: "50K+", label: "Κατοικίδια", icon: Heart },
    { number: "4.9", label: "Βαθμολογία", icon: Star },
    { number: "99%", label: "Uptime", icon: Shield }
  ];

  if (showFullscreenDemo && isFullscreenParam) {
    return <InteractiveDemo fullscreen onClose={() => window.close()} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      {/* Fullscreen Demo Overlay */}
      {showFullscreenDemo && (
        <InteractiveDemo 
          fullscreen 
          onClose={() => setShowFullscreenDemo(false)} 
        />
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="text-primary">
                  <Zap className="h-3 w-3 mr-1" />
                  Νέα έκδοση 2.0
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  Η καλύτερη εφαρμογή για τα
                  <span className="text-primary"> κατοικίδιά σας</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Διαχειριστείτε τη φροντίδα, την υγεία και τα έξοδα των αγαπημένων σας κατοικιδίων 
                  με έναν έξυπνο τρόπο. Όλα σε ένα μέρος.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="text-lg px-8"
                  onClick={() => setShowFullscreenDemo(true)}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Δείτε το Demo
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8">
                  <Download className="h-5 w-5 mr-2" />
                  Κατεβάστε τώρα
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={index} className="text-center space-y-2">
                      <div className="flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-primary mr-2" />
                        <span className="text-2xl font-bold">{stat.number}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <InteractiveDemo />
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Γιατί να επιλέξετε το ForMyPet;
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Μια ολοκληρωμένη λύση που κάνει τη φροντίδα των κατοικιδίων σας εύκολη και διασκεδαστική
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-background/60 backdrop-blur-sm">
                  <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <IconComponent className={`h-8 w-8 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Δοκιμάστε την εφαρμογή τώρα
            </h2>
            <p className="text-xl text-muted-foreground">
              Εξερευνήστε όλες τις λειτουργίες με το διαδραστικό μας demo
            </p>
          </div>

          <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5">
            <div className="space-y-6">
              <div className="flex items-center justify-center space-x-6">
                <Smartphone className="h-12 w-12 text-primary" />
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                <div className="text-center">
                  <div className="font-semibold">Πλήρως Διαδραστικό</div>
                  <div className="text-sm text-muted-foreground">Πλοηγηθείτε σε όλες τις οθόνες</div>
                </div>
              </div>

              <Button 
                size="lg" 
                className="text-lg px-8"
                onClick={() => setShowFullscreenDemo(true)}
              >
                <Play className="h-5 w-5 mr-2" />
                Ξεκινήστε το Demo
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ετοιμοι να ξεκινήσετε;
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Κατεβάστε το ForMyPet σήμερα και δώστε στα κατοικίδιά σας 
            τη φροντίδα που αξίζουν
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              <Download className="h-5 w-5 mr-2" />
              App Store
            </Button>
            <Button size="lg" variant="secondary" className="text-lg px-8">
              <Download className="h-5 w-5 mr-2" />
              Google Play
            </Button>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 text-sm opacity-75">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Δωρεάν λήψη
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Χωρίς διαφημίσεις
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Ασφαλή δεδομένα
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DemoPage;