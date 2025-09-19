import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WifiOff, RefreshCw, Database } from 'lucide-react';
import { useOfflineSync } from '@/hooks/useOfflineSync';

const OfflineIndicator = () => {
  const { hasQueuedActions, queue, syncQueue, syncing } = useOfflineSync();

  const handleRetry = () => {
    window.location.reload();
  };

  const handleSync = () => {
    syncQueue();
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          {/* Offline Animation */}
          <div className="relative mb-6 flex justify-center items-center">
            <div className="text-6xl animate-bounce" style={{ animationDuration: '2s' }}>
              🐕
            </div>
            <div className="absolute -top-2 -right-4 text-2xl animate-pulse">
              💤
            </div>
            <div className="absolute top-0 right-8 text-lg animate-pulse" style={{ animationDelay: '0.5s' }}>
              z
            </div>
            <div className="absolute -top-1 right-12 text-sm animate-pulse" style={{ animationDelay: '1s' }}>
              z
            </div>
            <div className="absolute -top-2 right-16 text-xs animate-pulse" style={{ animationDelay: '1.5s' }}>
              z
            </div>
          </div>
          
          {/* Status Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <WifiOff className="h-5 w-5" />
              <span className="font-medium">Χωρίς σύνδεση στο διαδίκτυο</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Δεν υπάρχει σύνδεση στο διαδίκτυο. Μπορείτε να συνεχίσετε να χρησιμοποιείτε την εφαρμογή offline.
            </p>

            {/* Offline Queue Status */}
            {hasQueuedActions && (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Database className="h-4 w-4 text-blue-500" />
                  <Badge variant="secondary" className="text-xs">
                    {queue.length} ενέργειες αποθηκευμένες offline
                  </Badge>
                </div>
                
                <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                  Οι αλλαγές σας έχουν αποθηκευτεί τοπικά και θα συγχρονιστούν 
                  αυτόματα όταν επιστρέψει η σύνδεση.
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSync}
                  disabled={syncing}
                  className="w-full"
                >
                  {syncing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Συγχρονισμός...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Δοκιμή συγχρονισμού
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 justify-center pt-4">
              <Button 
                variant="outline" 
                onClick={handleRetry}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Δοκιμή ξανά
              </Button>
              
              <Button 
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                Συνέχεια offline
              </Button>
            </div>

            {/* Cached Data Info */}
            <div className="text-xs text-muted-foreground pt-2 border-t">
              💾 Τα δεδομένα σας είναι αποθηκευμένα τοπικά και διαθέσιμα offline
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfflineIndicator;