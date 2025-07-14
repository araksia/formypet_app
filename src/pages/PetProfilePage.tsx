import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Heart, FileText, Edit, Pill, Syringe, Gift, Scissors, Stethoscope } from 'lucide-react';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';

const mockPetData = {
  1: {
    id: 1,
    name: 'Μπάρμπι',
    type: 'Σκύλος',
    breed: 'Golden Retriever',
    age: '3 χρόνια',
    weight: '25.5 kg',
    gender: 'Θηλυκό',
    birthdate: '2021-03-15',
    microchip: '123456789012345',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop',
    notes: 'Πολύ φιλική και παιχνιδιάρα. Της αρέσουν οι μπάλες.',
    recentEvents: [
      { id: 1, title: 'Εμβόλιο κορόνας', type: 'vaccination', date: new Date(2024, 10, 15) },
      { id: 2, title: 'Φάρμακο για σκουλήκια', type: 'medication', date: new Date(2024, 11, 1) },
      { id: 3, title: 'Γενέθλια', type: 'birthday', date: new Date(2024, 2, 15) },
    ],
    upcomingEvents: [
      { id: 4, title: 'Εμβόλιο λύσσας', type: 'vaccination', date: new Date(2024, 11, 25) },
      { id: 5, title: 'Grooming', type: 'grooming', date: new Date(2024, 11, 30) },
    ]
  }
};

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

const PetProfilePage = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  
  const pet = petId ? mockPetData[parseInt(petId) as keyof typeof mockPetData] : undefined;

  if (!pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <Header title="Κατοικίδιο δεν βρέθηκε" />
        <div className="p-4 text-center">
          <p>Το κατοικίδιο δεν βρέθηκε.</p>
          <Button onClick={() => navigate('/pets')} className="mt-4">
            Επιστροφή στα κατοικίδια
          </Button>
        </div>
      </div>
    );
  }

  const renderEventIcon = (type: string) => {
    const IconComponent = eventTypeIcons[type as keyof typeof eventTypeIcons] || Heart;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <Header title={pet.name} showNotifications={false} />
      
      <div className="p-4 space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4 p-0 h-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Πίσω
        </Button>

        {/* Pet Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <img 
                src={pet.image} 
                alt={pet.name}
                className="w-32 h-32 rounded-full object-cover"
              />
              <div>
                <h1 className="text-2xl font-bold">{pet.name}</h1>
                <p className="text-muted-foreground">{pet.breed}</p>
                <Badge variant="secondary" className="mt-2">{pet.type}</Badge>
              </div>
              <Button variant="outline" className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                Επεξεργασία
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pet Details */}
        <Card>
          <CardHeader>
            <CardTitle>Στοιχεία</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Ηλικία</p>
                <p className="font-medium">{pet.age}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Βάρος</p>
                <p className="font-medium">{pet.weight}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Φύλο</p>
                <p className="font-medium">{pet.gender}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Γέννηση</p>
                <p className="font-medium">{format(new Date(pet.birthdate), 'dd/MM/yyyy', { locale: el })}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Microchip</p>
              <p className="font-medium font-mono text-xs">{pet.microchip}</p>
            </div>
            {pet.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Σημειώσεις</p>
                <p className="text-sm">{pet.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2"
            onClick={() => navigate('/calendar')}
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs">Ημερολόγιο</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2"
            onClick={() => navigate('/add-event')}
          >
            <Heart className="h-5 w-5" />
            <span className="text-xs">Νέο Event</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2"
            onClick={() => navigate(`/pet/${petId}/medical`)}
          >
            <Stethoscope className="h-5 w-5" />
            <span className="text-xs">Ιατρικός Φάκελος</span>
          </Button>
        </div>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>Πρόσφατα Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pet.recentEvents.map(event => (
                <div key={event.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className={`p-2 rounded-full ${eventTypeColors[event.type as keyof typeof eventTypeColors]} text-white`}>
                    {renderEventIcon(event.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(event.date, 'dd MMM yyyy', { locale: el })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Επερχόμενα Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pet.upcomingEvents.map(event => (
                <div key={event.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className={`p-2 rounded-full ${eventTypeColors[event.type as keyof typeof eventTypeColors]} text-white`}>
                    {renderEventIcon(event.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(event.date, 'dd MMM yyyy', { locale: el })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PetProfilePage;