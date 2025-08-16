import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Pill, Syringe, Heart, Scissors, Gift, Utensils, Activity } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const eventTypes = [
  { value: 'medication', label: '💊 Φάρμακο', icon: Pill, color: 'bg-blue-500' },
  { value: 'vaccination', label: '💉 Εμβόλιο', icon: Syringe, color: 'bg-green-500' },
  { value: 'checkup', label: '❤️ Εξέταση', icon: Heart, color: 'bg-red-500' },
  { value: 'grooming', label: '✂️ Grooming', icon: Scissors, color: 'bg-purple-500' },
  { value: 'birthday', label: '🎁 Γενέθλια', icon: Gift, color: 'bg-pink-500' },
  { value: 'feeding', label: '🍽️ Φαγητό', icon: Utensils, color: 'bg-orange-500' },
  { value: 'exercise', label: '🏃 Άσκηση', icon: Activity, color: 'bg-emerald-500' },
  { value: 'period', label: '🌸 Περίοδος', icon: Heart, color: 'bg-rose-500' },
];

const AddEventPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const editEventId = searchParams.get('edit');
  const isEditMode = !!editEventId;
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [eventType, setEventType] = useState('');
  const [petId, setPetId] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [recurring, setRecurring] = useState('none');
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserPets();
    if (isEditMode && editEventId) {
      loadEventData(editEventId);
    }
  }, [isEditMode, editEventId]);

  const loadEventData = async (eventId: string) => {
    try {
      const { data: event, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;

      if (event) {
        setTitle(event.title);
        setEventType(event.event_type);
        setPetId(event.pet_id);
        setRecurring(event.recurring || 'none');
        setNotes(event.notes || '');
        
        // Parse the stored UTC date and time back to local
        const eventDate = new Date(event.event_date);
        setSelectedDate(eventDate);
        
        // Convert UTC time back to local time for display
        if (event.event_time) {
          const [hours, minutes] = event.event_time.split(':');
          const utcDate = new Date();
          utcDate.setUTCHours(parseInt(hours), parseInt(minutes), 0, 0);
          const localTime = format(utcDate, 'HH:mm');
          setSelectedTime(localTime);
        }
      }
    } catch (error) {
      console.error('Error loading event data:', error);
      toast({
        title: "Σφάλμα",
        description: "Δεν μπόρεσα να φορτώσω τα δεδομένα του event",
        variant: "destructive"
      });
    }
  };

  const fetchUserPets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('pets')
        .select('id, name, species')
        .eq('owner_id', user.id);

      if (error) throw error;
      setPets(data || []);
    } catch (error) {
      console.error('Error fetching pets:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !eventType || !petId || !title) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ συμπληρώστε όλα τα απαραίτητα πεδία",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Create the event date properly for Greek timezone
      // The selectedDate is in local time, selectedTime is local time
      const eventDate = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      
      // Set the time in local timezone first
      eventDate.setHours(hours, minutes, 0, 0);
      
      // Convert to UTC for storage
      const eventDateUTC = new Date(eventDate.getTime());
      
      // Store the time as UTC time components for the scheduler
      const utcHours = eventDateUTC.getUTCHours();
      const utcMinutes = eventDateUTC.getUTCMinutes();
      const eventTimeUTC = `${utcHours.toString().padStart(2, '0')}:${utcMinutes.toString().padStart(2, '0')}:00`;

      console.log('Event creation:', {
        localDateTime: eventDate.toLocaleString('el-GR'),
        utcDateTime: eventDateUTC.toISOString(),
        eventTimeUTC
      });

      if (isEditMode && editEventId) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update({
            title,
            event_type: eventType,
            pet_id: petId,
            event_date: eventDateUTC.toISOString(),
            event_time: eventTimeUTC,
            recurring,
            notes: notes || null
          })
          .eq('id', editEventId);

        if (error) throw error;

        toast({
          title: "Επιτυχία!",
          description: "Το event ενημερώθηκε επιτυχώς"
        });
      } else {
        // Create new event
        const { error } = await supabase
          .from('events')
          .insert({
            title,
            event_type: eventType,
            pet_id: petId,
            user_id: user.id,
            event_date: eventDateUTC.toISOString(),
            event_time: eventTimeUTC,
            recurring,
            notes: notes || null
          });

        if (error) throw error;

        toast({
          title: "Επιτυχία!",
          description: "Το event προστέθηκε επιτυχώς"
        });
      }

      navigate('/calendar');
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Σφάλμα",
        description: "Υπήρξε πρόβλημα κατά την αποθήκευση του event",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <Header title={isEditMode ? "Επεξεργασία Event" : "Προσθήκη Event"} showNotifications={false} />
      
      <div className="p-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4 p-0 h-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Πίσω
        </Button>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Type */}
          <Card>
            <CardHeader>
              <CardTitle>Τύπος Event</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={eventType} onValueChange={setEventType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Επίλεξε τύπο event" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Pet Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Κατοικίδιο</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={petId} onValueChange={setPetId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Επίλεξε κατοικίδιο" />
                </SelectTrigger>
                <SelectContent>
                  {pets.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id}>
                      {pet.name} ({pet.species})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>Λεπτομέρειες</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Τίτλος</Label>
                <Input 
                  id="title" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="π.χ. Εμβόλιο κορόνας" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ημερομηνία</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP", { locale: el }) : "Επίλεξε ημερομηνία"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        locale={el}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="time">Ώρα</Label>
                  <Input 
                    id="time" 
                    type="time" 
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="recurring">Επανάληψη</Label>
                <Select value={recurring} onValueChange={setRecurring}>
                  <SelectTrigger>
                    <SelectValue placeholder="Χωρίς επανάληψη" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Χωρίς επανάληψη</SelectItem>
                    <SelectItem value="daily">Καθημερινά</SelectItem>
                    <SelectItem value="weekly">Εβδομαδιαία</SelectItem>
                    <SelectItem value="monthly">Μηνιαία</SelectItem>
                    <SelectItem value="6months">6 μήνες</SelectItem>
                    <SelectItem value="yearly">Ετήσια</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Σημειώσεις</Label>
                <Textarea 
                  id="notes" 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Προαιρετικές σημειώσεις..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button type="submit" className="w-full h-12" disabled={loading}>
            {loading ? 'Αποθήκευση...' : (isEditMode ? 'Ενημέρωση Event' : 'Αποθήκευση Event')}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddEventPage;