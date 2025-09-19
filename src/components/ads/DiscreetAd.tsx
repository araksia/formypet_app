import React from 'react';
import GoogleAds from './GoogleAds';

interface DiscreetAdProps {
  className?: string;
}

const DiscreetAd: React.FC<DiscreetAdProps> = ({ className = '' }) => {
  return (
    <div className={`mt-8 mb-4 ${className}`}>
      <div className="max-w-md mx-auto">
        <div className="text-xs text-muted-foreground text-center mb-2 opacity-60">
          Διαφήμιση
        </div>
        <div className="bg-muted/30 rounded-lg border border-border/50 overflow-hidden">
          <GoogleAds 
            slotId="YOUR_AD_SLOT_ID"
            format="auto"
            className="min-h-[100px]"
          />
        </div>
      </div>
    </div>
  );
};

export default DiscreetAd;