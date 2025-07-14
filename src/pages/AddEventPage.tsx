import React, { useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Pill, Syringe, Heart, Scissors, Gift, Utensils, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

const eventTypes = [
  { value: 'medication', label: '💊 Φάρμακο', icon: Pill, color: 'bg-blue-500' },
  { value: 'vaccination', label: '💉 Εμβόλιο', icon: Syringe, color: 'bg-green-500' },
  { value: 'checkup', label: '❤️ Εξέταση', icon: Heart, color: 'bg-red-500' },
  { value: 'grooming', label: '✂️ Grooming', icon: Scissors, color: 'bg-purple-500' },
  { value: 'birthday', label: '🎁 Γενέθλια', icon: Gift, color: 'bg-pink-500' },
  { value: 'feeding', label: '🍽️ Φαγητό', icon: Utensils, color: 'bg-orange-500' },
  { value: 'exercise', label: '🏃 Άσκηση', icon: Activity, color: 'bg-emerald-500' },
];

const mockPets = [
  { id: 1, name: 'Μπάρμπι', type: 'Σκύλος' },
  { id: 2, name: 'Ρεξ', type: 'Σκύλος' },
  { id: 3, name: 'Μάξι', type: 'Γάτα' },
];

const AddEventPage = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [eventType, setEventType] = useState('');
  const [petId, setPetId] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [recurring, setRecurring] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Event added successfully');
    navigate('/calendar');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Προσθήκη Event" showNotifications={false} />
      
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
                  {mockPets.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id.toString()}>
                      {pet.name} ({pet.type})
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
                    <SelectItem value="">Χωρίς επανάληψη</SelectItem>
                    <SelectItem value="daily">Καθημερινά</SelectItem>
                    <SelectItem value="weekly">Εβδομαδιαία</SelectItem>
                    <SelectItem value="monthly">Μηνιαία</SelectItem>
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
          <Button type="submit" className="w-full h-12">
            Αποθήκευση Event
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddEventPage;