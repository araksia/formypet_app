import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, Calendar, Stethoscope, Euro, Edit, Share2, PawPrint, Heart, Weight, Clock, MapPin, Camera, Upload, CalendarIcon, TrendingUp, Flame } from 'lucide-react';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';
import { format, differenceInYears } from 'date-fns';
import { el } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { HappinessMeter } from '@/components/gamification/HappinessMeter';
import { StreakDisplay } from '@/components/gamification/StreakDisplay';
import { useGamification } from '@/hooks/useGamification';

const PetProfilePage = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editImage, setEditImage] = useState<string>('');
  const [happiness, setHappiness] = useState<number>(50);
  const [streaks, setStreaks] = useState<any[]>([]);
  const { getPetHappiness, getPetStreaks } = useGamification();
  const [editFormData, setEditFormData] = useState({
    name: '',
    species: '',
    breed: '',
    gender: '',
    birthDate: null as Date | null,
    weight: '',
    description: ''
  });

  useEffect(() => {
    if (petId && user) {
      fetchPetData();
      loadGamificationData();
    }
  }, [petId, user]);

  const loadGamificationData = async () => {
    if (!petId) return;
    
    try {
      const [happinessScore, petStreaks] = await Promise.all([
        getPetHappiness(petId),
        getPetStreaks(petId)
      ]);
      
      setHappiness(happinessScore);
      setStreaks(petStreaks);
    } catch (error) {
      console.error('Error loading gamification data:', error);
    }
  };

  // Check for edit query parameter and open edit dialog when pet data is loaded
  useEffect(() => {
    if (pet && searchParams.get('edit') === 'true') {
      openEditDialog();
      // Remove the edit parameter from URL
      navigate(`/pet/${petId}`, { replace: true });
    }
  }, [pet, searchParams]);

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

  // Helper function to calculate age from birth date
  const calculateAge = (birthDate: Date | string | null): number | null => {
    if (!birthDate) return null;
    try {
      const birth = new Date(birthDate);
      return differenceInYears(new Date(), birth);
    } catch {
      return null;
    }
  };

  const openEditDialog = () => {
    if (pet) {
      setEditFormData({
        name: pet.name || '',
        species: pet.species || '',
        breed: pet.breed || '',
        gender: pet.gender || '',
        birthDate: pet.birth_date ? new Date(pet.birth_date) : null,
        weight: pet.weight?.toString() || '',
        description: pet.description || ''
      });
      setEditImage(pet.avatar_url || '');
      setEditDialogOpen(true);
    }
  };

  const handleEditInputChange = (field: string, value: string | Date | null) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditImageCapture = async () => {
    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image.dataUrl) {
        setEditImage(image.dataUrl);
        toast({
          title: "📷 Φωτογραφία τραβήχτηκε!",
          description: "Η φωτογραφία προστέθηκε επιτυχώς",
        });
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: "❌ Σφάλμα κάμερας",
        description: "Δεν ήταν δυνατή η χρήση της κάμερας",
        variant: "destructive"
      });
    }
  };

  const handleEditImageUpload = async () => {
    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      if (image.dataUrl) {
        setEditImage(image.dataUrl);
        toast({
          title: "🖼️ Φωτογραφία επιλέχθηκε!",
          description: "Η φωτογραφία προστέθηκε επιτυχώς",
        });
      }
    } catch (error) {
      console.error('Photo picker error:', error);
      toast({
        title: "❌ Σφάλμα επιλογής φωτογραφίας",
        description: "Δεν ήταν δυνατή η επιλογή φωτογραφίας",
        variant: "destructive"
      });
    }
  };

  const uploadImageToSupabase = async (dataUrl: string): Promise<string | null> => {
    try {
      if (!user) return null;

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // Generate unique filename
      const fileName = `${user.id}/${Date.now()}_pet_image.jpg`;
      
      const { data, error } = await supabase.storage
        .from('pet-images')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('pet-images')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editFormData.name || !editFormData.species) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ συμπληρώστε τα υποχρεωτικά πεδία (Όνομα και Είδος)",
        variant: "destructive"
      });
      return;
    }

    setEditLoading(true);
    
    try {
      if (!user || !pet) {
        throw new Error('Δεν είστε συνδεδεμένος ή δεν βρέθηκε το κατοικίδιο.');
      }

      // Upload new image if changed
      let avatarUrl = pet.avatar_url;
      if (editImage && editImage !== pet.avatar_url) {
        const uploadedUrl = await uploadImageToSupabase(editImage);
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }

      const updateData = {
        name: editFormData.name,
        species: editFormData.species,
        breed: editFormData.breed || null,
        gender: editFormData.gender || null,
        birth_date: editFormData.birthDate ? editFormData.birthDate.toISOString().split('T')[0] : null,
        weight: editFormData.weight ? parseFloat(editFormData.weight) : null,
        description: editFormData.description || null,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('pets')
        .update(updateData)
        .eq('id', pet.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Pet updated successfully:', data);

      // Update local pet state
      setPet(data);
      
      toast({
        title: "🎉 Επιτυχία!",
        description: `Το κατοικίδιο "${editFormData.name}" ενημερώθηκε επιτυχώς!`,
        duration: 4000
      });

      setEditDialogOpen(false);

    } catch (error: any) {
      console.error('Error updating pet:', error);
      toast({
        title: "❌ Σφάλμα",
        description: error.message || "Υπήρξε πρόβλημα κατά την ενημέρωση του κατοικιδίου",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setEditLoading(false);
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
                  {(pet.birth_date || pet.age) && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Ηλικία</p>
                        <p className="text-sm font-medium">
                          {pet.birth_date ? calculateAge(pet.birth_date) : pet.age} {(pet.birth_date ? calculateAge(pet.birth_date) : pet.age) === 1 ? 'χρόνος' : 'χρόνια'}
                        </p>
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
                <div className="grid grid-cols-4 gap-2">
                  <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={openEditDialog}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Επεξεργασία
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Επεξεργασία {pet.name}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleEditSubmit} className="space-y-4">
                        {/* Photo Section */}
                        <div className="space-y-3">
                          <Label>Φωτογραφία</Label>
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                              {editImage ? (
                                <img src={editImage} alt="Pet" className="w-full h-full object-cover" />
                              ) : (
                                <Camera className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 w-full">
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={handleEditImageCapture}
                              >
                                <Camera className="h-4 w-4 mr-2" />
                                Κάμερα
                              </Button>
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={handleEditImageUpload}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Γκαλερί
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="edit-name">Όνομα *</Label>
                            <Input 
                              id="edit-name" 
                              value={editFormData.name}
                              onChange={(e) => handleEditInputChange('name', e.target.value)}
                              required 
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-species">Είδος *</Label>
                            <Select value={editFormData.species} onValueChange={(value) => handleEditInputChange('species', value)} required>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="dog">🐕 Σκύλος</SelectItem>
                                <SelectItem value="cat">🐱 Γάτα</SelectItem>
                                <SelectItem value="rabbit">🐰 Κουνέλι</SelectItem>
                                <SelectItem value="bird">🐦 Πουλί</SelectItem>
                                <SelectItem value="fish">🐠 Ψάρι</SelectItem>
                                <SelectItem value="hamster">🐹 Χάμστερ</SelectItem>
                                <SelectItem value="guinea-pig">🐹 Ινδικό Χοιρίδιο</SelectItem>
                                <SelectItem value="reptile">🦎 Ερπετό</SelectItem>
                                <SelectItem value="other">🐾 Άλλο</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="edit-breed">Ράτσα</Label>
                            <Input 
                              id="edit-breed" 
                              value={editFormData.breed}
                              onChange={(e) => handleEditInputChange('breed', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-gender">Φύλο</Label>
                            <Select value={editFormData.gender} onValueChange={(value) => handleEditInputChange('gender', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">♂️ Αρσενικό</SelectItem>
                                <SelectItem value="female">♀️ Θηλυκό</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="edit-birth-date">Ημερομηνία Γέννησης</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !editFormData.birthDate && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {editFormData.birthDate ? (
                                    format(editFormData.birthDate, "dd MMM yyyy", { locale: el })
                                  ) : (
                                    <span>Επίλεξε ημερομηνία</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={editFormData.birthDate || undefined}
                                  onSelect={(date) => handleEditInputChange('birthDate', date)}
                                  disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div>
                            <Label htmlFor="edit-weight">Βάρος (kg)</Label>
                            <Input 
                              id="edit-weight" 
                              type="number" 
                              step="0.1" 
                              min="0"
                              value={editFormData.weight}
                              onChange={(e) => handleEditInputChange('weight', e.target.value)}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="edit-description">Σημειώσεις</Label>
                          <Textarea 
                            id="edit-description" 
                            value={editFormData.description}
                            onChange={(e) => handleEditInputChange('description', e.target.value)}
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 pt-4">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setEditDialogOpen(false)}
                            className="flex-1"
                          >
                            Ακύρωση
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={editLoading}
                            className="flex-1"
                          >
                            {editLoading ? 'Αποθήκευση...' : 'Αποθήκευση'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
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

        {/* Gamification Section - Happiness & Streaks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Happiness Meter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Επίπεδο Ευτυχίας
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <HappinessMeter 
                score={happiness} 
                size="lg" 
                showLabel={true}
              />
            </CardContent>
          </Card>

          {/* Streaks Display */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Flame className="h-5 w-5" />
                Συνεχόμενες Μέρες
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {streaks.length > 0 ? (
                streaks.map((streak) => (
                  <StreakDisplay
                    key={streak.id}
                    type={streak.streak_type}
                    currentCount={streak.current_count}
                    bestCount={streak.best_count}
                    isActive={streak.is_active}
                  />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Δημιουργήστε το πρώτο event για να ξεκινήσετε τα streaks!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

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