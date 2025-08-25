import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  condition_type: string;
  condition_value: number;
  condition_data: any;
  badge_color: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  pet_id?: string;
  earned_at: string;
  progress: number;
  is_completed: boolean;
  achievement?: Achievement;
}

export interface PetStreak {
  id: string;
  pet_id: string;
  user_id: string;
  streak_type: string;
  current_count: number;
  best_count: number;
  last_activity_date: string;
  is_active: boolean;
}

export interface HappinessLog {
  id: string;
  pet_id: string;
  user_id: string;
  happiness_score: number;
  factors: any;
  recorded_at: string;
}

export const useGamification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  // Load achievements and user progress
  const loadAchievements = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load all achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('created_at');

      if (achievementsError) throw achievementsError;

      // Load user achievements with achievement details
      const { data: userAchievementsData, error: userError } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (userError) throw userError;

      setAchievements(achievementsData || []);
      setUserAchievements(userAchievementsData || []);

    } catch (error) {
      console.error('Error loading achievements:', error);
      toast({
        title: 'Σφάλμα',
        description: 'Δεν ήταν δυνατή η φόρτωση των επιτευγμάτων',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Get pet happiness score
  const getPetHappiness = async (petId: string): Promise<number> => {
    try {
      const { data, error } = await supabase.rpc('calculate_pet_happiness', {
        pet_id_param: petId
      });

      if (error) throw error;
      return data || 50;
    } catch (error) {
      console.error('Error calculating pet happiness:', error);
      return 50;
    }
  };

  // Get pet streaks
  const getPetStreaks = async (petId: string): Promise<PetStreak[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('pet_streaks')
        .select('*')
        .eq('pet_id', petId)
        .eq('user_id', user.id)
        .order('streak_type');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading pet streaks:', error);
      return [];
    }
  };

  // Get happiness history for a pet
  const getHappinessHistory = async (petId: string, days: number = 30): Promise<HappinessLog[]> => {
    try {
      const { data, error } = await supabase
        .from('pet_happiness_log')
        .select('*')
        .eq('pet_id', petId)
        .gte('recorded_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('recorded_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading happiness history:', error);
      return [];
    }
  };

  // Check and award achievements
  const checkAchievements = async () => {
    if (!user) return;

    try {
      // This would typically be handled by database triggers
      // but we can also manually check for achievements
      // For now, we'll just reload the achievements
      await loadAchievements();
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  // Get achievement progress for display
  const getAchievementProgress = (achievement: Achievement): number => {
    const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id);
    if (userAchievement?.is_completed) return 100;
    
    return userAchievement?.progress || 0;
  };

  // Check if achievement is completed
  const isAchievementCompleted = (achievement: Achievement): boolean => {
    const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id);
    return userAchievement?.is_completed || false;
  };

  useEffect(() => {
    loadAchievements();
  }, [user]);

  return {
    achievements,
    userAchievements,
    loading,
    getPetHappiness,
    getPetStreaks,
    getHappinessHistory,
    checkAchievements,
    getAchievementProgress,
    isAchievementCompleted,
    loadAchievements
  };
};