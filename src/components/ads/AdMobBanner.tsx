import React, { useEffect, useState } from 'react';
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

interface AdMobBannerProps {
  adId: string;
  size?: BannerAdSize;
  position?: BannerAdPosition;
  className?: string;
}

const AdMobBanner: React.FC<AdMobBannerProps> = ({ 
  adId, 
  size = BannerAdSize.BANNER,
  position = BannerAdPosition.BOTTOM_CENTER,
  className = ''
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const showBanner = async () => {
      try {
        // Initialize AdMob
        await AdMob.initialize({
          testingDevices: ['YOUR_TEST_DEVICE_ID'], // Add your test device ID
          initializeForTesting: true, // Remove in production
        });

        const options: BannerAdOptions = {
          adId: adId,
          adSize: size,
          position: position,
          margin: 0,
          isTesting: true, // Set to false in production
        };

        await AdMob.showBanner(options);
        setIsLoaded(true);
        console.log('AdMob banner loaded successfully');
      } catch (err) {
        console.error('AdMob banner error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    showBanner();

    // Cleanup function
    return () => {
      AdMob.hideBanner().catch(console.error);
    };
  }, [adId, size, position]);

  if (error) {
    return (
      <div className={`text-center py-2 ${className}`}>
        <div className="text-[10px] text-muted-foreground opacity-50">
          Διαφήμιση (Error: {error})
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`text-center py-2 ${className}`}>
        <div className="text-[10px] text-muted-foreground opacity-50">
          Φόρτωση διαφήμισης...
        </div>
      </div>
    );
  }

  // AdMob banner will be displayed by the native layer
  return (
    <div className={`text-center py-1 ${className}`}>
      <div className="text-[8px] text-muted-foreground opacity-30">
        Διαφήμιση
      </div>
    </div>
  );
};

export default AdMobBanner;