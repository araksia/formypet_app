import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Stethoscope, Euro, Edit, Share2, PawPrint, Heart, Weight, Clock, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';

const PetProfilePage = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);

  useEffect(() => {
    if (petId && user) {
      fetchPetData();
    }
  }, [petId, user]);

  const fetchPetData = async () => {
    if (!petId || !user) return;

    setLoading(true);
    try {
      console.log('🔍 Fetching pet data for ID:', petId, 'User:', user.id);
      
      // Fetch pet details
      const { data: petData, error: petError } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single();

      console.log('🐕 Pet data result:', { petData, petError });

      if (petError) {
        console.error('Pet error:', petError);
        throw petError;
      }

      if (!petData) {
        throw new Error('Το κατοικίδιο δεν βρέθηκε');
      }

      // Check if user has access to this pet
      const isOwner = petData.owner_id === user.id;
      if (!isOwner) {
        // Check if user is a family member
        const { data: familyMember } = await supabase
          .from('pet_family_members')
          .select('*')
          .eq('pet_id', petId)
          .eq('user_id', user.id)
          .eq('status', 'accepted')
          .maybeSingle();

        if (!familyMember) {
          toast({
            title: "Μη εξουσιοδοτημένη πρόσβαση",
            description: "Δεν έχετε πρόσβαση σε αυτό το κατοικίδιο",
            variant: "destructive"
          });
          navigate('/pets');
          return;
        }
      }

      console.log('✅ Pet access granted, setting pet data');
      setPet(petData);

      // Fetch recent events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('pet_id', petId)
        .order('event_date', { ascending: false })
        .limit(3);

      console.log('📅 Events data:', eventsData);
      setRecentEvents(eventsData || []);

      // Fetch recent expenses
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .eq('pet_id', petId)
        .order('expense_date', { ascending: false })
        .limit(3);

      console.log('💰 Expenses data:', expensesData);
      setRecentExpenses(expensesData || []);

    } catch (error: any) {
      console.error('💥 Error fetching pet data:', error);
      toast({
        title: "Σφάλμα",
        description: error.message || "Δεν ήταν δυνατή η φόρτωση των στοιχείων",
        variant: "destructive"
      });
      // Don't navigate away, just show error
    } finally {
      setLoading(false);
    }
  };

  const getSpeciesEmoji = (species: string) => {
    const emojiMap: { [key: string]: string } = {
      'dog': '🐕',
      'cat': '🐱', 
      'rabbit': '🐰',
      'bird': '🐦',
      'fish': '🐠',
      'hamster': '🐹',
      'guinea-pig': '🐹',
      'reptile': '🦎',
      'other': '🐾'
    };
    return emojiMap[species] || '🐾';
  };

  const getSpeciesDisplayName = (species: string) => {
    const nameMap: { [key: string]: string } = {
      'dog': 'Σκύλος',
      'cat': 'Γάτα',
      'rabbit': 'Κουνέλι',
      'bird': 'Πουλί',
      'fish': 'Ψάρι',
      'hamster': 'Χάμστερ',
      'guinea-pig': 'Ινδικό Χοιρίδιο',
      'reptile': 'Ερπετό',
      'other': 'Άλλο'
    };
    return nameMap[species] || species;
  };

  const getEventTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'medication': 'Φάρμακο',
      'vaccination': 'Εμβόλιο',
      'checkup': 'Εξέταση',
      'grooming': 'Grooming',
      'birthday': 'Γενέθλια',
      'feeding': 'Φαγητό',
      'exercise': 'Άσκηση'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <Header title="Προφίλ Κατοικιδίου" />
        <div className="p-4 flex justify-center items-center h-32">
          <p>Φόρτωση...</p>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <Header title="Προφίλ Κατοικιδίου" />
        <div className="p-4 flex justify-center items-center h-32">
          <p>Το κατοικίδιο δεν βρέθηκε</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <Header title={pet.name} />
      
      <div className="p-4 space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/pets')}
          className="mb-4 p-0 h-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Πίσω στα Κατοικίδια
        </Button>

        {/* Pet Profile Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              {/* Cover Image / Color */}
              <div className="h-32 bg-gradient-to-r from-primary to-primary/80 relative">
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{getSpeciesEmoji(pet.species)}</span>
                    <div>
                      <h1 className="text-2xl font-bold">{pet.name}</h1>
                      <p className="text-sm opacity-90">{getSpeciesDisplayName(pet.species)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pet Avatar */}
              <div className="relative -mt-16 ml-4 mb-4">
                <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                  {pet.avatar_url ? (
                    <img 
                      src={pet.avatar_url} 
                      alt={pet.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <span className="text-2xl">{getSpeciesEmoji(pet.species)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Pet Details */}
              <div className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {pet.breed && (
                    <div className="flex items-center gap-2">
                      <PawPrint className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Ράτσα</p>
                        <p className="text-sm font-medium">{pet.breed}</p>
                      </div>
                    </div>
                  )}
                  {pet.age && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Ηλικία</p>
                        <p className="text-sm font-medium">{pet.age} {pet.age === 1 ? 'χρόνος' : 'χρόνια'}</p>
                      </div>
                    </div>
                  )}
                  {pet.weight && (
                    <div className="flex items-center gap-2">
                      <Weight className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Βάρος</p>
                        <p className="text-sm font-medium">{pet.weight}kg</p>
                      </div>
                    </div>
                  )}
                  {pet.gender && (
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Φύλο</p>
                        <p className="text-sm font-medium">{pet.gender === 'male' ? 'Αρσενικό' : 'Θηλυκό'}</p>
                      </div>
                    </div>
                  )}
                </div>

                {pet.description && (
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-1">Σημειώσεις</p>
                    <p className="text-sm text-gray-700">{pet.description}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/calendar?petId=${pet.id}`)}
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Ημερολόγιο
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/pet/${pet.id}/medical`)}
                    className="flex items-center gap-2"
                  >
                    <Stethoscope className="h-4 w-4" />
                    Ιατρικά
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/expenses')}
                    className="flex items-center gap-2"
                  >
                    <Euro className="h-4 w-4" />
                    Έξοδα
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">Πρόσφατα Events</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(`/calendar?petId=${pet.id}`)}
            >
              Όλα
            </Button>
          </CardHeader>
          <CardContent>
            {recentEvents.length > 0 ? (
              <div className="space-y-3">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {getEventTypeLabel(event.event_type)} • {format(new Date(event.event_date), 'dd MMM yyyy', { locale: el })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Δεν υπάρχουν πρόσφατα events
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">Πρόσφατα Έξοδα</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/expenses')}
            >
              Όλα
            </Button>
          </CardHeader>
          <CardContent>
            {recentExpenses.length > 0 ? (
              <div className="space-y-3">
                {recentExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Euro className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{expense.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {expense.category} • {format(new Date(expense.expense_date), 'dd MMM yyyy', { locale: el })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">€{expense.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Δεν υπάρχουν πρόσφατα έξοδα
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Γρήγορες Ενέργειες</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/add-event')}
                className="h-12 flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Νέο Event
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/add-expense')}
                className="h-12 flex items-center gap-2"
              >
                <Euro className="h-4 w-4" />
                Νέο Έξοδο
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PetProfilePage;