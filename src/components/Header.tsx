
import React, { useState, useEffect } from 'react';
import { Bell, User, Users, Calendar, Heart, Clock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  title: string;
  showNotifications?: boolean;
  showProfile?: boolean;
}

interface Notification {
  id: string;
  type: 'family_invite' | 'upcoming_event' | 'reminder' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

const Header = ({ title, showNotifications = true, showProfile = true }: HeaderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Αποσύνδεση",
        description: "Αποσυνδεθήκατε επιτυχώς"
      });
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Σφάλμα",
        description: "Υπήρξε πρόβλημα κατά την αποσύνδεση",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    // Mock notifications - in a real app, these would come from the database
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'family_invite',
        title: 'Νέα πρόσκληση οικογένειας',
        message: 'Η Μαρία σας προσκάλεσε να γίνετε μέλος της οικογένειας του Μπάτμαν',
        time: '5 λεπτά πριν',
        read: false,
        icon: Users
      },
      {
        id: '2',
        type: 'upcoming_event',
        title: 'Επερχόμενο εμβόλιο',
        message: 'Το εμβόλιο της Μπάρμπι είναι προγραμματισμένο για αύριο στις 10:00',
        time: '1 ώρα πριν',
        read: false,
        icon: Calendar
      },
      {
        id: '3',
        type: 'reminder',
        title: 'Ώρα για φάρμακο',
        message: 'Ο Ρεξ χρειάζεται το φάρμακό του σε 30 λεπτά',
        time: '2 ώρες πριν',
        read: true,
        icon: Clock
      },
      {
        id: '4',
        type: 'system',
        title: 'Καλώς ήρθατε!',
        message: 'Η εφαρμογή ForMyPet είναι έτοιμη για χρήση',
        time: '1 ημέρα πριν',
        read: true,
        icon: Heart
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getNotificationBadgeColor = (type: Notification['type']) => {
    switch (type) {
      case 'family_invite': return 'bg-blue-500';
      case 'upcoming_event': return 'bg-orange-500';
      case 'reminder': return 'bg-red-500';
      case 'system': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img 
              src="/lovable-uploads/e33fce6b-baa6-4fdb-b245-796702e4b22d.png" 
              alt="For my pet Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            <p className="text-xs text-gray-500">Καλημέρα! 🐾</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {showNotifications && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2 relative">
                  <Bell className="h-5 w-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <Badge 
                      className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-destructive text-destructive-foreground text-xs rounded-full"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Ειδοποιήσεις</span>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Όλα ως αναγνωσμένα
                    </Button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    Δεν υπάρχουν ειδοποιήσεις
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const IconComponent = notification.icon;
                    return (
                      <DropdownMenuItem
                        key={notification.id}
                        className={`p-4 cursor-pointer ${!notification.read ? 'bg-muted/30' : ''}`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex gap-3 w-full">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getNotificationBadgeColor(notification.type)}`}>
                            <IconComponent className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-sm leading-tight">{notification.title}</h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full mt-1 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    );
                  })
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {showProfile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-2"
                >
                  <User className="h-5 w-5 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  {user?.email || 'Χρήστης'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="h-4 w-4 mr-2" />
                  Προφίλ
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Clock className="h-4 w-4 mr-2" />
                  Ρυθμίσεις
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Αποσύνδεση
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
