
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import { Plus, Pill, Heart, Gift, Scissors, Syringe, Utensils, Activity } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { el } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

// Mock data για events
const mockEvents = [
  {
    id: 1,
    title: 'Φάρμακο Σκύλου',
    type: 'medication',
    date: new Date(2024, 11, 15),
    petName: 'Μπάτμαν',
    recurring: 'daily'
  },
  {
    id: 2,
    title: 'Εμβόλιο Γάτας',
    type: 'vaccination',
    date: new Date(2024, 11, 20),
    petName: 'Λούνα',
    recurring: 'yearly'
  },
  {
    id: 3,
    title: 'Γενέθλια',
    type: 'birthday',
    date: new Date(2024, 11, 18),
    petName: 'Μπάτμαν',
    recurring: 'yearly'
  },
  {
    id: 4,
    title: 'Grooming',
    type: 'grooming',
    date: new Date(2024, 11, 22),
    petName: 'Λούνα',
    recurring: 'monthly'
  }
];

const eventTypeIcons = {
  medication: Pill,
  vaccination: Syringe,
  birthday: Gift,
  grooming: Scissors,
  checkup: Heart
};

const eventTypeColors = {
  medication: 'bg-blue-500',
  vaccination: 'bg-green-500',
  birthday: 'bg-pink-500',
  grooming: 'bg-purple-500',
  checkup: 'bg-red-500'
};

const CalendarPage = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Filter events για την επιλεγμένη ημερομηνία
  const selectedDateEvents = selectedDate 
    ? mockEvents.filter(event => isSameDay(event.date, selectedDate))
    : [];

  // Get upcoming events (επόμενες 7 ημέρες)
  const upcomingEvents = mockEvents
    .filter(event => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  const renderEventIcon = (type: string) => {
    const IconComponent = eventTypeIcons[type as keyof typeof eventTypeIcons] || Heart;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <Header title="Ημερολόγιο" />
      
      <div className="p-4 space-y-6">
        {/* View Toggle */}
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            onClick={() => setViewMode('calendar')}
            className="flex-1"
          >
            Ημερολόγιο
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
            className="flex-1"
          >
            Λίστα
          </Button>
        </div>

        {viewMode === 'calendar' ? (
          <>
            {/* Calendar */}
            <Card>
              <CardContent className="p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={el}
                  className="w-full"
                  modifiers={{
                    hasEvent: mockEvents.map(event => event.date)
                  }}
                  modifiersStyles={{
                    hasEvent: { 
                      backgroundColor: 'hsl(var(--primary))',
                      color: 'hsl(var(--primary-foreground))',
                      borderRadius: '50%'
                    }
                  }}
                />
              </CardContent>
            </Card>

            {/* Events για επιλεγμένη ημερομηνία */}
            {selectedDate && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Events για {format(selectedDate, 'dd MMMM yyyy', { locale: el })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDateEvents.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDateEvents.map(event => (
                        <div key={event.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                          <div className={`p-2 rounded-full ${eventTypeColors[event.type as keyof typeof eventTypeColors]} text-white`}>
                            {renderEventIcon(event.type)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-muted-foreground">{event.petName}</p>
                          </div>
                          <Badge variant="secondary">
                            {event.recurring === 'daily' && 'Καθημερινά'}
                            {event.recurring === 'weekly' && 'Εβδομαδιαία'}
                            {event.recurring === 'monthly' && 'Μηνιαία'}
                            {event.recurring === 'yearly' && 'Ετήσια'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      Δεν υπάρχουν events για αυτή την ημερομηνία
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          /* List View */
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Επερχόμενα Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className={`p-2 rounded-full ${eventTypeColors[event.type as keyof typeof eventTypeColors]} text-white`}>
                      {renderEventIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.petName}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(event.date, 'dd MMMM yyyy', { locale: el })}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {event.recurring === 'daily' && 'Καθημερινά'}
                      {event.recurring === 'weekly' && 'Εβδομαδιαία'}
                      {event.recurring === 'monthly' && 'Μηνιαία'}
                      {event.recurring === 'yearly' && 'Ετήσια'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Add Event Button */}
        <div className="fixed bottom-20 right-4">
          <Button 
            className="h-14 w-14 rounded-full shadow-lg"
            onClick={() => navigate('/add-event')}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
