import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatData {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface StatsSectionProps {
  statsData: StatData[];
}

export const StatsSection = React.memo<StatsSectionProps>(({ statsData }) => {
  return (
    <section aria-labelledby="stats-heading">
      <h3 id="stats-heading" className="text-lg font-semibold text-gray-900 mb-4">
        Στατιστικά
      </h3>
      <div className="grid grid-cols-2 gap-3" role="grid" aria-label="Στατιστικά εφαρμογής">
        {statsData.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card 
              key={index} 
              className="border-0 shadow-sm"
              role="gridcell"
              aria-label={`${stat.label}: ${stat.value}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-gray-100 rounded-xl" role="img" aria-label={`Εικονίδιο ${stat.label}`}>
                    <IconComponent className="h-5 w-5 text-gray-600" aria-hidden="true" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1" role="text">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
});

StatsSection.displayName = 'StatsSection';