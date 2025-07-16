import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  ThermometerSun, 
  ThermometerSnowflake,
  Wind,
  Droplets,
  Loader2,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { weatherService } from '@/services/weatherService';

interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

export const WeatherBanner = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      setLocationDenied(false);
      
      const data = await weatherService.getWeatherData();
      setWeatherData(data);
      
      // Check if we're using real location data or demo data
      const cached = localStorage.getItem('weather_cache');
      console.log('Weather cache data:', cached);
      
      if (cached) {
        const cacheData = JSON.parse(cached);
        console.log('Parsed cache location:', cacheData.location);
        
        // Only show warning if explicitly denied location access
        const isDemoData = cacheData.location.includes('Location access denied') || 
                          cacheData.location.includes('Demo Location');
        
        console.log('Is demo data?', isDemoData);
        setLocationDenied(isDemoData);
      }
    } catch (err) {
      setError('Δεν μπόρεσα να φορτώσω τα δεδομένα καιρού');
      console.error('Weather loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshLocation = () => {
    // Clear cache to force fresh location request
    console.log('Clearing weather cache and requesting fresh location');
    localStorage.removeItem('weather_cache');
    loadWeatherData();
  };

  const getWeatherIcon = (condition: string, size: number = 24) => {
    const iconProps = { size, className: "flex-shrink-0" };
    
    switch (condition.toLowerCase()) {
      case 'clear':
        return <Sun {...iconProps} className={`${iconProps.className} text-yellow-500`} />;
      case 'rain':
        return <CloudRain {...iconProps} className={`${iconProps.className} text-blue-500`} />;
      case 'snow':
        return <CloudSnow {...iconProps} className={`${iconProps.className} text-blue-200`} />;
      case 'clouds':
        return <Cloud {...iconProps} className={`${iconProps.className} text-gray-500`} />;
      default:
        return <Sun {...iconProps} className={`${iconProps.className} text-yellow-500`} />;
    }
  };

  const getWeatherGradient = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
      case 'hot':
        return 'bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20';
      case 'rain':
        return 'bg-gradient-to-r from-blue-100 to-gray-100 dark:from-blue-900/20 dark:to-gray-900/20';
      case 'snow':
      case 'cold':
        return 'bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20';
      default:
        return 'bg-gradient-to-r from-gray-100 to-blue-100 dark:from-gray-900/20 dark:to-blue-900/20';
    }
  };

  const getRecommendationIcon = (iconName: string) => {
    const iconProps = { size: 20, className: "flex-shrink-0" };
    
    switch (iconName) {
      case 'cloud-rain':
        return <CloudRain {...iconProps} />;
      case 'thermometer-sun':
        return <ThermometerSun {...iconProps} />;
      case 'thermometer-snowflake':
        return <ThermometerSnowflake {...iconProps} />;
      case 'sun':
        return <Sun {...iconProps} />;
      default:
        return <Sun {...iconProps} />;
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Φορτώνω δεδομένα καιρού...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !weatherData) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="text-center text-sm text-muted-foreground">
            Δεν μπόρεσα να φορτώσω τον καιρό
          </div>
        </CardContent>
      </Card>
    );
  }

  const recommendation = weatherService.getWalkRecommendation(weatherData);

  return (
    <Card className={`border-0 shadow-sm ${getWeatherGradient(weatherData.condition)}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Weather Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getWeatherIcon(weatherData.condition, 32)}
              <div>
                <div className="text-lg font-semibold">
                  {weatherData.temperature}°C
                </div>
                <div className="text-sm text-muted-foreground">
                  {weatherData.description}
                </div>
              </div>
            </div>

            <div className="flex space-x-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Wind size={14} />
                <span>{weatherData.windSpeed} km/h</span>
              </div>
              <div className="flex items-center space-x-1">
                <Droplets size={14} />
                <span>{weatherData.humidity}%</span>
              </div>
            </div>
          </div>

          {/* Location Denied Warning */}
          {locationDenied && (
            <Alert className="border-0 bg-blue-50 dark:bg-blue-900/20 mb-2">
              <AlertDescription className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin size={16} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    Χρησιμοποιώ δεδομένα demo - Ενεργοποίησε την τοποθεσία για πραγματικό καιρό
                  </span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleRefreshLocation}
                  className="ml-2 h-6 px-2 text-xs border-blue-200 hover:bg-blue-100"
                >
                  <RefreshCw size={12} className="mr-1" />
                  Δοκίμασε ξανά
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Walk Recommendation */}
          <Alert className={`border-0 ${
            recommendation.type === 'good' 
              ? 'bg-green-50 dark:bg-green-900/20' 
              : recommendation.type === 'warning'
              ? 'bg-yellow-50 dark:bg-yellow-900/20'
              : 'bg-red-50 dark:bg-red-900/20'
          }`}>
            <AlertDescription className="flex items-center space-x-2">
              {getRecommendationIcon(recommendation.icon)}
              <span className={`text-sm font-medium ${
                recommendation.type === 'good' 
                  ? 'text-green-700 dark:text-green-300' 
                  : recommendation.type === 'warning'
                  ? 'text-yellow-700 dark:text-yellow-300'
                  : 'text-red-700 dark:text-red-300'
              }`}>
                {recommendation.message}
              </span>
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
};