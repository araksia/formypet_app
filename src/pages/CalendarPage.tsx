
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import { Plus, Pill, Heart, Gift, Scissors, Syringe, Utensils, Activity, Bell, Users, Edit2, Trash2, Check, X } from 'lucide-react';
import { format, isSameDay, isToday, isTomorrow } from 'date-fns';
import { el } from 'date-fns/locale';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';

// Event types για icons και colors
type EventType = {
  id: string;
  title: string;
  event_type: string;
  date: Date;
  petName: string;
  recurring: string;
  notes?: string;
};

interface Notification {
  id: string;
  type: 'family_invite' | 'upcoming_event' | 'past_event' | 'reminder' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: React.ComponentType<{ className?: string }>;
  eventDate?: Date;
}

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
  const [searchParams] = useSearchParams();
  const petIdFilter = searchParams.get('petId');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'notifications'>('calendar');
  const [events, setEvents] = useState<EventType[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPetName, setSelectedPetName] = useState<string>('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
    loadNotifications();
  }, [petIdFilter, user]);

  const fetchEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First get pets for pet names
      const { data: petsData, error: petsError } = await supabase
        .from('pets')
        .select('id, name')
        .eq('owner_id', user.id);

      if (petsError) throw petsError;

      // Create a map of pet ids to names
      const petNamesMap = new Map();
      petsData?.forEach(pet => {
        petNamesMap.set(pet.id, pet.name);
      });

      // If filtering by petId, get the pet name
      if (petIdFilter && petNamesMap.has(petIdFilter)) {
        setSelectedPetName(petNamesMap.get(petIdFilter));
      }

      // Build events query with optional pet filter
      let eventsQuery = supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id);

      // Apply pet filter if provided
      if (petIdFilter) {
        eventsQuery = eventsQuery.eq('pet_id', petIdFilter);
      }

      const { data: eventsData, error: eventsError } = await eventsQuery;

      if (eventsError) throw eventsError;

      const formattedEvents: EventType[] = (eventsData || []).map(event => ({
        id: event.id,
        title: event.title,
        event_type: event.event_type,
        date: new Date(event.event_date),
        petName: petNamesMap.get(event.pet_id) || 'Άγνωστο',
        recurring: event.recurring,
        notes: event.notes
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter events για την επιλεγμένη ημερομηνία
  const selectedDateEvents = selectedDate 
    ? events.filter(event => isSameDay(event.date, selectedDate))
    : [];

  // Get upcoming events (επόμενες 7 ημέρες)
  const upcomingEvents = events
    .filter(event => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const realNotifications: Notification[] = [];

      // Load all events (past, present, future)
      const { data: events } = await supabase
        .from('events')
        .select(`
          id,
          title,
          event_date,
          event_time,
          event_type,
          pet_id
        `)
        .eq('user_id', user.id)
        .order('event_date', { ascending: false });

      if (events && events.length > 0) {
        // Get pet names separately
        const petIds = [...new Set(events.map(e => e.pet_id))];
        const { data: pets } = await supabase
          .from('pets')
          .select('id, name')
          .in('id', petIds);

        const petMap = new Map(pets?.map(p => [p.id, p.name]) || []);

        events.forEach(event => {
          const eventDate = new Date(event.event_date);
          const now = new Date();
          let timeMessage = '';
          let notificationType: 'upcoming_event' | 'past_event' = 'past_event';
          
          if (eventDate >= now) {
            notificationType = 'upcoming_event';
            if (isToday(eventDate)) {
              timeMessage = 'Σήμερα';
            } else if (isTomorrow(eventDate)) {
              timeMessage = 'Αύριο';
            } else {
              timeMessage = format(eventDate, 'dd/MM/yyyy', { locale: el });
            }
          } else {
            timeMessage = format(eventDate, 'dd/MM/yyyy', { locale: el });
          }

          if (event.event_time) {
            timeMessage += ` στις ${event.event_time}`;
          }

          const petName = petMap.get(event.pet_id) || 'κατοικίδιό σας';

          realNotifications.push({
            id: event.id,
            type: notificationType,
            title: `${notificationType === 'upcoming_event' ? 'Επερχόμενο' : 'Παρελθόν'} ${event.event_type}`,
            message: `${event.title} για τον/την ${petName} - ${timeMessage}`,
            time: format(eventDate, 'dd/MM', { locale: el }),
            read: false,
            icon: Heart,
            eventDate
          });
        });
      }

      // Load pending family invites
      const { data: invites } = await supabase
        .from('pet_family_members')
        .select(`
          id,
          role,
          pet_id,
          invited_by
        `)
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if (invites && invites.length > 0) {
        // Get pet and profile names separately
        const petIds = [...new Set(invites.map(i => i.pet_id))];
        const profileIds = [...new Set(invites.map(i => i.invited_by))];
        
        const [petsResult, profilesResult] = await Promise.all([
          supabase.from('pets').select('id, name').in('id', petIds),
          supabase.from('profiles').select('user_id, display_name').in('user_id', profileIds)
        ]);

        const petMap = new Map(petsResult.data?.map(p => [p.id, p.name]) || []);
        const profileMap = new Map(profilesResult.data?.map(p => [p.user_id, p.display_name]) || []);

        invites.forEach(invite => {
          const petName = petMap.get(invite.pet_id) || 'κατοικίδιο';
          const inviterName = profileMap.get(invite.invited_by) || 'Κάποιος';
          
          realNotifications.push({
            id: invite.id,
            type: 'family_invite',
            title: 'Νέα πρόσκληση οικογένειας',
            message: `${inviterName} σας προσκάλεσε ως ${invite.role} για τον/την ${petName}`,
            time: 'Νέα',
            read: false,
            icon: Users
          });
        });
      }

      setNotifications(realNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    }
  };

  const handleEditNotification = async (notification: Notification) => {
    if (notification.type === 'upcoming_event' || notification.type === 'past_event') {
      // Navigate to edit event page
      navigate(`/add-event?edit=${notification.id}`);
    } else if (notification.type === 'family_invite') {
      // Accept the family invitation
      try {
        const { error } = await supabase
          .from('pet_family_members')
          .update({ status: 'accepted' })
          .eq('id', notification.id);

        if (error) throw error;

        toast({
          title: "Επιτυχία",
          description: "Αποδεχτήκατε την πρόσκληση επιτυχώς"
        });
        
        loadNotifications(); // Reload notifications
      } catch (error) {
        console.error('Error accepting invitation:', error);
        toast({
          title: "Σφάλμα",
          description: "Υπήρξε πρόβλημα κατά την αποδοχή της πρόσκλησης",
          variant: "destructive"
        });
      }
    }
  };

  const handleDeleteNotification = async (notification: Notification) => {
    try {
      if (notification.type === 'upcoming_event' || notification.type === 'past_event') {
        // Delete the event
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', notification.id);

        if (error) throw error;

        toast({
          title: "Επιτυχία",
          description: "Η εκδήλωση διαγράφηκε επιτυχώς"
        });
        
        // Refresh both events and notifications
        fetchEvents();
        loadNotifications();
      } else if (notification.type === 'family_invite') {
        // Decline/delete the family invitation
        const { error } = await supabase
          .from('pet_family_members')
          .delete()
          .eq('id', notification.id);

        if (error) throw error;

        toast({
          title: "Επιτυχία",
          description: "Η πρόσκληση απορρίφθηκε επιτυχώς"
        });
        
        loadNotifications(); // Reload notifications
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Σφάλμα",
        description: "Υπήρξε πρόβλημα κατά τη διαγραφή",
        variant: "destructive"
      });
    }
  };

  const getNotificationBadgeColor = (type: Notification['type']) => {
    switch (type) {
      case 'family_invite': return 'bg-blue-500';
      case 'upcoming_event': return 'bg-orange-500';
      case 'past_event': return 'bg-gray-500';
      case 'reminder': return 'bg-red-500';
      case 'system': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const renderEventIcon = (type: string) => {
    const IconComponent = eventTypeIcons[type as keyof typeof eventTypeIcons] || Heart;
    return <IconComponent className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <Header title="Ημερολόγιο" />
        <div className="p-4 flex justify-center items-center h-32">
          <p>Φόρτωση...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <Header title={petIdFilter ? `Ημερολόγιο - ${selectedPetName}` : "Ημερολόγιο"} />
      
      <div className="p-4 space-y-6">
        {/* Tabs */}
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'calendar' | 'list' | 'notifications')}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calendar">Ημερολόγιο</TabsTrigger>
            <TabsTrigger value="list">Λίστα</TabsTrigger>
            <TabsTrigger value="notifications">Ειδοποιήσεις</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
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
                    hasEvent: events.map(event => event.date)
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
                          <div className={`p-2 rounded-full ${eventTypeColors[event.event_type as keyof typeof eventTypeColors]} text-white`}>
                            {renderEventIcon(event.event_type)}
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
          </TabsContent>

          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Επερχόμενα Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingEvents.map(event => (
                    <div key={event.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className={`p-2 rounded-full ${eventTypeColors[event.event_type as keyof typeof eventTypeColors]} text-white`}>
                        {renderEventIcon(event.event_type)}
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
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Όλες οι Ειδοποιήσεις
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    Δεν υπάρχουν ειδοποιήσεις
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => {
                      const IconComponent = notification.icon;
                      return (
                        <div
                          key={notification.id}
                          className="flex gap-3 p-4 bg-muted rounded-lg"
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getNotificationBadgeColor(notification.type)}`}>
                            <IconComponent className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-sm leading-tight">{notification.title}</h4>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600"
                                  onClick={() => handleEditNotification(notification)}
                                  title={notification.type === 'family_invite' ? 'Αποδοχή' : 'Επεξεργασία'}
                                >
                                  {notification.type === 'family_invite' ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <Edit2 className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                                  onClick={() => handleDeleteNotification(notification)}
                                  title={notification.type === 'family_invite' ? 'Απόρριψη' : 'Διαγραφή'}
                                >
                                  {notification.type === 'family_invite' ? (
                                    <X className="h-4 w-4" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
