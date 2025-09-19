import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface Pet {
  id: string;
  name: string;
  species: string;
}

interface WelcomeBannerProps {
  userName?: string;
  firstPet?: Pet | null;
}

export const WelcomeBanner = React.memo<WelcomeBannerProps>(({ userName, firstPet }) => {
  const displayName = userName?.split('@')[0] || 'φίλε μου';
  const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

  // Get animal emoji based on species
  const getAnimalEmoji = (species?: string) => {
    if (!species) return '🐕‍🦺';
    
    const lowerSpecies = species.toLowerCase();
    if (lowerSpecies.includes('γάτα') || lowerSpecies.includes('cat')) return '🐱';
    if (lowerSpecies.includes('σκύλος') || lowerSpecies.includes('dog')) return '🐕‍🦺';
    if (lowerSpecies.includes('πουλί') || lowerSpecies.includes('bird')) return '🐦';
    if (lowerSpecies.includes('ψάρι') || lowerSpecies.includes('fish')) return '🐠';
    if (lowerSpecies.includes('κουνέλι') || lowerSpecies.includes('rabbit')) return '🐰';
    if (lowerSpecies.includes('χάμστερ') || lowerSpecies.includes('hamster')) return '🐹';
    return '🐾'; // Generic pet emoji for unknown species
  };

  const petName = firstPet?.name || 'Μπάτμαν';
  const petAge = firstPet ? '' : '3 ετών';
  const animalEmoji = getAnimalEmoji(firstPet?.species);
  
  return (
    <Card 
      className="bg-gradient-to-r from-primary to-primary/80 border-0 overflow-hidden"
      role="banner"
      aria-label="Καλωσόρισμα με χαρακτήρα σκύλου"
    >
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Speech Bubble */}
            <div 
              className="bg-white rounded-2xl p-4 relative max-w-xs shadow-lg"
              role="img"
              aria-label="Μήνυμα από τον σκύλο Μπάτμαν"
            >
              <p className="text-gray-800 text-sm leading-relaxed">
                {firstPet 
                  ? `"Γεια σου ${capitalizedName}! Επιτέλους κατέβασες το ForMyPet και δε θα ξαναχάσω ραντεβού!"` 
                  : `"Γεια σου ${capitalizedName}! Ευτυχώς που κατέβασες το ForMyPet επιτέλους και δε θα ξαναχάσουμε ραντεβού!"`
                }
              </p>
              {/* Speech bubble tail pointing right */}
              <div className="absolute top-4 right-0 w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-l-[12px] border-l-white transform translate-x-full"></div>
            </div>
          </div>
          
          {/* Pet Character */}
          <div className="flex flex-col items-center ml-6">
            <div className="text-5xl mb-2 animate-bounce">{animalEmoji}</div>
            <div className="text-white/90 text-xs text-center font-medium">
              {petName}
              {petAge && <><br />{petAge}</>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

WelcomeBanner.displayName = 'WelcomeBanner';