
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Calendar, Euro, Plus, PawPrint, Star, Clock, Users, Activity, FileText, Stethoscope, Pill, ChevronRight, Share2 } from 'lucide-react';

const Tablet10Screenshot = () => {
  const mockStats = {
    pets: 4,
    medicalRecords: 8,
    totalExpenses: 245.50,
    familyMembers: 2
  };

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

  const quickActions = [
    { 
      icon: PawPrint, 
      label: 'Προσθήκη Κατοικιδίου',
      color: 'bg-primary'
    },
    { 
      icon: Calendar, 
      label: 'Προσθήκη Event',
      color: 'bg-blue-500'
    },
    { 
      icon: Euro, 
      label: 'Προσθήκη Εξόδων',
      color: 'bg-green-500'
    },
    { 
      icon: Users, 
      label: 'Νέο Μέλος Οικογένειας',
      color: 'bg-purple-500'
    },
  ];

  const statsData = [
    { label: 'Κατοικίδια', value: mockStats.pets.toString(), icon: PawPrint },
    { label: 'Ιατρικά Αρχεία', value: mockStats.medicalRecords.toString(), icon: FileText },
    { label: 'Συνολικά Έξοδα', value: `€${mockStats.totalExpenses.toFixed(2)}`, icon: Euro },
    { label: 'Μέλη Οικογένειας', value: mockStats.familyMembers.toString(), icon: Users },
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
    <div className="w-[1024px] h-[768px] bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-4">
        <h1 className="text-2xl font-bold text-gray-900">For My Pet - Κατοικίδια</h1>
      </div>
      
      <div className="p-8 grid grid-cols-3 gap-8 h-full">
        {/* Left Column - Dashboard Info */}
        <div className="space-y-6">
          {/* Dog with Speech Bubble Banner */}
          <Card className="bg-gradient-to-r from-primary to-primary/80 border-0 overflow-hidden">
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Speech Bubble */}
                  <div className="bg-white rounded-2xl p-4 relative max-w-xs shadow-lg">
                    <p className="text-gray-800 text-sm leading-relaxed">
                      "Ευτυχώς που κατέβασε το ForMyPet!"
                    </p>
                    {/* Speech bubble tail pointing right */}
                    <div className="absolute top-4 right-0 w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-l-[12px] border-l-white transform translate-x-full"></div>
                  </div>
                </div>
                
                {/* Dog Character */}
                <div className="flex flex-col items-center ml-4">
                  <div className="text-4xl mb-2">🐕‍🦺</div>
                  <div className="text-white/90 text-xs text-center font-medium">Μπάτμαν</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Γρήγορες Ενέργειες</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map(({ icon: Icon, label, color }) => (
                <Card
                  key={label}
                  className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <CardContent className="p-4 text-center">
                    <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-2 mx-auto`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-medium text-gray-900 text-xs leading-tight">{label}</h4>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Στατιστικά</h3>
            <div className="grid grid-cols-2 gap-3">
              {statsData.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <Card key={index} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <IconComponent className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>
                      <div className="text-xl font-bold text-gray-900 mb-1">{stat.value}</div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Middle & Right Columns - Pets Grid */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Τα Κατοικίδιά μου</h3>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Προσθήκη Νέου Κατοικιδίου
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {mockPets.map((pet) => (
              <Card key={pet.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="flex h-full">
                    {/* Pet Image */}
                    <div className="relative flex-shrink-0">
                      <div className="w-24 h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
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
                          <h3 className="font-bold text-lg text-gray-900">{pet.name}</h3>
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
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-purple-50 hover:text-purple-600"
                            title="Μοίρασμα"
                          >
                            <Share2 className="h-4 w-4" />
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
    </div>
  );
};

export default Tablet10Screenshot;
