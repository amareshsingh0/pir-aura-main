import { useState, useEffect } from "react";

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  location: string;
}

const WEATHER_API_KEY = "YOUR_API_KEY"; // User needs to add their own
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!navigator.geolocation) {
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `${WEATHER_API_URL}?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
            );
            const data = await response.json();
            setWeather({
              temp: Math.round(data.main.temp),
              condition: data.weather[0].main,
              icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
              location: data.name,
            });
          } catch (error) {
            console.error("Weather fetch failed:", error);
          } finally {
            setLoading(false);
          }
        },
        () => {
          setLoading(false);
        }
      );
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  return { weather, loading };
};






