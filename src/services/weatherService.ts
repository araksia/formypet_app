interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface WeatherCache {
  data: WeatherData;
  timestamp: number;
  location: string;
}

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const CACHE_KEY = 'weather_cache';

export class WeatherService {
  private static instance: WeatherService;
  private apiKey: string = 'demo'; // Will use demo data until API key is configured

  public static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  private getCachedWeather(): WeatherCache | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const cacheData: WeatherCache = JSON.parse(cached);
        const now = Date.now();
        if (now - cacheData.timestamp < CACHE_DURATION) {
          return cacheData;
        }
      }
    } catch (error) {
      console.error('Error reading weather cache:', error);
    }
    return null;
  }

  private setCachedWeather(data: WeatherData, location: string): void {
    try {
      const cacheData: WeatherCache = {
        data,
        timestamp: Date.now(),
        location
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching weather data:', error);
    }
  }

  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    });
  }

  private getDemoWeatherData(): WeatherData {
    // Demo data for development - cycles through different conditions
    const conditions = [
      { temp: 25, condition: 'clear', desc: 'Καθαρός ουρανός', icon: '01d' },
      { temp: 15, condition: 'rain', desc: 'Βροχή', icon: '10d' },
      { temp: 35, condition: 'hot', desc: 'Πολύ ζέστη', icon: '01d' },
      { temp: 2, condition: 'cold', desc: 'Πολύ κρύο', icon: '13d' }
    ];
    
    const index = Math.floor(Date.now() / (1000 * 60 * 5)) % conditions.length; // Change every 5 minutes for demo
    const selected = conditions[index];
    
    return {
      temperature: selected.temp,
      condition: selected.condition,
      description: selected.desc,
      humidity: 65,
      windSpeed: 5.2,
      icon: selected.icon
    };
  }

  async getWeatherData(): Promise<WeatherData> {
    try {
      // Check cache first
      const cached = this.getCachedWeather();
      if (cached) {
        return cached.data;
      }

      // For demo purposes, return demo data
      if (this.apiKey === 'demo') {
        const demoData = this.getDemoWeatherData();
        this.setCachedWeather(demoData, 'Demo Location');
        return demoData;
      }

      // In production, this would make actual API calls
      // const position = await this.getCurrentPosition();
      // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${this.apiKey}&units=metric&lang=el`);
      // const data = await response.json();
      // ... process real API data

      return this.getDemoWeatherData();
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return this.getDemoWeatherData(); // Fallback to demo data
    }
  }

  getWalkRecommendation(weatherData: WeatherData): {
    message: string;
    type: 'good' | 'warning' | 'danger';
    icon: string;
  } {
    const { temperature, condition } = weatherData;

    if (condition === 'rain' || condition.includes('rain')) {
      return {
        message: 'Βρέχει! Δεν είναι καλή ώρα για βόλτα',
        type: 'danger',
        icon: 'cloud-rain'
      };
    }

    if (temperature > 30) {
      return {
        message: 'Πολύ ζέστη! Περίμενε το απόγευμα για βόλτα',
        type: 'warning',
        icon: 'thermometer-sun'
      };
    }

    if (temperature < 5) {
      return {
        message: 'Πολύ κρύο! Φρόντισε το κουτάβι σου',
        type: 'warning',
        icon: 'thermometer-snowflake'
      };
    }

    return {
      message: 'Τέλειος καιρός για βόλτα!',
      type: 'good',
      icon: 'sun'
    };
  }
}

export const weatherService = WeatherService.getInstance();