
import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Heart, Calendar, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PetsPage = () => {
  const navigate = useNavigate();

  const pets = [
    {
      id: 1,
      name: 'Μπάρμπι',
      type: 'Σκύλος',
      breed: 'Golden Retriever',
      age: '3 χρόνια',
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop',
      nextEvent: 'Εμβόλιο - 15 Δεκ'
    },
    {
      id: 2,
      name: 'Ρεξ',
      type: 'Σκύλος',
      breed: 'German Shepherd',
      age: '5 χρόνια',
      image: 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=300&h=300&fit=crop',
      nextEvent: 'Φάρμακο - 16 Δεκ'
    },
    {
      id: 3,
      name: 'Μάξι',
      type: 'Γάτα',
      breed: 'British Shorthair',
      age: '2 χρόνια',
      image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300&h=300&fit=crop',
      nextEvent: 'Grooming - 18 Δεκ'
    }
  ];

  return (
    <div>
      <Header title="Τα Κατοικίδιά μου" />
      
      <div className="p-4 space-y-4">
        {/* Add Pet Button */}
        <Button 
          onClick={() => navigate('/add-pet')}
          className="w-full h-12 flex items-center justify-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Προσθήκη Νέου Κατοικιδίου
        </Button>

        {/* Pets List */}
        <div className="space-y-4">
          {pets.map((pet) => (
            <Card key={pet.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex">
                  <img 
                    src={pet.image} 
                    alt={pet.name}
                    className="w-24 h-24 object-cover"
                  />
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{pet.name}</h3>
                        <p className="text-sm text-muted-foreground">{pet.breed}</p>
                        <p className="text-sm text-muted-foreground">{pet.age}</p>
                        <p className="text-xs text-primary mt-1">{pet.nextEvent}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Calendar className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PetsPage;
