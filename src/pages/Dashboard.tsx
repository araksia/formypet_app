
import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Calendar, Camera, Pill, Stethoscope, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const quickActions = [
    { icon: Plus, label: 'Προσθήκη Κατοικιδίου', action: () => navigate('/add-pet'), color: 'bg-primary text-primary-foreground' },
    { icon: Camera, label: 'Φωτογραφία', action: () => {}, color: 'bg-blue-500 text-white' },
    { icon: Pill, label: 'Φάρμακα', action: () => navigate('/medications'), color: 'bg-green-500 text-white' },
    { icon: Stethoscope, label: 'Ιατρικός Φάκελος', action: () => navigate('/medical'), color: 'bg-red-500 text-white' },
  ];

  const upcomingEvents = [
    { type: 'Εμβόλιο', pet: 'Μπάρμπι', date: '15 Δεκ 2024', time: '10:00' },
    { type: 'Φάρμακο', pet: 'Ρεξ', date: '16 Δεκ 2024', time: '18:00' },
    { type: 'Grooming', pet: 'Μάξι', date: '18 Δεκ 2024', time: '14:30' },
  ];

  return (
    <div>
      <Header title="For My Pet" />
      
      <div className="p-4 space-y-6">
        {/* Welcome Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Καλώς ήρθες!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Διαχειρίσου εύκολα όλες τις ανάγκες των κατοικιδίων σου
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Γρήγορες Ενέργειες</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(({ icon: Icon, label, action, color }) => (
              <Button
                key={label}
                onClick={action}
                className={`h-24 flex flex-col items-center justify-center gap-2 ${color}`}
                variant="default"
              >
                <Icon className="h-6 w-6" />
                <span className="text-sm text-center">{label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Επερχόμενα Events</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/calendar')}>
              <Calendar className="h-4 w-4 mr-1" />
              Όλα
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{event.type} - {event.pet}</p>
                    <p className="text-sm text-muted-foreground">{event.date} στις {event.time}</p>
                  </div>
                  <div className="h-3 w-3 bg-primary rounded-full"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">3</div>
              <div className="text-sm text-muted-foreground">Κατοικίδια</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">5</div>
              <div className="text-sm text-muted-foreground">Events αυτή την εβδομάδα</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
