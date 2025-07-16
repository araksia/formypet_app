
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Calendar, Euro, Plus, PawPrint, Star, Clock, User, TrendingUp, Award, MapPin, ChevronRight, Users, Activity, FileText, Stethoscope, Pill, Dog } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { el } from 'date-fns/locale';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pets: 0,
    medicalRecords: 0,
    totalExpenses: 0,
    familyMembers: 0
  });
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadUpcomingEvents()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get pets count
      const { data: pets, error: petsError } = await supabase
        .from('pets')
        .select('id')
        .eq('owner_id', user!.id);

      if (petsError) throw petsError;

      // Get family members count (excluding owner)
      const { data: familyMembers, error: familyError } = await supabase
        .from('pet_family_members')
        .select('id')
        .neq('user_id', user!.id)
        .eq('status', 'accepted');

      if (familyError) throw familyError;

      // Get total expenses
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user!.id);

      if (expensesError) throw expensesError;

      const totalExpenses = expenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;

      setStats({
        pets: pets?.length || 0,
        medicalRecords: 0, // We don't have medical records table yet
        totalExpenses,
        familyMembers: familyMembers?.length || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadUpcomingEvents = async () => {
    try {
      const today = new Date();
      const nextMonth = addDays(new Date(), 30); // Extend to 30 days instead of 7

      console.log('🔍 Loading events between:', today.toISOString(), 'and', nextMonth.toISOString());

      const { data: events, error } = await supabase
        .from('events')
        .select('id, title, event_type, event_date, event_time, pet_id')
        .eq('user_id', user!.id)
        .gte('event_date', today.toISOString().split('T')[0]) // Use date only
        .lte('event_date', nextMonth.toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .limit(3);

      console.log('📅 Events query result:', { events, error });

      if (error) throw error;

      if (!events || events.length === 0) {
        console.log('❌ No events found');
        setUpcomingEvents([]);
        return;
      }

      console.log('✅ Found', events.length, 'events');

      // Get pet names for the events
      const petIds = events.map(event => event.pet_id);
      const { data: pets, error: petsError } = await supabase
        .from('pets')
        .select('id, name')
        .in('id', petIds);

      if (petsError) throw petsError;

      const petNameMap = pets?.reduce((acc, pet) => {
        acc[pet.id] = pet.name;
        return acc;
      }, {} as { [key: string]: string }) || {};

      const formattedEvents = events.map(event => ({
        id: event.id,
        type: getEventTypeLabel(event.event_type),
        pet: petNameMap[event.pet_id] || 'Άγνωστο',
        date: format(new Date(event.event_date), 'dd MMM', { locale: el }),
        time: event.event_time || '00:00',
        icon: getEventIcon(event.event_type),
        urgent: isAfter(new Date(), new Date(event.event_date))
      }));

      console.log('📋 Formatted events:', formattedEvents);
      setUpcomingEvents(formattedEvents);
    } catch (error) {
      console.error('💥 Error loading upcoming events:', error);
      setUpcomingEvents([]);
    }
  };

  const getEventTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'medication': 'Φάρμακο',
      'vaccination': 'Εμβόλιο',
      'checkup': 'Εξέταση',
      'grooming': 'Grooming',
      'birthday': 'Γενέθλια',
      'feeding': 'Φαγητό',
      'exercise': 'Άσκηση'
    };
    return types[type] || type;
  };

  const getEventIcon = (type: string) => {
    const icons: { [key: string]: any } = {
      'medication': Pill,
      'vaccination': Stethoscope,
      'checkup': Stethoscope,
      'grooming': Star,
      'birthday': Star,
      'feeding': Star,
      'exercise': Activity
    };
    return icons[type] || Activity;
  };

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

  const statsData = [
    { label: 'Κατοικίδια', value: stats.pets.toString(), icon: PawPrint },
    { label: 'Ιατρικά Αρχεία', value: stats.medicalRecords.toString(), icon: FileText },
    { label: 'Συνολικά Έξοδα', value: `€${stats.totalExpenses.toFixed(2)}`, icon: Euro },
    { label: 'Μέλη Οικογένειας', value: stats.familyMembers.toString(), icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <Header title="For My Pet" />
      
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
            {quickActions.map(({ icon: Icon, label, action, color }) => (
              <Card
                key={label}
                className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-95"
                onClick={action}
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
            <Button variant="ghost" size="sm" onClick={() => navigate('/calendar')} className="text-primary">
              <Calendar className="h-4 w-4 mr-1" />
              Όλα
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-4 text-gray-500">Φόρτωση...</div>
              ) : upcomingEvents.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Δεν υπάρχουν επερχόμενα events
                </div>
              ) : (
                upcomingEvents.map((event) => {
                  const IconComponent = event.icon;
                  return (
                    <div 
                      key={event.id} 
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                      onClick={() => navigate('/calendar')}
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
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Google Ads Section - Hidden until configured */}
        {false && (
          <Card className="border-0 shadow-sm bg-gray-50">
            <CardContent className="p-4 text-center">
              <div className="text-sm text-gray-500 mb-2">Διαφήμιση</div>
              <div className="h-24 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                <span className="text-gray-400 text-sm">Google Ads Space</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
