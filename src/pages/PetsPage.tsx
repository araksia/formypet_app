import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Heart, Calendar, FileText, Stethoscope, Share2, Users, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';

const PetsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading, signOut } = useAuth();
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareEmail, setShareEmail] = useState('');
  const [selectedPetForShare, setSelectedPetForShare] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [copiedPetId, setCopiedPetId] = useState<string | null>(null);

  // Fetch pets when user is available
  useEffect(() => {
    console.log('🚀 PetsPage mounted. AuthLoading:', authLoading, 'User:', user?.id);
    if (!authLoading && user) {
      fetchPets();
    } else if (!authLoading && !user) {
      console.log('❌ No user found after auth loading completed');
      setPets([]);
      setLoading(false);
    }
  }, [authLoading, user]);

  const fetchPets = async () => {
    console.log('🔄 fetchPets started for user:', user?.id);
    setLoading(true);
    
    try {
      if (!user) {
        console.log('❌ No user available');
        setPets([]);
        return;
      }

      console.log('📡 Making direct query to pets table...');
      
      // Simple direct query without complex authentication checks
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📊 Query result - data:', data, 'error:', error);

      if (error) {
        console.error('❌ Database error:', error);
        toast({
          title: "Σφάλμα",
          description: `Σφάλμα βάσης: ${error.message}`,
          variant: "destructive"
        });
        setPets([]);
      } else {
        console.log('✅ Found', data?.length || 0, 'pets total');
        // Filter pets for current user in the frontend for now
        const userPets = data?.filter(pet => pet.owner_id === user.id) || [];
        console.log('✅ User pets:', userPets.length);
        setPets(userPets);
      }
      
    } catch (error: any) {
      console.error('💥 Fetch error:', error);
      toast({
        title: "Σφάλμα",
        description: "Απροσδόκητο σφάλμα κατά τη φόρτωση",
        variant: "destructive"
      });
      setPets([]);
    } finally {
      console.log('🏁 fetchPets completed');
      setLoading(false);
    }
  };

  const refreshAuth = async () => {
    console.log('🔄 Refreshing authentication...');
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('❌ Auth refresh error:', error);
        toast({
          title: "Σφάλμα Authentication",
          description: "Δεν ήταν δυνατή η ανανέωση της συνεδρίας",
          variant: "destructive"
        });
      } else {
        console.log('✅ Auth refreshed successfully');
        toast({
          title: "Επιτυχία",
          description: "Η συνεδρία ανανεώθηκε. Δοκιμάστε ξανά.",
        });
        // Retry fetching pets after auth refresh
        await fetchPets();
      }
    } catch (error: any) {
      console.error('💥 Unexpected error refreshing auth:', error);
    }
  };

  const handleSharePet = async () => {
    if (!shareEmail || !selectedPetForShare || !user) return;

    setShareLoading(true);
    try {
      // Find user by email
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', shareEmail)
        .single();

      if (profileError || !profiles) {
        toast({
          title: "Σφάλμα",
          description: "Δεν βρέθηκε χρήστης με αυτό το email",
          variant: "destructive"
        });
        return;
      }

      // Send invitation
      const { error: inviteError } = await supabase
        .from('pet_family_members')
        .insert({
          pet_id: selectedPetForShare,
          user_id: profiles.user_id,
          invited_by: user.id,
          role: 'caretaker',
          status: 'pending'
        });

      if (inviteError) throw inviteError;

      toast({
        title: "Επιτυχία!",
        description: "Η πρόσκληση στάλθηκε επιτυχώς"
      });

      setShareEmail('');
      setSelectedPetForShare(null);
    } catch (error) {
      console.error('Error sharing pet:', error);
      toast({
        title: "Σφάλμα",
        description: "Υπήρξε πρόβλημα κατά την αποστολή της πρόσκλησης",
        variant: "destructive"
      });
    } finally {
      setShareLoading(false);
    }
  };

  const copyPetId = async (petId: string) => {
    try {
      await navigator.clipboard.writeText(petId);
      setCopiedPetId(petId);
      toast({
        title: "Αντιγράφηκε!",
        description: "Το ID του κατοικιδίου αντιγράφηκε"
      });
      setTimeout(() => setCopiedPetId(null), 2000);
    } catch (error) {
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η αντιγραφή",
        variant: "destructive"
      });
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <Header title="Τα Κατοικίδιά μου" />
        <div className="p-4 flex justify-center items-center h-32">
          <p>Φόρτωση...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <Header title="Τα Κατοικίδιά μου" />
        <div className="p-4 flex justify-center items-center h-32">
          <p>Δεν είστε συνδεδεμένος</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <Header title="Τα Κατοικίδιά μου" />
      
      <div className="p-3 sm:p-4 space-y-4">
        {/* Debug info */}
        <div className="bg-yellow-50 p-2 rounded text-xs">
          <p>Auth Loading: {authLoading ? 'true' : 'false'}</p>
          <p>User ID: {user?.id || 'null'}</p>
          <p>Loading: {loading ? 'true' : 'false'}</p>
          <p>Pets count: {pets.length}</p>
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={fetchPets}>🔄 Reload Pets</Button>
            <Button size="sm" variant="outline" onClick={refreshAuth}>🔑 Refresh Auth</Button>
            <Button size="sm" variant="destructive" onClick={signOut}>🚪 Force Logout</Button>
          </div>
        </div>

        {/* Add Pet Button */}
        <Button 
          onClick={() => navigate('/add-pet')}
          className="w-full h-12 sm:h-14 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          Προσθήκη Νέου Κατοικιδίου
        </Button>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <p>Φόρτωση κατοικιδίων...</p>
          </div>
        )}

        {/* Pets Grid/List */}
        {!loading && pets.length > 0 ? (
          <div className="grid gap-3 sm:gap-4">
            {pets.map((pet) => (
              <Card key={pet.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {/* Pet Image */}
                    <div className="relative flex-shrink-0">
                      {pet.avatar_url ? (
                        <img 
                          src={pet.avatar_url} 
                          alt={pet.name}
                          className="w-full h-32 sm:w-24 sm:h-24 object-cover"
                        />
                      ) : (
                        <div className="w-full h-32 sm:w-24 sm:h-24 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                          <span className="text-3xl sm:text-2xl">{getSpeciesEmoji(pet.species)}</span>
                        </div>
                      )}
                      <Badge 
                        variant="secondary" 
                        className="absolute top-2 left-2 text-xs bg-white/90 backdrop-blur-sm"
                      >
                        {getSpeciesEmoji(pet.species)} {pet.species === 'dog' ? 'Σκύλος' : pet.species === 'cat' ? 'Γάτα' : 'Κατοικίδιο'}
                      </Badge>
                    </div>
                    
                    {/* Pet Info */}
                    <div className="flex-1 p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg sm:text-xl text-gray-900">{pet.name}</h3>
                          {pet.breed && (
                            <p className="text-sm text-muted-foreground font-medium">{pet.breed}</p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {pet.age && (
                              <Badge variant="outline" className="text-xs">
                                {pet.age} {pet.age === 1 ? 'χρόνος' : 'χρόνια'}
                              </Badge>
                            )}
                            {pet.weight && (
                              <Badge variant="outline" className="text-xs">
                                {pet.weight}kg
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-1 sm:flex-col sm:gap-1">
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                              onClick={() => navigate(`/pet/${pet.id}`)}
                              title="Προφίλ κατοικιδίου"
                            >
                              <Heart className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                              onClick={() => navigate('/calendar')}
                              title="Ημερολόγιο"
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 hover:bg-green-50 hover:text-green-600"
                              onClick={() => navigate(`/pet/${pet.id}/medical`)}
                              title="Ιατρικά στοιχεία"
                            >
                              <Stethoscope className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 hover:bg-purple-50 hover:text-purple-600"
                                  onClick={() => setSelectedPetForShare(pet.id)}
                                  title="Μοίρασμα με άλλους"
                                >
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <Share2 className="h-5 w-5" />
                                    Μοίρασμα κατοικιδίου: {pet.name}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">Email χρήστη</label>
                                    <Input
                                      type="email"
                                      placeholder="π.χ. maria@example.com"
                                      value={shareEmail}
                                      onChange={(e) => setShareEmail(e.target.value)}
                                      className="mt-1"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Pet ID (για χειροκίνητη πρόσκληση)</label>
                                    <div className="flex gap-2">
                                      <Input
                                        value={pet.id}
                                        readOnly
                                        className="flex-1 text-xs"
                                      />
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => copyPetId(pet.id)}
                                        className="shrink-0"
                                      >
                                        {copiedPetId === pet.id ? (
                                          <Check className="h-4 w-4" />
                                        ) : (
                                          <Copy className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={handleSharePet}
                                      disabled={!shareEmail || shareLoading}
                                      className="flex-1"
                                    >
                                      {shareLoading ? 'Αποστολή...' : 'Αποστολή Πρόσκλησης'}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 hover:bg-orange-50 hover:text-orange-600"
                              onClick={() => navigate('/add-event')}
                              title="Προσθήκη εκδήλωσης"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !loading && pets.length === 0 ? (
          <Card className="p-8">
            <div className="text-center space-y-4">
              <div className="text-6xl">🐾</div>
              <h3 className="text-lg font-semibold">Δεν έχετε κατοικίδια ακόμα</h3>
              <p className="text-muted-foreground">Προσθέστε το πρώτο σας κατοικίδιο για να ξεκινήσετε!</p>
              <Button onClick={() => navigate('/add-pet')} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Προσθήκη Κατοικιδίου
              </Button>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
};

export default PetsPage;