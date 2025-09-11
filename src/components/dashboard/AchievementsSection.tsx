import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Trophy } from 'lucide-react';
import { AchievementBadgeSkeleton } from '@/components/ui/skeletons';
import { AchievementBadge } from '@/components/gamification/AchievementBadge';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  badge_color: string;
}

interface UserAchievement {
  id: string;
  achievement_id: string;
  is_completed: boolean;
  progress: number;
}

interface AchievementsSectionProps {
  userAchievements: UserAchievement[];
  achievements: Achievement[];
  loading: boolean;
  onViewAll: () => void;
}

export const AchievementsSection = React.memo<AchievementsSectionProps>(({ 
  userAchievements, 
  achievements, 
  loading, 
  onViewAll 
}) => {
  return (
    <Card 
      className="bg-card border-border hover:shadow-lg transition-shadow duration-200"
      role="region"
      aria-label="Τμήμα επιτευγμάτων - πρόσφατα ολοκληρωμένα επιτεύγματα"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" aria-hidden="true" />
              Επιτεύγματα
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Η πρόοδός σας στα επιτεύγματα
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewAll}
            className="text-primary hover:text-primary-foreground"
            aria-label="Προβολή όλων των επιτευγμάτων"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <AchievementBadgeSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-3 min-h-[200px]">
            {achievements.length > 0 ? (
              achievements.slice(0, 4).map(achievement => {
                const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id);
                const progress = userAchievement?.progress || 0;
                const isCompleted = userAchievement?.is_completed || false;
                
                return (
                  <AchievementBadge
                    key={achievement.id}
                    title={achievement.title}
                    description={achievement.description}
                    icon={achievement.icon}
                    color={achievement.badge_color}
                    progress={progress}
                    isCompleted={isCompleted}
                    size="sm"
                  />
                );
              })
            ) : (
              <div className="text-center py-8 flex flex-col items-center justify-center h-[200px]">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  Δεν υπάρχουν διαθέσιμα επιτεύγματα
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Τα επιτεύγματα θα εμφανιστούν μόλις ξεκινήσετε να χρησιμοποιείτε την εφαρμογή
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
});

AchievementsSection.displayName = 'AchievementsSection';