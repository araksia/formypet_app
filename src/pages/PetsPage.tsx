import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Plus, Stethoscope, Copy, Check, Info, Edit, Trash2 } from 'lucide-react';
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [petToDelete, setPetToDelete] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch pets when user is available
  useEffect(() => {
    if (!authLoading && user) {
      fetchPets();
    } else if (!authLoading && !user) {
      setPets([]);
      setLoading(false);
    }
  }, [authLoading, user]);

  const fetchPets = async () => {
    if (!user) {
      setPets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      // Query with timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const query = supabase
        .from('pets')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .abortSignal(controller.signal);

      const { data, error } = await query;
      
      clearTimeout(timeoutId);

      if (error) {
        throw error;
      }

      setPets(data || []);
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast({
          title: "Timeout",
          description: "Η φόρτωση πήρε πολύ ώρα. Δοκιμάστε ξανά.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Σφάλμα",
          description: error.message || "Σφάλμα κατά τη φόρτωση",
          variant: "destructive"
        });
      }
      setPets([]);
    } finally {
      setLoading(false);
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

  const handleDeletePet = async () => {
    if (!petToDelete || !user) return;

    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', petToDelete.id)
        .eq('owner_id', user.id);

      if (error) throw error;

      toast({
        title: "Επιτυχία!",
        description: "Το κατοικίδιο διαγράφηκε"
      });

      // Refresh pets list
      await fetchPets();
      
      // Close dialog
      setDeleteDialogOpen(false);
      setPetToDelete(null);
    } catch (error) {
      console.error('Error deleting pet:', error);
      toast({
        title: "Σφάλμα",
        description: "Υπήρξε πρόβλημα κατά τη διαγραφή",
        variant: "destructive"
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const openDeleteDialog = (pet: any) => {
    setPetToDelete(pet);
    setDeleteDialogOpen(true);
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
                  <div className="flex flex-col sm:flex-row h-full">
                    {/* Pet Image */}
                    <div className="relative flex-shrink-0">
                      {pet.avatar_url ? (
                        <img 
                          src={pet.avatar_url} 
                          alt={pet.name}
                          className="w-full h-32 sm:w-24 sm:h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-32 sm:w-24 sm:h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
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
                              className="h-8 w-8 hover:bg-green-50 hover:text-green-600"
                              onClick={() => navigate(`/pet/${pet.id}?edit=true`)}
                              title="Επεξεργασία κατοικιδίου"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                              onClick={() => openDeleteDialog(pet)}
                              title="Διαγραφή κατοικιδίου"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 hover:bg-purple-50 hover:text-purple-600"
                              onClick={() => navigate(`/pet/${pet.id}/medical`)}
                              title="Ιατρικά στοιχεία"
                            >
                              <Stethoscope className="h-4 w-4" />
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Διαγραφή Κατοικιδίου</DialogTitle>
            <DialogDescription>
              Είστε σίγουροι ότι θέλετε να διαγράψετε το κατοικίδιο <strong>{petToDelete?.name}</strong>;
              <br /><br />
              Αυτή η ενέργεια δεν μπορεί να αναιρεθεί και θα διαγράψει όλα τα σχετικά δεδομένα.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteLoading}
            >
              Άκυρο
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePet}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Διαγραφή...' : 'Διαγραφή'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PetsPage;