
import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Calendar, Camera, Pill, Stethoscope, Plus, PawPrint, Star, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const quickActions = [
    { 
      icon: Plus, 
      label: 'Προσθήκη Κατοικιδίου', 
      action: () => navigate('/add-pet'), 
      color: 'bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg shadow-primary/25'
    },
    { 
      icon: Camera, 
      label: 'Φωτογραφία', 
      action: () => {}, 
      color: 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white shadow-lg shadow-green-500/25'
    },
    { 
      icon: Pill, 
      label: 'Φάρμακα', 
      action: () => navigate('/medications'), 
      color: 'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white shadow-lg shadow-orange-500/25'
    },
    { 
      icon: Stethoscope, 
      label: 'Ιατρικός Φάκελος', 
      action: () => navigate('/medical'), 
      color: 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white shadow-lg shadow-red-500/25'
    },
  ];

  const upcomingEvents = [
    { type: 'Εμβόλιο', pet: 'Μπάρμπι', date: '15 Δεκ 2024', time: '10:00', icon: Stethoscope, color: 'bg-red-100 text-red-600' },
    { type: 'Φάρμακο', pet: 'Ρεξ', date: '16 Δεκ 2024', time: '18:00', icon: Pill, color: 'bg-orange-100 text-orange-600' },
    { type: 'Grooming', pet: 'Μάξι', date: '18 Δεκ 2024', time: '14:30', icon: Star, color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/30 to-background">
      <Header title="For My Pet" />
      
      <div className="p-4 space-y-6">
        {/* Welcome Card */}
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/20 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-primary">Καλώς ήρθες!</h2>
                <p className="text-sm text-muted-foreground font-normal">
                  Διαχειρίσου εύκολα όλες τις ανάγκες των κατοικιδίων σου
                </p>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PawPrint className="h-5 w-5 text-primary" />
            Γρήγορες Ενέργειες
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map(({ icon: Icon, label, action, color }) => (
              <Button
                key={label}
                onClick={action}
                className={`h-28 flex flex-col items-center justify-center gap-3 ${color} transition-all duration-200 transform hover:scale-105 active:scale-95`}
                variant="default"
              >
                <div className="p-2 bg-white/20 rounded-full">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm text-center font-medium leading-tight">{label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <Card className="shadow-lg border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Επερχόμενα Events
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/calendar')} className="border-primary/20 hover:bg-primary/5">
              <Calendar className="h-4 w-4 mr-1" />
              Όλα
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => {
                const IconComponent = event.icon;
                return (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-border/30 hover:shadow-md transition-all duration-200">
                    <div className={`p-2 rounded-full ${event.color}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{event.type} - {event.pet}</p>
                      <p className="text-sm text-muted-foreground">{event.date} στις {event.time}</p>
                    </div>
                    <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-lg border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-3 bg-primary/10 rounded-full">
                  <PawPrint className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold text-primary mb-1">3</div>
              <div className="text-sm text-muted-foreground font-medium">Κατοικίδια</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-border/50 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-orange-600 mb-1">5</div>
              <div className="text-sm text-muted-foreground font-medium">Events αυτή την εβδομάδα</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
