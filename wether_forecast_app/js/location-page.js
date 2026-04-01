(function () {
  const geoBtn = document.getElementById("geo-btn");
  const coordsLine = document.getElementById("coords-line");
  const errEl = document.getElementById("loc-error");
  const weatherBox = document.getElementById("loc-weather");
  const statsBox = document.getElementById("loc-stats");
  const locName = document.getElementById("loc-name");
  const locDesc = document.getElementById("loc-desc");
  const locIcon = document.getElementById("loc-icon");
  const locTemp = document.getElementById("loc-temp");
  const locFeels = document.getElementById("loc-feels");
  const locHum = document.getElementById("loc-hum");
  const locAqi = document.getElementById("loc-aqi");

  const MAIN_TO_BG = {
    Clear: "bg-clear",
    Clouds: "bg-clouds",
    Rain: "bg-rain",
    Drizzle: "bg-drizzle",
    Thunderstorm: "bg-thunderstorm",
    Snow: "bg-snow",
    Mist: "bg-mist",
    Fog: "bg-fog",
    Haze: "bg-haze",
    Smoke: "bg-mist",
    Dust: "bg-mist",
    Sand: "bg-mist",
    Ash: "bg-mist",
    Squall: "bg-rain",
    Tornado: "bg-thunderstorm",
  };

  const BG_CLASSES = [
    "bg-clear",
    "bg-clouds",
    "bg-rain",
    "bg-drizzle",
    "bg-thunderstorm",
    "bg-snow",
    "bg-mist",
    "bg-fog",
    "bg-haze",
    "bg-default",
  ];

  function setBg(main) {
    BG_CLASSES.forEach((c) => document.body.classList.remove(c));
    document.body.classList.add(MAIN_TO_BG[main] || "bg-default");
  }

  function showErr(t) {
    errEl.textContent = t || "";
    errEl.classList.toggle("visible", !!t);
  }

  geoBtn.addEventListener("click", () => {
    if (!WEATHER_API_KEY || WEATHER_API_KEY === "YOUR_API_KEY_HERE") {
      showErr("Set your API key in js/config.js.");
      return;
    }
    showErr("");
    geoBtn.disabled = true;
    geoBtn.textContent = "Locating…";

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        coordsLine.textContent = `Latitude ${lat.toFixed(4)}, longitude ${lon.toFixed(4)}`;

        try {
          const [weather, air] = await Promise.all([
            fetchCurrentWeather(lat, lon),
            fetchAirPollution(lat, lon).catch(() => null),
          ]);

          const main = weather.weather && weather.weather[0];
          setBg(main ? main.main : "Clouds");

          const name =
            weather.name ||
            `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
          locName.textContent = name + (weather.sys && weather.sys.country ? ", " + weather.sys.country : "");
          locDesc.textContent = main ? main.description : "";
          locIcon.src = `https://openweathermap.org/img/wn/${main.icon}@4x.png`;
          locIcon.alt = main ? main.description : "";
          locTemp.innerHTML = `${Math.round(weather.main.temp)}<span class="unit">°C</span>`;
          locFeels.textContent = `${Math.round(weather.main.feels_like)}°C`;
          locHum.textContent = `${weather.main.humidity}%`;
          if (air && air.list && air.list[0] && air.list[0].main) {
            const idx = air.list[0].main.aqi;
            locAqi.textContent = `${aqiLabel(idx)} (${idx}/5)`;
          } else {
            locAqi.textContent = "—";
          }

          weatherBox.style.display = "block";
          statsBox.style.display = "grid";
        } catch (e) {
          showErr(e.message || "Weather failed.");
        } finally {
          geoBtn.disabled = false;
          geoBtn.textContent = "Use my current location";
        }
      },
      (geoErr) => {
        showErr(geoErr.message || "Location permission denied or unavailable.");
        geoBtn.disabled = false;
        geoBtn.textContent = "Use my current location";
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
})();
