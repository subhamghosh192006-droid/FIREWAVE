export interface LiveWeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  source: 'Open-Meteo Live API' | 'Simulated Historical';
  timestamp: string;
}

/**
 * Fetches real-time meteorological observations using Open-Meteo API
 */
export async function fetchLiveWeather(lat: number, lng: number): Promise<LiveWeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m&wind_speed_unit=kmh`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Open-Meteo returned status ${res.status}`);
    }

    const data = await res.json();
    const current = data.current;

    return {
      temperature: Math.round(current.temperature_2m),
      humidity: Math.round(current.relative_humidity_2m),
      windSpeed: Math.round(current.wind_speed_10m),
      windDirection: Math.round(current.wind_direction_10m),
      source: 'Open-Meteo Live API',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
  } catch (err) {
    console.warn('Live weather fetch failed, falling back to local simulation:', err);
    throw err;
  }
}
