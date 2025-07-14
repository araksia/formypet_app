
import React, { useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Camera, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AddPetPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [petImage, setPetImage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    gender: '',
    age: '',
    weight: '',
    description: ''
  });

  const handleImageCapture = () => {
    // Placeholder for camera functionality
    console.log('Camera functionality will be implemented with Capacitor');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.species) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ συμπληρώστε τα υποχρεωτικά πεδία (Όνομα και Είδος)",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Δεν βρέθηκε συνδεδεμένος χρήστης');
      }

      console.log('Saving pet with data:', {
        name: formData.name,
        species: formData.species,
        breed: formData.breed || null,
        gender: formData.gender || null,
        age: formData.age ? parseInt(formData.age) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        description: formData.description || null,
        avatar_url: petImage || null,
        owner_id: user.id
      });

      const { data, error } = await supabase
        .from('pets')
        .insert({
          name: formData.name,
          species: formData.species,
          breed: formData.breed || null,
          gender: formData.gender || null,
          age: formData.age ? parseInt(formData.age) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          description: formData.description || null,
          avatar_url: petImage || null,
          owner_id: user.id
        })
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Pet saved successfully:', data);

      toast({
        title: "🎉 Επιτυχία!",
        description: `Το κατοικίδιο "${formData.name}" καταχωρήθηκε επιτυχώς!`,
        duration: 4000
      });

      // Wait a bit for the toast to show, then navigate
      setTimeout(() => {
        navigate('/pets');
      }, 1000);

    } catch (error: any) {
      console.error('Error adding pet:', error);
      toast({
        title: "❌ Σφάλμα",
        description: error.message || "Υπήρξε πρόβλημα κατά την αποθήκευση του κατοικιδίου",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <Header title="Προσθήκη Κατοικιδίου" showNotifications={false} />
      
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
          {/* Photo Section */}
          <Card>
            <CardHeader>
              <CardTitle>Φωτογραφία</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                  {petImage ? (
                    <img src={petImage} alt="Pet" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleImageCapture}
                  className="w-full"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Τράβηξε Φωτογραφία
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Βασικά Στοιχεία</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Όνομα *</Label>
                  <Input 
                    id="name" 
                    placeholder="π.χ. Μπάρμπι" 
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="type">Είδος *</Label>
                  <Select value={formData.species} onValueChange={(value) => handleInputChange('species', value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Επίλεξε είδος" />
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="breed">Ράτσα</Label>
                  <Input 
                    id="breed" 
                    placeholder="π.χ. Golden Retriever" 
                    value={formData.breed}
                    onChange={(e) => handleInputChange('breed', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Φύλο</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Επίλεξε φύλο" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">♂️ Αρσενικό</SelectItem>
                      <SelectItem value="female">♀️ Θηλυκό</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Ηλικία (χρόνια)</Label>
                  <Input 
                    id="age" 
                    type="number" 
                    placeholder="π.χ. 3"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Βάρος (kg)</Label>
                  <Input 
                    id="weight" 
                    type="number" 
                    step="0.1" 
                    placeholder="π.χ. 25.5"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Σημειώσεις</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Οποιες επιπλέον πληροφορίες θέλεις να κρατήσεις..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button type="submit" className="w-full h-12" disabled={loading}>
            {loading ? 'Αποθήκευση...' : 'Αποθήκευση Κατοικιδίου'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddPetPage;
