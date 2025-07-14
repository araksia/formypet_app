
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Calendar, Euro, Plus, PawPrint, Star, Clock, Search, User, TrendingUp, Award, MapPin, ChevronRight, Users, Activity, FileText, Stethoscope, Pill } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const quickActions = [
    { 
      icon: PawPrint, 
      label: 'Προσθήκη Κατοικιδίου', 
      action: () => navigate('/add-pet'),
      color: 'bg-primary'
    },
    { 
      icon: Calendar, 
      label: 'Προσθήκη Event', 
      action: () => navigate('/add-event'),
      color: 'bg-blue-500'
    },
    { 
      icon: Euro, 
      label: 'Προσθήκη Εξόδων', 
      action: () => navigate('/add-expense'),
      color: 'bg-green-500'
    },
    { 
      icon: Users, 
      label: 'Νέο Μέλος Οικογένειας', 
      action: () => navigate('/add-family-member'),
      color: 'bg-purple-500'
    },
  ];

  const upcomingEvents = [
    { type: 'Εμβόλιο', pet: 'Μπάρμπι', date: '15 Δεκ', time: '10:00', icon: Stethoscope, urgent: true },
    { type: 'Φάρμακο', pet: 'Ρεξ', date: '16 Δεκ', time: '18:00', icon: Pill, urgent: false },
    { type: 'Grooming', pet: 'Μάξι', date: '18 Δεκ', time: '14:30', icon: Star, urgent: false },
  ];

  const stats = [
    { label: 'Κατοικίδια', value: '3', icon: PawPrint, trend: '+1' },
    { label: 'Ιατρικά Αρχεία', value: '8', icon: FileText, trend: '+2' },
    { label: 'Συνολικά Έξοδα', value: '€245', icon: Euro, trend: '+€50' },
    { label: 'Μέλη Οικογένειας', value: '4', icon: Users, trend: '+1' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img 
                src="/lovable-uploads/80a1ae36-cd7c-4cc3-804b-42587ec0efb4.png" 
                alt="For My Pet Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">For My Pet</h1>
              <p className="text-xs text-gray-500">Καλημέρα! 🐾</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="p-2" onClick={() => navigate('/profile')}>
              <User className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Αναζήτηση για κατοικίδια, φάρμακα, κτηνιάτρους..."
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-100 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
          />
        </div>

        {/* Dog with Speech Bubble Banner */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Speech Bubble */}
                <div className="bg-white rounded-2xl p-4 relative max-w-xs shadow-lg">
                  <p className="text-gray-800 text-sm leading-relaxed">
                    "Ευτυχώς που κατέβασε το ForMyPet και δε θα ξεχάσει ξανά να με πάει για μπάνιο!"
                  </p>
                  {/* Speech bubble tail */}
                  <div className="absolute bottom-0 left-6 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-white transform translate-y-full"></div>
                </div>
              </div>
              
              {/* Dog Character */}
              <div className="flex flex-col items-center ml-4">
                <div className="text-6xl mb-2 animate-bounce">🐕</div>
                <div className="text-white/80 text-xs text-center">Μπάτμαν</div>
              </div>
            </div>
            
            {/* App promotion */}
            <div className="mt-4 pt-4 border-t border-white/20">
              <Button size="sm" className="bg-white text-blue-600 hover:bg-gray-100 font-medium">
                Εξερευνήστε την εφαρμογή 🐾
              </Button>
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
            {quickActions.map(({ icon: Icon, label, action, color }) => (
              <Card
                key={label}
                className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-95"
                onClick={action}
              >
                <CardContent className="p-4">
                  <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm leading-tight">{label}</h4>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Στατιστικά</h3>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 bg-gray-100 rounded-xl">
                        <IconComponent className="h-5 w-5 text-gray-600" />
                      </div>
                      <span className="text-xs text-green-600 font-medium flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {stat.trend}
                      </span>
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
            <Button variant="ghost" size="sm" onClick={() => navigate('/calendar')} className="text-primary">
              <Calendar className="h-4 w-4 mr-1" />
              Όλα
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => {
                const IconComponent = event.icon;
                return (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
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

        {/* Google Ads Section */}
        <Card className="border-0 shadow-sm bg-gray-50">
          <CardContent className="p-4 text-center">
            <div className="text-sm text-gray-500 mb-2">Διαφήμιση</div>
            <div className="h-24 bg-white rounded-lg flex items-center justify-center border border-gray-200">
              <span className="text-gray-400 text-sm">Google Ads Space</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
