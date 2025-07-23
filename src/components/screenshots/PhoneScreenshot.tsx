
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Calendar, Euro, Plus, PawPrint, Star, Clock, User, TrendingUp, Award, MapPin, ChevronRight, Users, Activity, FileText, Stethoscope, Pill, Dog } from 'lucide-react';

const PhoneScreenshot = () => {
  const mockStats = {
    pets: 4,
    medicalRecords: 8,
    totalExpenses: 245.50,
    familyMembers: 2
  };

  const mockUpcomingEvents = [
    {
      id: '1',
      type: 'Εμβόλιο',
      pet: 'Λούλα',
      date: '25 Ιαν',
      time: '10:00',
      icon: Stethoscope,
      urgent: false
    },
    {
      id: '2',
      type: 'Grooming',
      pet: 'Φίλιππος',
      date: '28 Ιαν',
      time: '14:30',
      icon: Star,
      urgent: false
    },
    {
      id: '3',
      type: 'Φάρμακο',
      pet: 'Μπάτμαν',
      date: '30 Ιαν',
      time: '09:00',
      icon: Pill,
      urgent: true
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

  return (
    <div className="w-[375px] h-[812px] bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">For My Pet</h1>
      </div>
      
      <div className="p-4 space-y-6">
        {/* Dog with Speech Bubble Banner */}
        <Card className="bg-gradient-to-r from-primary to-primary/80 border-0 overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Speech Bubble */}
                <div className="bg-white rounded-2xl p-4 relative max-w-xs shadow-lg">
                  <p className="text-gray-800 text-sm leading-relaxed">
                    "Ευτυχώς που κατέβασε το ForMyPet και δε θα ξεχάσει ξανά να με πάει για μπάνιο!"
                  </p>
                  {/* Speech bubble tail pointing right */}
                  <div className="absolute top-4 right-0 w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-l-[12px] border-l-white transform translate-x-full"></div>
                </div>
              </div>
              
              {/* Dog Character */}
              <div className="flex flex-col items-center ml-6">
                <div className="text-5xl mb-2 animate-bounce">🐕‍🦺</div>
                <div className="text-white/90 text-xs text-center font-medium">Μπάτμαν<br />3 ετών</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Γρήγορες Ενέργειες</h3>
            <Button variant="ghost" size="sm" className="text-primary">
              Όλα <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(({ icon: Icon, label, color }) => (
              <Card
                key={label}
                className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-3 mx-auto`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm leading-tight">{label}</h4>
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
                      <div className="p-2 bg-gray-100 rounded-xl">
                        <IconComponent className="h-5 w-5 text-gray-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Επερχόμενα Events
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-primary">
              <Calendar className="h-4 w-4 mr-1" />
              Όλα
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockUpcomingEvents.map((event) => {
                const IconComponent = event.icon;
                return (
                  <div 
                    key={event.id} 
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <IconComponent className="h-5 w-5 text-gray-600" />
                      </div>
                      {event.urgent && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{event.type}</h4>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-600">{event.pet}</span>
                      </div>
                      <p className="text-sm text-gray-500">{event.date} στις {event.time}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PhoneScreenshot;
