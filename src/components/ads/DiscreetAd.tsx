import React from 'react';
import AdMobBanner from './AdMobBanner';
import { BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

interface DiscreetAdProps {
  className?: string;
}

const DiscreetAd: React.FC<DiscreetAdProps> = ({ className = '' }) => {
  return (
    <div className={`mt-4 mb-2 ${className}`}>
      <AdMobBanner 
        adId="ca-app-pub-3940256099942544/6300978111" // Test banner ad unit ID
        size={BannerAdSize.ADAPTIVE_BANNER}
        position={BannerAdPosition.TOP_CENTER}
        className="w-full"
      />
    </div>
  );
};

export default DiscreetAd;