import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const LoginScreenshot = () => {
  return (
    <div className="w-[375px] h-[812px] bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 overflow-hidden">
      {/* Header Space */}
      <div className="h-16"></div>
      
      <div className="flex flex-col items-center justify-center min-h-[600px] px-6">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🐾</div>
          <h1 className="text-3xl font-bold text-primary mb-2">ForMyPet</h1>
          <p className="text-muted-foreground">Καλωσήρθατε στην εφαρμογή φροντίδας κατοικιδίων</p>
        </div>

        {/* Login Form */}
        <Card className="w-full max-w-sm">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                type="email" 
                placeholder="example@email.com"
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Κωδικός</label>
              <Input 
                type="password" 
                placeholder="••••••••"
                className="h-12"
              />
            </div>

            <Button className="w-full h-12 text-base">
              Σύνδεση
            </Button>

            <div className="text-center">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                Ξέχασα τον κωδικό μου
              </Button>
            </div>

            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex justify-center">
                <span className="bg-background px-2 text-xs text-muted-foreground">ή</span>
              </div>
            </div>

            <Button variant="outline" className="w-full h-12 text-base">
              Εγγραφή νέου λογαριασμού
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>Με τη συνέχεια συμφωνείτε με τους</p>
          <div className="flex justify-center gap-2 mt-1">
            <Button variant="ghost" size="sm" className="text-xs h-auto p-0 text-primary hover:text-primary/80">
              Όρους Χρήσης
            </Button>
            <span>και την</span>
            <Button variant="ghost" size="sm" className="text-xs h-auto p-0 text-primary hover:text-primary/80">
              Πολιτική Απορρήτου
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreenshot;