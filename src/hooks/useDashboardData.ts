import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, isAfter, addDays } from 'date-fns';
import { el } from 'date-fns/locale';
import { getEventTypeLabel, getEventIcon } from '@/utils/eventUtils';

interface Stats {
  pets: number;
  medicalRecords: number;
  totalExpenses: number;
  familyMembers: number;
}

interface UpcomingEvent {
  id: string;
  type: string;
  pet: string;
  date: string;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
  urgent: boolean;
}

export const useDashboardData = (userId: string | undefined) => {
  const [stats, setStats] = useState<Stats>({
    pets: 0,
    medicalRecords: 0,
    totalExpenses: 0,
    familyMembers: 0
  });
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStats = useMemo(() => async () => {
    if (!userId) return;

    try {
      // Get pets count
      const { data: pets, error: petsError } = await supabase
        .from('pets')
        .select('id')
        .eq('owner_id', userId);

      if (petsError) throw petsError;

      // Get family members count (excluding owner)
      const { data: familyMembers, error: familyError } = await supabase
        .from('pet_family_members')
        .select('id')
        .neq('user_id', userId)
        .eq('status', 'accepted');

      if (familyError) throw familyError;

      // Get total expenses
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', userId);

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
  }, [userId]);

  const loadUpcomingEvents = useMemo(() => async () => {
    if (!userId) return;

    try {
      const today = new Date();
      const nextMonth = addDays(new Date(), 30);

      console.log('🔍 Loading events between:', today.toISOString(), 'and', nextMonth.toISOString());

      // Get upcoming events with pet information using join
      const { data: events, error } = await supabase
        .from('events')
        .select(`
          id, 
          title, 
          event_type, 
          event_date, 
          event_time, 
          pet_id,
          pets (
            name
          )
        `)
        .gte('event_date', today.toISOString().split('T')[0])
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

      const formattedEvents = events.map(event => {
        // The event_time is now stored as local time, so we can use it directly
        let formattedTime = 'Όλη μέρα';
        if (event.event_time) {
          const [hours, minutes] = event.event_time.split(':');
          const hour = parseInt(hours);
          const isPM = hour >= 12;
          const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
          const period = isPM ? 'μ.μ.' : 'π.μ.';
          formattedTime = `${displayHour}:${minutes} ${period}`;
        }

        return {
          id: event.id,
          type: getEventTypeLabel(event.event_type),
          pet: event.pets?.name || 'Άγνωστο',
          date: format(new Date(event.event_date), 'dd MMM', { locale: el }),
          time: formattedTime,
          icon: getEventIcon(event.event_type),
          urgent: isAfter(new Date(), new Date(event.event_date))
        };
      });

      console.log('📋 Formatted events:', formattedEvents);
      setUpcomingEvents(formattedEvents);
    } catch (error) {
      console.error('💥 Error loading upcoming events:', error);
      setUpcomingEvents([]);
    }
  }, [userId]);

  const loadDashboardData = useMemo(() => async () => {
    if (!userId) return;
    
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
  }, [userId, loadStats, loadUpcomingEvents]);

  return {
    stats,
    upcomingEvents,
    loading,
    loadDashboardData
  };
};