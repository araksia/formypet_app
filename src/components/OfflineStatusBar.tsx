import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw, Database, Wifi } from 'lucide-react';
import { useOnline } from '@/hooks/useOnline';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { cn } from '@/lib/utils';

interface OfflineStatusBarProps {
  className?: string;
}

export const OfflineStatusBar: React.FC<OfflineStatusBarProps> = ({ className }) => {
  const isOnline = useOnline();
  const { hasQueuedActions, queue, syncQueue, syncing } = useOfflineSync();

  // Don't show anything if online and no queued actions
  if (isOnline && !hasQueuedActions) {
    return null;
  }

  return (
    <div className={cn(
      "sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm",
      className
    )}>
      <div className="flex items-center justify-between px-4 py-2 text-sm">
        {/* Status Icon and Text */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          
          <span className={cn(
            "font-medium",
            isOnline ? "text-green-700" : "text-red-700"
          )}>
            {isOnline ? "Online" : "Offline"}
          </span>

          {hasQueuedActions && (
            <Badge variant="secondary" className="ml-2 text-xs">
              <Database className="h-3 w-3 mr-1" />
              {queue.length} αποθηκευμένες
            </Badge>
          )}
        </div>

        {/* Sync Button */}
        {hasQueuedActions && (
          <Button
            variant="outline"
            size="sm"
            onClick={syncQueue}
            disabled={syncing || !isOnline}
            className="h-8 px-3 text-xs"
          >
            {syncing ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Συγχρονισμός...
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3 mr-1" />
                Συγχρονισμός
              </>
            )}
          </Button>
        )}
      </div>

      {/* Queue Details when offline */}
      {!isOnline && hasQueuedActions && (
        <div className="px-4 pb-2">
          <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
            💾 {queue.length} ενέργειες αποθηκευμένες offline - θα συγχρονιστούν αυτόματα
          </div>
        </div>
      )}
    </div>
  );
};