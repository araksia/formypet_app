import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, isAfter, addDays } from 'date-fns';
import { el } from 'date-fns/locale';
import { getEventTypeLabel, getEventIcon } from '@/utils/eventUtils';
import { useOfflineStore } from './useOfflineStore';
import { useOnline } from './useOnline';

interface Stats {
  pets: number;
  medicalRecords: number;
  totalExpenses: number;
  familyMembers: number;
}

interface Pet {
  id: string;
  name: string;
  species: string;
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
  const [firstPet, setFirstPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { getItems } = useOfflineStore();
  const isOnline = useOnline();

  const loadStats = useMemo(() => async () => {
    if (!userId) return;

    try {
      let pets: any[] = [];
      let expenses: any[] = [];
      let familyMembers: any[] = [];

      if (isOnline) {
        // Online: Fetch from server
        const [petsResult, familyResult, expensesResult] = await Promise.all([
          supabase.from('pets').select('id, name, species').eq('owner_id', userId).order('created_at', { ascending: true }),
          supabase.from('pet_family_members').select('id').neq('user_id', userId).eq('status', 'accepted'),
          supabase.from('expenses').select('amount').eq('user_id', userId)
        ]);

        if (petsResult.error) throw petsResult.error;
        if (familyResult.error) throw familyResult.error;
        if (expensesResult.error) throw expensesResult.error;

        pets = petsResult.data || [];
        familyMembers = familyResult.data || [];
        expenses = expensesResult.data || [];
      } else {
        // Offline: Get from local store
        pets = await getItems('pets', { userId });
        expenses = await getItems('expenses', { userId });
        // Family members not implemented in offline store yet
        familyMembers = [];
      }

      // Set first pet if exists
      if (pets && pets.length > 0) {
        setFirstPet(pets[0]);
      } else {
        setFirstPet(null);
      }

      const totalExpenses = expenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;

      setStats({
        pets: pets?.length || 0,
        medicalRecords: 0, // We don't have medical records table yet
        totalExpenses,
        familyMembers: familyMembers?.length || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      
      // Fallback to offline data on error
      if (isOnline) {
        try {
          const pets = await getItems('pets', { userId });
          const expenses = await getItems('expenses', { userId });
          
          if (pets.length > 0) setFirstPet(pets[0]);
          
          const totalExpenses = expenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
          
          setStats({
            pets: pets?.length || 0,
            medicalRecords: 0,
            totalExpenses,
            familyMembers: 0
          });
        } catch (offlineError) {
          console.error('Offline fallback failed:', offlineError);
        }
      }
    }
  }, [userId, isOnline, getItems]);

  const loadUpcomingEvents = useMemo(() => async () => {
    if (!userId) return;

    try {
      const today = new Date();
      const nextMonth = addDays(new Date(), 30);

      console.log('🔍 Loading events between:', today.toISOString(), 'and', nextMonth.toISOString());

      let events: any[] = [];

      if (isOnline) {
        // Online: Fetch from server with joins
        const { data, error } = await supabase
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

        if (error) throw error;
        events = data || [];
      } else {
        // Offline: Get from local store and manually join with pets
        const allEvents = await getItems('events', { userId });
        const pets = await getItems('pets', { userId });
        
        // Filter by date range
        events = allEvents
          .filter(event => {
            const eventDate = new Date(event.event_date);
            return eventDate >= today && eventDate <= nextMonth;
          })
          .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
          .slice(0, 3)
          .map(event => ({
            ...event,
            pets: pets.find(pet => pet.id === event.pet_id)
          }));
      }

      console.log('📅 Events query result:', { events, count: events.length });

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
      
      // Fallback to offline data on error
      if (isOnline) {
        try {
          const allEvents = await getItems('events', { userId });
          const pets = await getItems('pets', { userId });
          
          const today = new Date();
          const nextMonth = addDays(new Date(), 30);
          
          const events = allEvents
            .filter(event => {
              const eventDate = new Date(event.event_date);
              return eventDate >= today && eventDate <= nextMonth;
            })
            .slice(0, 3);
            
          const formattedEvents = events.map(event => ({
            id: event.id,
            type: getEventTypeLabel(event.event_type),
            pet: pets.find(pet => pet.id === event.pet_id)?.name || 'Άγνωστο',
            date: format(new Date(event.event_date), 'dd MMM', { locale: el }),
            time: 'Όλη μέρα',
            icon: getEventIcon(event.event_type),
            urgent: isAfter(new Date(), new Date(event.event_date))
          }));
          
          setUpcomingEvents(formattedEvents);
        } catch (offlineError) {
          console.error('Offline fallback failed:', offlineError);
          setUpcomingEvents([]);
        }
      }
    }
  }, [userId, isOnline, getItems]);

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
    firstPet,
    loading,
    loadDashboardData
  };
};