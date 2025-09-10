import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export const EmptyState = React.memo<EmptyStateProps>(({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-muted rounded-full">
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
          </div>
          <Button onClick={onAction} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            {actionLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

EmptyState.displayName = 'EmptyState';