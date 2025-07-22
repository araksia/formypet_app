
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Heart, Calendar, Stethoscope, Share2, FileText } from 'lucide-react';

const PhonePetsScreenshot = () => {
  const mockPets = [
    {
      id: '1',
      name: 'Μπάτμαν',
      species: 'dog',
      breed: 'Γερμανικός Ποιμενικός',
      age: 3,
      weight: 25,
      avatar_url: null
    },
    {
      id: '2',
      name: 'Λούλα',
      species: 'cat',
      breed: 'Περσική',
      age: 2,
      weight: 4.5,
      avatar_url: null
    },
    {
      id: '3',
      name: 'Φίλιππος',
      species: 'rabbit',
      breed: 'Mini Lop',
      age: 1,
      weight: 2.1,
      avatar_url: null
    }
  ];

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

  const getSpeciesLabel = (species: string) => {
    const labelMap: { [key: string]: string } = {
      'dog': 'Σκύλος',
      'cat': 'Γάτα',
      'rabbit': 'Κουνέλι',
      'bird': 'Πουλί',
      'fish': 'Ψάρι',
      'hamster': 'Χάμστερ',
      'guinea-pig': 'Γουινέα Pig',
      'reptile': 'Ερπετό',
      'other': 'Άλλο'
    };
    return labelMap[species] || 'Κατοικίδιο';
  };

  return (
    <div className="w-[375px] h-[812px] bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">Τα Κατοικίδιά μου</h1>
      </div>
      
      <div className="p-3 space-y-4">
        {/* Add Pet Button */}
        <Button className="w-full h-14 flex items-center justify-center gap-2 text-base">
          <Plus className="h-5 w-5" />
          Προσθήκη Νέου Κατοικιδίου
        </Button>

        {/* Pets List */}
        <div className="grid gap-4">
          {mockPets.map((pet) => (
            <Card key={pet.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex flex-col h-full">
                  {/* Pet Image */}
                  <div className="relative flex-shrink-0">
                    <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <span className="text-3xl">{getSpeciesEmoji(pet.species)}</span>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="absolute top-2 left-2 text-xs bg-white/90 backdrop-blur-sm"
                    >
                      {getSpeciesEmoji(pet.species)} {getSpeciesLabel(pet.species)}
                    </Badge>
                  </div>
                  
                  {/* Pet Info */}
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-gray-900">{pet.name}</h3>
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
                      <div className="flex flex-wrap gap-1">
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                            title="Προφίλ κατοικιδίου"
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                            title="Ημερολόγιο"
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-green-50 hover:text-green-600"
                            title="Ιατρικά στοιχεία"
                          >
                            <Stethoscope className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-purple-50 hover:text-purple-600"
                            title="Μοίρασμα με άλλους"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-orange-50 hover:text-orange-600"
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
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 w-[375px]">
        <div className="flex justify-around items-center h-16 px-2">
          <div className="flex flex-col items-center justify-center p-2 rounded-lg text-muted-foreground min-w-0 flex-1">
            <div className="w-5 h-5 mb-1 bg-gray-400 rounded-sm"></div>
            <span className="text-xs text-center truncate">Αρχική</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-lg text-primary bg-primary/10 min-w-0 flex-1">
            <Heart className="h-5 w-5 mb-1" />
            <span className="text-xs text-center truncate">Κατοικίδια</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-lg text-muted-foreground min-w-0 flex-1">
            <Calendar className="h-5 w-5 mb-1" />
            <span className="text-xs text-center truncate">Ημερολόγιο</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-lg text-muted-foreground min-w-0 flex-1">
            <div className="w-5 h-5 mb-1 bg-gray-400 rounded-sm"></div>
            <span className="text-xs text-center truncate">Έξοδα</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-lg text-muted-foreground min-w-0 flex-1">
            <div className="w-5 h-5 mb-1 bg-gray-400 rounded-sm"></div>
            <span className="text-xs text-center truncate">Ρυθμίσεις</span>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default PhonePetsScreenshot;
