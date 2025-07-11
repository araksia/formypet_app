
import React, { useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Camera, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddPetPage = () => {
  const navigate = useNavigate();
  const [petImage, setPetImage] = useState<string>('');

  const handleImageCapture = () => {
    // Placeholder for camera functionality
    console.log('Camera functionality will be implemented with Capacitor');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Pet added successfully');
    navigate('/pets');
  };

  return (
    <div>
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
                  <Input id="name" placeholder="π.χ. Μπάρμπι" required />
                </div>
                <div>
                  <Label htmlFor="type">Είδος *</Label>
                  <Input id="type" placeholder="π.χ. Σκύλος" required />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="breed">Ράτσα</Label>
                  <Input id="breed" placeholder="π.χ. Golden Retriever" />
                </div>
                <div>
                  <Label htmlFor="gender">Φύλο</Label>
                  <Input id="gender" placeholder="Αρσενικό/Θηλυκό" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="birthdate">Ημ/νία Γέννησης</Label>
                  <Input id="birthdate" type="date" />
                </div>
                <div>
                  <Label htmlFor="weight">Βάρος (kg)</Label>
                  <Input id="weight" type="number" step="0.1" placeholder="π.χ. 25.5" />
                </div>
              </div>

              <div>
                <Label htmlFor="microchip">Αριθμός Microchip</Label>
                <Input id="microchip" placeholder="Προαιρετικό" />
              </div>

              <div>
                <Label htmlFor="notes">Σημειώσεις</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Οποιες επιπλέον πληροφορίες θέλεις να κρατήσεις..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button type="submit" className="w-full h-12">
            Αποθήκευση Κατοικιδίου
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddPetPage;
