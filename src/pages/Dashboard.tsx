
import React, { useEffect } from 'react';
import Header from '@/components/Header';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-content" 
        className="skip-to-main"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            document.getElementById('main-content')?.focus();
          }
        }}
      >
        Μετάβαση στο κύριο περιεχόμενο
      </a>
      
      <Header title="For My Pet" />
      
      <main 
        id="main-content"
        className="p-4 space-y-6"
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
      </main>
    </div>
  );
};

export default Dashboard;
