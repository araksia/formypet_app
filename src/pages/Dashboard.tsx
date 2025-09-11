
import React, { useEffect } from 'react';
import { PawPrint, Calendar, Euro, Users, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { useGamification } from '@/hooks/useGamification';
import { useDashboardData } from '@/hooks/useDashboardData';
import { StatsCardSkeleton } from '@/components/ui/skeletons';

// Dashboard components
import {
  WelcomeBanner,
  QuickActions,
  StatsSection,
  AchievementsSection,
  UpcomingEventsSection
} from '@/components/dashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userAchievements, achievements, loading: achievementsLoading } = useGamification();
  const { stats, upcomingEvents, firstPet, loading, loadDashboardData } = useDashboardData(user?.id);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, loadDashboardData]);

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
      label: 'Προφίλ', 
      action: () => navigate('/profile'),
      color: 'bg-purple-500'
    },
  ];

  const statsData = [
    { label: 'Κατοικίδια', value: stats.pets.toString(), icon: PawPrint },
    { label: 'Ιατρικά Αρχεία', value: stats.medicalRecords.toString(), icon: FileText },
    { label: 'Συνολικά Έξοδα', value: `€${stats.totalExpenses.toFixed(2)}`, icon: Euro },
    // Temporarily hidden - Family member functionality
    // { label: 'Μέλη Οικογένειας', value: stats.familyMembers.toString(), icon: Users },
  ];

  const handleEventClick = (eventId: string) => {
    navigate(`/add-event?edit=${eventId}`);
  };

  const handleViewAllEvents = () => {
    navigate('/calendar');
  };

  const handleViewAllAchievements = () => {
    navigate('/achievements');
  };

  return (
    <div 
      id="main-content"
      className="space-y-6"
      role="main"
      aria-label="Κεντρική σελίδα εφαρμογής"
      tabIndex={-1}
    >
      <WelcomeBanner 
        userName={user?.email || user?.user_metadata?.display_name} 
        firstPet={firstPet}
      />

      <QuickActions actions={quickActions} />

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(3)].map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <StatsSection statsData={statsData} />
      )}

      <AchievementsSection 
        userAchievements={userAchievements}
        achievements={achievements}
        loading={achievementsLoading}
        onViewAll={handleViewAllAchievements}
      />

      <UpcomingEventsSection
        events={upcomingEvents}
        loading={loading}
        onViewAll={handleViewAllEvents}
        onEventClick={handleEventClick}
        onAddEvent={() => navigate('/add-event')}
      />
    </div>
  );
};

export default Dashboard;
