import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Trophy } from 'lucide-react';
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
  if (loading) {
    return (
      <section aria-labelledby="achievements-heading">
        <div className="flex items-center justify-between mb-4">
          <h3 id="achievements-heading" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" aria-hidden="true" />
            Πρόσφατα Επιτεύγματα
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary focus-enhanced"
            onClick={onViewAll}
            aria-label="Προβολή όλων των επιτευγμάτων"
          >
            Όλα <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 bg-muted rounded-lg animate-pulse">
              <div className="h-8 w-8 bg-muted-foreground/20 rounded-full mb-2" />
              <div className="h-4 bg-muted-foreground/20 rounded w-3/4 mb-1" />
              <div className="h-3 bg-muted-foreground/20 rounded w-1/2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const completedAchievements = userAchievements.filter(ua => ua.is_completed);

  return (
    <section aria-labelledby="achievements-heading">
      <div className="flex items-center justify-between mb-4">
        <h3 id="achievements-heading" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" aria-hidden="true" />
          Πρόσφατα Επιτεύγματα
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary focus-enhanced"
          onClick={onViewAll}
          aria-label="Προβολή όλων των επιτευγμάτων"
        >
          Όλα <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3" role="grid" aria-label="Πρόσφατα επιτεύγματα">
        {completedAchievements
          .slice(0, 4)
          .map((userAchievement) => {
            const achievement = achievements.find(a => a.id === userAchievement.achievement_id);
            return achievement ? (
              <AchievementBadge
                key={userAchievement.id}
                title={achievement.title}
                description={achievement.description}
                icon={achievement.icon}
                color={achievement.badge_color}
                isCompleted={true}
                size="sm"
              />
            ) : null;
          })
        }
        {completedAchievements.length === 0 && (
          <div className="col-span-2 text-center py-4 text-gray-500">
            <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Κανένα επίτευγμα ακόμα</p>
            <p className="text-xs">Ξεκινήστε να φροντίζετε τα κατοικίδιά σας!</p>
          </div>
        )}
      </div>
    </section>
  );
});

AchievementsSection.displayName = 'AchievementsSection';