import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  action: () => void;
  color: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export const QuickActions = React.memo<QuickActionsProps>(({ actions }) => {
  return (
    <section aria-labelledby="quick-actions-heading">
      <div className="flex items-center justify-between mb-4">
        <h3 id="quick-actions-heading" className="text-lg font-semibold text-gray-900">
          Γρήγορες Ενέργειες
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary focus-enhanced"
          aria-label="Προβολή όλων των γρήγορων ενεργειών"
        >
          Όλα <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3" role="grid" aria-label="Γρήγορες ενέργειες">
        {actions.map(({ icon: Icon, label, action, color }, index) => (
          <Card
            key={label}
            className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-95 focus-enhanced"
            onClick={action}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                action();
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`${label} - Πατήστε για ${label.toLowerCase()}`}
            aria-describedby={`action-${index}-desc`}
          >
            <CardContent className="p-4 text-center">
              <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-3 mx-auto`}>
                <Icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <h4 className="font-medium text-gray-900 text-sm leading-tight">{label}</h4>
              <span id={`action-${index}-desc`} className="sr-only">
                Κάντε κλικ για να προσθέσετε {label.toLowerCase()}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
});

QuickActions.displayName = 'QuickActions';