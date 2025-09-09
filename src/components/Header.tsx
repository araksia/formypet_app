
import React, { useState, useEffect } from 'react';
import { Bell, User, Users, Calendar, Heart, Clock, LogOut, Menu, Trophy, Settings, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, isToday, isTomorrow } from 'date-fns';
import { el } from 'date-fns/locale';
import forMyPetLogo from '@/assets/formypet-logo.png';

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
  const [greeting, setGreeting] = useState('');
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

  const getGreeting = () => {
    return 'Γεια σου!';
  };

  useEffect(() => {
    // Set initial greeting
    setGreeting(getGreeting());
    
    // Update greeting every minute
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000); // 1 minute
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const realNotifications: Notification[] = [];

      // Load upcoming events
      const { data: events } = await supabase
        .from('events')
        .select(`
          id,
          title,
          event_date,
          event_time,
          event_type,
          pet_id
        `)
        .eq('user_id', user.id)
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .limit(5);

      if (events && events.length > 0) {
        // Get pet names separately
        const petIds = [...new Set(events.map(e => e.pet_id))];
        const { data: pets } = await supabase
          .from('pets')
          .select('id, name')
          .in('id', petIds);

        const petMap = new Map(pets?.map(p => [p.id, p.name]) || []);

        events.forEach(event => {
          const eventDate = new Date(event.event_date);
          let timeMessage = '';
          
          if (isToday(eventDate)) {
            timeMessage = 'Σήμερα';
          } else if (isTomorrow(eventDate)) {
            timeMessage = 'Αύριο';
          } else {
            timeMessage = format(eventDate, 'dd/MM/yyyy', { locale: el });
          }

          if (event.event_time) {
            // Format time properly for Greek users
            const [hours, minutes] = event.event_time.split(':');
            const hour = parseInt(hours);
            const isPM = hour >= 12;
            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            const period = isPM ? 'μ.μ.' : 'π.μ.';
            const formattedTime = `${displayHour}:${minutes} ${period}`;
            timeMessage += ` στις ${formattedTime}`;
          }

          const petName = petMap.get(event.pet_id) || 'κατοικίδιό σας';

          realNotifications.push({
            id: event.id,
            type: 'upcoming_event',
            title: `Επερχόμενο ${event.event_type}`,
            message: `${event.title} για τον/την ${petName} - ${timeMessage}`,
            time: format(eventDate, 'dd/MM', { locale: el }),
            read: false,
            icon: Calendar
          });
        });
      }

      // Temporarily hidden - Family member functionality
      // Load pending family invites
      /* const { data: invites } = await supabase
        .from('pet_family_members')
        .select(`
          id,
          role,
          pet_id,
          invited_by
        `)
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if (invites && invites.length > 0) {
        // Get pet and profile names separately
        const petIds = [...new Set(invites.map(i => i.pet_id))];
        const profileIds = [...new Set(invites.map(i => i.invited_by))];
        
        const [petsResult, profilesResult] = await Promise.all([
          supabase.from('pets').select('id, name').in('id', petIds),
          supabase.from('profiles').select('user_id, display_name').in('user_id', profileIds)
        ]);

        const petMap = new Map(petsResult.data?.map(p => [p.id, p.name]) || []);
        const profileMap = new Map(profilesResult.data?.map(p => [p.user_id, p.display_name]) || []);

        invites.forEach(invite => {
          const petName = petMap.get(invite.pet_id) || 'κατοικίδιο';
          const inviterName = profileMap.get(invite.invited_by) || 'Κάποιος';
          
          realNotifications.push({
            id: invite.id,
            type: 'family_invite',
            title: 'Νέα πρόσκληση οικογένειας',
            message: `${inviterName} σας προσκάλεσε ως ${invite.role} για τον/την ${petName}`,
            time: 'Νέα',
            read: false,
            icon: Users
          });
        });
      } */

      setNotifications(realNotifications);
      setUnreadCount(realNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Fallback to empty notifications on error
      setNotifications([]);
      setUnreadCount(0);
    }
  };

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
    <div 
      className="bg-background border-b border-border fixed top-0 left-0 right-0 z-50 shadow-sm safe-area-top" 
      role="banner"
    >
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img 
              src="/lovable-uploads/cdeb7e37-956e-4df1-a666-ec55f7ac208b.png" 
              alt="For My Pet λογότυπο - Εφαρμογή φροντίδας κατοικιδίων"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 id="page-title" className="text-lg font-semibold text-gray-900">{title}</h1>
            <p className="text-xs text-gray-500" role="text">{greeting} 🐾</p>
          </div>
        </div>
        <div className="flex items-center gap-3">

          {/* Notifications */}
          {showNotifications && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-2 relative focus-enhanced"
                  aria-label={`Ειδοποιήσεις ${unreadCount > 0 ? `- ${unreadCount} μη αναγνωσμένες` : '- δεν υπάρχουν νέες'}`}
                >
                  <Bell className="h-5 w-5 text-gray-600" aria-hidden="true" />
                  {unreadCount > 0 && (
                    <Badge 
                      className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-destructive text-destructive-foreground text-xs rounded-full"
                      aria-label={`${unreadCount} μη αναγνωσμένες ειδοποιήσεις`}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-80 max-h-96 overflow-y-auto"
                role="menu"
                aria-label="Λίστα ειδοποιήσεων"
              >
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Ειδοποιήσεις</span>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground focus-enhanced"
                      aria-label="Σήμανση όλων των ειδοποιήσεων ως αναγνωσμένες"
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
                        className={`p-4 cursor-pointer focus-enhanced ${!notification.read ? 'bg-muted/30' : ''}`}
                        onClick={() => markAsRead(notification.id)}
                        role="menuitem"
                        aria-label={`${notification.title}: ${notification.message} - ${notification.read ? 'Αναγνωσμένο' : 'Μη αναγνωσμένο'}`}
                      >
                        <div className="flex gap-3 w-full">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getNotificationBadgeColor(notification.type)}`} role="img" aria-label={`Εικονίδιο ${notification.type}`}>
                            <IconComponent className="h-4 w-4 text-white" aria-hidden="true" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-sm leading-tight">{notification.title}</h4>
                              {!notification.read && (
                                <div 
                                  className="w-2 h-2 bg-primary rounded-full mt-1 flex-shrink-0" 
                                  role="img"
                                  aria-label="Νέα ειδοποίηση"
                                />
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
          {/* Profile Dropdown - Complete */}
          {showProfile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-2 focus-enhanced"
                  aria-label="Μενού χρήστη"
                >
                  <User className="h-5 w-5 text-gray-600" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56"
                role="menu"
                aria-label="Μενού λογαριασμού χρήστη"
              >
                <DropdownMenuLabel>
                  {user?.email || 'Χρήστης'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center w-full">
                    <User className="mr-2 h-4 w-4" aria-hidden="true" />
                    <span>Προφίλ</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center w-full">
                    <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                    <span>Ρυθμίσεις</span>
                  </Link>
                </DropdownMenuItem>
                
                {/* Temporarily hidden - Family member functionality */}
                {/* <DropdownMenuItem asChild>
                  <Link to="/family" className="flex items-center w-full">
                    <Users className="mr-2 h-4 w-4" aria-hidden="true" />
                    <span>Διαχείριση Οικογένειας</span>
                  </Link>
                </DropdownMenuItem> */}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                  <Link to="/privacy" className="flex items-center w-full">
                    <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
                    <span>Πολιτική Απορρήτου</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link to="/terms" className="flex items-center w-full">
                    <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
                    <span>Όροι Χρήσης</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={handleSignOut} 
                  className="text-destructive focus:text-destructive focus-enhanced"
                  role="menuitem"
                  aria-label="Αποσύνδεση από την εφαρμογή"
                >
                  <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
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
