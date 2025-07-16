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
const API_KEY = '8c8f4f5b7d0c8a5d4e6b3a2c9f1e8d7b'; // OpenWeatherMap API key

export class WeatherService {
  private static instance: WeatherService;

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

      // Get user's current position
      const position = await this.getCurrentPosition();
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      // Fetch weather data from OpenWeatherMap API
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=el`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const apiData = await response.json();
      
      // Map API response to our WeatherData interface
      const weatherData: WeatherData = {
        temperature: Math.round(apiData.main.temp),
        condition: apiData.weather[0].main.toLowerCase(),
        description: apiData.weather[0].description,
        humidity: apiData.main.humidity,
        windSpeed: Math.round(apiData.wind.speed * 3.6), // Convert m/s to km/h
        icon: apiData.weather[0].icon
      };

      // Cache the result
      this.setCachedWeather(weatherData, `${apiData.name}, ${apiData.sys.country}`);
      
      return weatherData;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      
      // If geolocation fails or API is down, return demo data as fallback
      const demoData = this.getDemoWeatherData();
      this.setCachedWeather(demoData, 'Demo Location (Location access denied)');
      return demoData;
    }
  }

  getWalkRecommendation(weatherData: WeatherData): {
    message: string;
    type: 'good' | 'warning' | 'danger';
    icon: string;
  } {
    const { temperature, condition } = weatherData;

    // Handle different rain conditions
    if (condition === 'rain' || condition === 'drizzle' || condition === 'thunderstorm') {
      return {
        message: 'Βρέχει! Δεν είναι καλή ώρα για βόλτα',
        type: 'danger',
        icon: 'cloud-rain'
      };
    }

    // Handle snow conditions  
    if (condition === 'snow') {
      return {
        message: 'Χιονίζει! Πρόσεχε στη βόλτα',
        type: 'warning',
        icon: 'thermometer-snowflake'
      };
    }

    // Temperature-based recommendations
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