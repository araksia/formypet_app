
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
      action: () => navigate('/add-pet')
    },
    { 
      icon: Camera, 
      label: 'Φωτογραφία', 
      action: () => {}
    },
    { 
      icon: Pill, 
      label: 'Φάρμακα', 
      action: () => navigate('/medications')
    },
    { 
      icon: Stethoscope, 
      label: 'Ιατρικός Φάκελος', 
      action: () => navigate('/medical')
    },
  ];

  const upcomingEvents = [
    { type: 'Εμβόλιο', pet: 'Μπάρμπι', date: '15 Δεκ 2024', time: '10:00', icon: Stethoscope },
    { type: 'Φάρμακο', pet: 'Ρεξ', date: '16 Δεκ 2024', time: '18:00', icon: Pill },
    { type: 'Grooming', pet: 'Μάξι', date: '18 Δεκ 2024', time: '14:30', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header title="For My Pet" />
      
      <div className="p-6 space-y-8">
        {/* Welcome Section */}
        <div className="text-center py-6">
          <div className="flex justify-center mb-4">
            <div className="p-4 border border-border rounded-full">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">For My Pet</h2>
          <p className="text-muted-foreground">
            Διαχειρίσου εύκολα όλες τις ανάγκες των κατοικιδίων σου
          </p>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-medium mb-6 text-foreground">Γρήγορες Ενέργειες</h3>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map(({ icon: Icon, label, action }) => (
              <Card
                key={label}
                className="h-32 border border-border hover:border-muted-foreground/30 cursor-pointer transition-all duration-200 hover:shadow-sm"
                onClick={action}
              >
                <CardContent className="h-full flex flex-col items-center justify-center gap-3 p-4">
                  <div className="p-3 border border-border rounded-full">
                    <Icon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-center font-medium text-foreground leading-tight">{label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <Card className="border border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Επερχόμενα Events
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/calendar')} className="text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              Όλα
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => {
                const IconComponent = event.icon;
                return (
                  <div key={index} className="flex items-center gap-4 p-4 border border-border rounded-lg hover:border-muted-foreground/30 transition-all duration-200">
                    <div className="p-2 border border-border rounded-full">
                      <IconComponent className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{event.type} - {event.pet}</p>
                      <p className="text-sm text-muted-foreground">{event.date} στις {event.time}</p>
                    </div>
                    <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border border-border">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 border border-border rounded-full">
                  <PawPrint className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">3</div>
              <div className="text-sm text-muted-foreground font-medium">Κατοικίδια</div>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 border border-border rounded-full">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">5</div>
              <div className="text-sm text-muted-foreground font-medium">Events αυτή την εβδομάδα</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
