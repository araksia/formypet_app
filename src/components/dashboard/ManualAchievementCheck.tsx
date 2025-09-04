import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, RefreshCw } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ManualAchievementCheck = () => {
  const { checkAchievements, loading } = useGamification();
  const [checking, setChecking] = React.useState(false);

  const handleCheckAchievements = async () => {
    setChecking(true);
    try {
      await checkAchievements();
    } finally {
      setChecking(false);
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
      </CardContent>
    </Card>
  );
};