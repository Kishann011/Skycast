/**
 * Requires WEATHER_API_KEY and WEATHER_BASE from config.js
 */

async function geocodeCity(cityName) {
  const url = `${WEATHER_BASE}/geo/1.0/direct?q=${encodeURIComponent(
    cityName
  )}&limit=1&appid=${WEATHER_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("City lookup failed");
  const data = await res.json();
  if (!data.length) throw new Error("City not found");
  return { lat: data[0].lat, lon: data[0].lon, name: data[0].name };
}

async function fetchCurrentWeather(lat, lon) {
  const url = `${WEATHER_BASE}/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Weather request failed");
  }
  return res.json();
}

async function fetchAirPollution(lat, lon) {
  const url = `${WEATHER_BASE}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Air quality request failed");
  return res.json();
}

async function fetchForecast(lat, lon) {
  const url = `${WEATHER_BASE}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Forecast request failed");
  return res.json();
}

/** OpenWeather AQI index 1–5 */
function aqiLabel(aqi) {
  const labels = {
    1: "Good",
    2: "Fair",
    3: "Moderate",
    4: "Poor",
    5: "Very Poor",
  };
  return labels[aqi] || "—";
}
