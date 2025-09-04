import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, RefreshCw, Smartphone } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const ManualAchievementCheck = () => {
  const { checkAchievements, loading } = useGamification();
  const [checking, setChecking] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const { toast } = useToast();

  const handleCheckAchievements = async () => {
    setChecking(true);
    try {
      await checkAchievements();
    } finally {
      setChecking(false);
    }
  };

  const handleTestPushNotifications = async () => {
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('reset-and-test-notifications');
      
      if (error) {
        console.error('Test notification error:', error);
        toast({
          title: "Σφάλμα",
          description: "Δεν μπόρεσα να στείλω test notification: " + error.message,
          variant: "destructive"
        });
      } else if (data?.success) {
        console.log('Test notification result:', data);
        toast({
          title: "Test Notification Sent! 📱",
          description: `Το test event δημιουργήθηκε! Θα λάβεις notification σε 3 λεπτά (${data.test_time})`,
        });
      } else {
        toast({
          title: "Σφάλμα",
          description: data?.error || "Άγνωστο σφάλμα",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Test notification failed:', error);
      toast({
        title: "Σφάλμα",
        description: "Δεν μπόρεσα να στείλω test notification",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          Έλεγχος Επιτευγμάτων
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Πατήστε για να ελέγξετε αν έχετε κερδίσει νέα επιτεύγματα βάσει της δραστηριότητάς σας.
        </p>
        <div className="space-y-3">
          <Button 
            onClick={handleCheckAchievements}
            disabled={checking || loading}
            variant="outline"
            className="w-full"
          >
            {checking ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trophy className="h-4 w-4 mr-2" />
            )}
            {checking ? 'Έλεγχος...' : 'Έλεγχος Επιτευγμάτων'}
          </Button>
          
          <Button 
            onClick={handleTestPushNotifications}
            disabled={testing || loading}
            variant="secondary"
            className="w-full"
          >
            {testing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Smartphone className="h-4 w-4 mr-2" />
            )}
            {testing ? 'Στέλνω test...' : 'Test Push Notifications (iPhone)'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};