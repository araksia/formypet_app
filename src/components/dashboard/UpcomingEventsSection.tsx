import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, ChevronRight, Plus } from 'lucide-react';
import { UpcomingEventSkeleton } from '@/components/ui/skeletons';
import { EmptyState } from './EmptyState';

interface UpcomingEvent {
  id: string;
  type: string;
  pet: string;
  date: string;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
  urgent: boolean;
}

interface UpcomingEventsSectionProps {
  events: UpcomingEvent[];
  loading: boolean;
  onViewAll: () => void;
  onEventClick: (eventId: string) => void;
  onAddEvent: () => void;
}

export const UpcomingEventsSection = React.memo<UpcomingEventsSectionProps>(({ 
  events, 
  loading, 
  onViewAll, 
  onEventClick,
  onAddEvent 
}) => {
  return (
    <section aria-labelledby="upcoming-events-heading">
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle id="upcoming-events-heading" className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
            Επερχόμενα Events
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onViewAll} 
            className="text-primary focus-enhanced"
            aria-label="Προβολή όλων των επερχόμενων events"
          >
            <Calendar className="h-4 w-4 mr-1" aria-hidden="true" />
            Όλα
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3" role="list" aria-label="Λίστα επερχόμενων events">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <UpcomingEventSkeleton key={i} />
                ))}
              </div>
            ) : events.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="Δεν υπάρχουν γεγονότα"
                description="Προσθέστε το πρώτο σας γεγονός για να οργανώσετε τη φροντίδα των κατοικιδίων σας"
                actionLabel="Προσθήκη Γεγονότος"
                onAction={onAddEvent}
              />
            ) : (
              events.map((event) => {
                const EventIcon = event.icon;
                return (
                  <div 
                    key={event.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => onEventClick(event.id)}
                    role="listitem"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onEventClick(event.id);
                      }
                    }}
                    aria-label={`Event: ${event.type} για ${event.pet} στις ${event.date} ${event.time}`}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <EventIcon className="h-5 w-5 text-primary" aria-hidden="true" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">{event.type}</span>
                        {event.urgent && (
                          <Badge 
                            variant="destructive" 
                            className="text-xs px-2 py-0"
                            aria-label="Επείγον"
                          >
                            Επείγον
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {event.pet} • {event.date} {event.time}
                      </div>
                    </div>
                    <ChevronRight 
                      className="h-4 w-4 text-gray-400 flex-shrink-0" 
                      aria-hidden="true" 
                    />
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
});

UpcomingEventsSection.displayName = 'UpcomingEventsSection';