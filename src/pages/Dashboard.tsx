
import React, { useEffect } from 'react';
import { PawPrint, Calendar, Euro, Users, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { useGamification } from '@/hooks/useGamification';
import { useDashboardData } from '@/hooks/useDashboardData';

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
  const { stats, upcomingEvents, loading, loadDashboardData } = useDashboardData(user?.id);

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
    // Temporarily hidden - Family member functionality
    // { 
    //   icon: Users, 
    //   label: 'Νέο Μέλος Οικογένειας', 
    //   action: () => navigate('/add-family-member'),
    //   color: 'bg-purple-500'
    // },
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
      <WelcomeBanner />

      <QuickActions actions={quickActions} />

      <StatsSection statsData={statsData} />

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
      />
    </div>
  );
};

export default Dashboard;
