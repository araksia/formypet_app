import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Pill, Calendar, Heart, AlertCircle } from 'lucide-react';

const NotificationsScreenshot = () => {
  const mockNotifications = [
    {
      id: '1',
      type: 'medication',
      title: 'Φάρμακο για Μπάτμαν',
      description: 'Ώρα για το αντιβιοτικό (2 χάπια)',
      time: '10:00 π.μ.',
      urgent: true,
      pet: 'Μπάτμαν',
      icon: Pill
    },
    {
      id: '2', 
      type: 'appointment',
      title: 'Ραντεβού Κτηνιατρείου',
      description: 'Ετήσιος έλεγχος για τη Λούλα',
      time: '3:00 μ.μ.',
      urgent: false,
      pet: 'Λούλα',
      icon: Calendar
    },
    {
      id: '3',
      type: 'feeding',
      title: 'Φαγητό για Φίλιππο',
      description: 'Χαρούπι και λαχανικά',
      time: '6:00 μ.μ.',
      urgent: false,
      pet: 'Φίλιππος', 
      icon: Heart
    },
    {
      id: '4',
      type: 'reminder',
      title: 'Μη ξεχάσετε!',
      description: 'Αύριο εμβόλιο για τον Μπάτμαν',
      time: 'Αύριο',
      urgent: true,
      pet: 'Μπάτμαν',
      icon: AlertCircle
    }
  ];

  const getNotificationColor = (type: string, urgent: boolean) => {
    if (urgent) return 'bg-red-50 border-red-200';
    switch (type) {
      case 'medication': return 'bg-blue-50 border-blue-200';
      case 'appointment': return 'bg-green-50 border-green-200';
      case 'feeding': return 'bg-orange-50 border-orange-200';
      case 'reminder': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getIconColor = (type: string, urgent: boolean) => {
    if (urgent) return 'text-red-600';
    switch (type) {
      case 'medication': return 'text-blue-600';
      case 'appointment': return 'text-green-600';
      case 'feeding': return 'text-orange-600';
      case 'reminder': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="w-[375px] h-[812px] bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Ειδοποιήσεις</h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              4 νέα
            </Badge>
            <Bell className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-4 space-y-3">
        {mockNotifications.map((notification) => {
          const IconComponent = notification.icon;
          return (
            <Card 
              key={notification.id} 
              className={`${getNotificationColor(notification.type, notification.urgent)} shadow-sm hover:shadow-md transition-shadow`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`p-2 rounded-full ${notification.urgent ? 'bg-red-100' : 'bg-white'} flex-shrink-0`}>
                    <IconComponent className={`h-4 w-4 ${getIconColor(notification.type, notification.urgent)}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                        {notification.title}
                      </h3>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {notification.time}
                        </span>
                        {notification.urgent && (
                          <Badge variant="destructive" className="text-xs px-1.5 py-0.5 h-5">
                            Επείγον
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                      {notification.description}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className="text-xs">
                        {notification.pet}
                      </Badge>
                      
                      <div className="flex gap-2">
                        <button className="text-xs text-primary hover:text-primary/80 font-medium">
                          Προβολή
                        </button>
                        <button className="text-xs text-muted-foreground hover:text-gray-600">
                          Απόκρυψη
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Empty State for older notifications */}
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-6 text-center">
            <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">Δεν υπάρχουν άλλες ειδοποιήσεις</p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 w-[375px]">
        <div className="flex justify-around items-center h-16 px-2">
          <div className="flex flex-col items-center justify-center p-2 rounded-lg text-muted-foreground min-w-0 flex-1">
            <div className="w-5 h-5 mb-1 bg-gray-400 rounded-sm"></div>
            <span className="text-xs text-center truncate">Αρχική</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-lg text-muted-foreground min-w-0 flex-1">
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
          <div className="flex flex-col items-center justify-center p-2 rounded-lg text-primary bg-primary/10 min-w-0 flex-1">
            <Bell className="h-5 w-5 mb-1" />
            <span className="text-xs text-center truncate">Ειδοποιήσεις</span>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default NotificationsScreenshot;