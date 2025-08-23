import React, { useState } from 'react';
import { Trophy, Award, Target, Star, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AchievementBadge } from '@/components/gamification/AchievementBadge';
import { useGamification } from '@/hooks/useGamification';
import { Skeleton } from '@/components/ui/skeleton';

const AchievementsPage = () => {
  const { 
    achievements, 
    userAchievements, 
    loading, 
    getAchievementProgress,
    isAchievementCompleted 
  } = useGamification();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Όλα', icon: Star },
    { id: 'events', label: 'Εκδηλώσεις', icon: Target },
    { id: 'feeding', label: 'Φαγητό', icon: Trophy },
    { id: 'exercise', label: 'Άσκηση', icon: Award },
    { id: 'medical', label: 'Υγεία', icon: Trophy },
    { id: 'expenses', label: 'Έξοδα', icon: Award },
    { id: 'happiness', label: 'Ευτυχία', icon: Star }
  ];

  const filteredAchievements = achievements.filter(achievement => 
    selectedCategory === 'all' || achievement.category === selectedCategory
  );

  const completedCount = achievements.filter(isAchievementCompleted).length;
  const totalCount = achievements.length;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const recentAchievements = userAchievements
    .filter(ua => ua.is_completed)
    .sort((a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime())
    .slice(0, 3);

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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Επιτεύγματα</h1>
          <p className="text-muted-foreground">
            Παρακολουθήστε την πρόοδό σας και ξεκλειδώστε νέα badges
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          <Trophy className="h-4 w-4 mr-2" />
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
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="flex items-center space-x-1 text-xs"
              >
                <Icon className="h-3 w-3" />
                <span className="hidden sm:inline">{category.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAchievements.map(achievement => (
              <AchievementBadge
                key={achievement.id}
                title={achievement.title}
                description={achievement.description}
                icon={achievement.icon}
                color={achievement.badge_color}
                isCompleted={isAchievementCompleted(achievement)}
                progress={getAchievementProgress(achievement)}
                size="md"
              />
            ))}
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