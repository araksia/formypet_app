import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Award, Target, Star, Filter, Dog } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AchievementBadge } from '@/components/gamification/AchievementBadge';
import { useGamification } from '@/hooks/useGamification';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

const AchievementsPage = () => {
  const { 
    achievements, 
    userAchievements, 
    loading, 
    getAchievementProgress,
    isAchievementCompleted 
  } = useGamification();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPet, setSelectedPet] = useState<string>('all');
  const [pets, setPets] = useState<any[]>([]);
  
  // Load user pets
  useEffect(() => {
    const loadPets = async () => {
      try {
        const { data } = await supabase.from('pets').select('id, name').order('name');
        setPets(data || []);
      } catch (error) {
        console.error('Error loading pets:', error);
      }
    };
    loadPets();
  }, []);

  const categories = [
    { id: 'all', label: 'Όλα', icon: Star },
    { id: 'events', label: 'Εκδηλώσεις', icon: Target },
    { id: 'feeding', label: 'Φαγητό', icon: Trophy },
    { id: 'exercise', label: 'Άσκηση', icon: Award },
    { id: 'medical', label: 'Υγεία', icon: Trophy },
    { id: 'expenses', label: 'Έξοδα', icon: Award },
    { id: 'happiness', label: 'Ευτυχία', icon: Star }
  ];

  const filteredAchievements = useMemo(() => {
    return achievements.filter(achievement => {
      const categoryMatch = selectedCategory === 'all' || achievement.category === selectedCategory;
      
      if (selectedPet === 'all') return categoryMatch;
      
      // Check if this achievement has user progress for the selected pet
      const userAchievement = userAchievements.find(ua => 
        ua.achievement_id === achievement.id && ua.pet_id === selectedPet
      );
      
      return categoryMatch && userAchievement;
    });
  }, [achievements, selectedCategory, selectedPet, userAchievements]);

  const { completedCount, totalCount, completionPercentage, recentAchievements } = useMemo(() => {
    const completed = achievements.filter(isAchievementCompleted).length;
    const total = achievements.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    const recent = userAchievements
      .filter(ua => ua.is_completed)
      .sort((a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime())
      .slice(0, 3);
      
    return {
      completedCount: completed,
      totalCount: total,
      completionPercentage: percentage,
      recentAchievements: recent
    };
  }, [achievements, userAchievements, isAchievementCompleted]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Παρακολουθήστε την πρόοδό σας και ξεκλειδώστε νέα badges
          </p>
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1 w-fit">
          <Trophy className="h-3 w-3 mr-1" />
          {completedCount}/{totalCount}
        </Badge>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Συνολική Πρόοδος</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Ολοκληρωμένα Επιτεύγματα</span>
              <span className="font-semibold">{Math.round(completionPercentage)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            
            {/* Recent Achievements */}
            {recentAchievements.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">Πρόσφατα Επιτεύγματα</h4>
                <div className="flex flex-wrap gap-2">
                  {recentAchievements.map(ua => (
                    <Badge key={ua.id} variant="default" className="text-xs">
                      ✨ {ua.achievement?.title}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Categories and Achievements */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <div className="flex flex-col space-y-4">
          {/* Pet Filter */}
          {pets.length > 1 && (
            <div className="overflow-x-auto">
              <div className="flex gap-2 min-w-max pb-2">
                <Button
                  variant={selectedPet === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPet('all')}
                  className="text-xs flex-shrink-0"
                >
                  <Star className="h-3 w-3 mr-1" />
                  Όλα τα ζώα
                </Button>
                {pets.map(pet => (
                  <Button
                    key={pet.id}
                    variant={selectedPet === pet.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPet(pet.id)}
                    className="text-xs flex-shrink-0"
                  >
                    <Dog className="h-3 w-3 mr-1" />
                    {pet.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {/* Category Tabs - Mobile Responsive */}
          <div className="overflow-x-auto">
            <TabsList className="grid w-full min-w-max grid-cols-7 gap-1">
              {categories.map(category => {
                const Icon = category.icon;
                return (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="flex flex-col items-center justify-center p-2 min-w-[60px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Icon className="h-3 w-3 mb-1" />
                    <span className="text-[10px] leading-tight text-center">{category.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
        </div>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAchievements.map(achievement => {
              const userAchievement = selectedPet === 'all' 
                ? userAchievements.find(ua => ua.achievement_id === achievement.id)
                : userAchievements.find(ua => ua.achievement_id === achievement.id && ua.pet_id === selectedPet);
              
              const petName = userAchievement?.pet_id 
                ? pets.find(p => p.id === userAchievement.pet_id)?.name 
                : null;

              return (
                <AchievementBadge
                  key={`${achievement.id}-${selectedPet}`}
                  title={achievement.title}
                  description={petName ? `${achievement.description} (${petName})` : achievement.description}
                  icon={achievement.icon}
                  color={achievement.badge_color}
                  isCompleted={userAchievement?.is_completed || false}
                  progress={userAchievement?.progress || 0}
                  size="md"
                />
              );
            })}
          </div>

          {filteredAchievements.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">
                Δεν βρέθηκαν επιτεύγματα
              </h3>
              <p className="text-sm text-muted-foreground">
                Δοκιμάστε άλλη κατηγορία ή ξεκινήστε να φροντίζετε τα κατοικίδιά σας!
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AchievementsPage;