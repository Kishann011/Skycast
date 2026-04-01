(function () {
  const input = document.getElementById("city-input");
  const searchBtn = document.getElementById("search-btn");
  const suggestionsEl = document.getElementById("suggestions");
  const datalist = document.getElementById("search-history-datalist");
  const errorMsg = document.getElementById("error-msg");
  const weatherMain = document.getElementById("weather-main");
  const locName = document.getElementById("loc-name");
  const weatherDesc = document.getElementById("weather-desc");
  const weatherIcon = document.getElementById("weather-icon");
  const tempMain = document.getElementById("temp-main");
  const feelsLike = document.getElementById("feels-like");
  const humidity = document.getElementById("humidity");
  const aqiEl = document.getElementById("aqi");
  const statTemp = document.getElementById("stat-temp");
  const statHumidity = document.getElementById("stat-humidity");
  const statAqi = document.getElementById("stat-aqi");

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

  function setBodyBackground(mainWeather) {
    BG_CLASSES.forEach((c) => document.body.classList.remove(c));
    const cls = MAIN_TO_BG[mainWeather] || "bg-default";
    document.body.classList.add(cls);
  }

  function showError(text) {
    errorMsg.textContent = text;
    errorMsg.classList.add("visible");
  }

  function hideError() {
    errorMsg.classList.remove("visible");
    errorMsg.textContent = "";
  }

  function refreshDatalist() {
    datalist.innerHTML = "";
    getSearchHistory().forEach((q) => {
      const opt = document.createElement("option");
      opt.value = q;
      datalist.appendChild(opt);
    });
  }

  function filterSuggestions(query) {
    const q = query.trim().toLowerCase();
    const history = getSearchHistory();
    if (!q) return history.slice(0, 8);
    return history
      .filter((h) => h.toLowerCase().includes(q))
      .slice(0, 8);
  }

  function renderSuggestions() {
    const items = filterSuggestions(input.value);
    suggestionsEl.innerHTML = "";
    if (!items.length) {
      suggestionsEl.classList.remove("visible");
      suggestionsEl.hidden = true;
      return;
    }
    items.forEach((text) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = text;
      btn.addEventListener("click", () => {
        input.value = text;
        suggestionsEl.classList.remove("visible");
        suggestionsEl.hidden = true;
        runSearch(text);
      });
      suggestionsEl.appendChild(btn);
    });
    suggestionsEl.classList.add("visible");
    suggestionsEl.hidden = false;
  }

  function iconUrl(code) {
    return `https://openweathermap.org/img/wn/${code}@4x.png`;
  }

  async function runSearch(rawQuery) {
    const query = String(rawQuery || "").trim();
    if (!query) {
      showError("Enter a city name.");
      return;
    }
    if (
      !WEATHER_API_KEY ||
      WEATHER_API_KEY === "YOUR_API_KEY_HERE"
    ) {
      showError(
        "Set your OpenWeatherMap API key in js/config.js (replace YOUR_API_KEY_HERE)."
      );
      return;
    }

    hideError();
    searchBtn.disabled = true;
    searchBtn.textContent = "…";

    try {
      const geo = await geocodeCity(query);
      const [weather, air] = await Promise.all([
        fetchCurrentWeather(geo.lat, geo.lon),
        fetchAirPollution(geo.lat, geo.lon).catch(() => null),
      ]);

      addSearchToHistory(geo.name);
      refreshDatalist();

      const main = weather.weather && weather.weather[0];
      const mainKey = main ? main.main : "Clouds";
      setBodyBackground(mainKey);

      locName.textContent = `${geo.name}${
        weather.sys && weather.sys.country
          ? ", " + weather.sys.country
          : ""
      }`;
      weatherDesc.textContent = main ? main.description : "";
      const iconCode = main ? main.icon : "02d";
      weatherIcon.src = iconUrl(iconCode);
      weatherIcon.alt = main ? main.description : "Weather";

      const temp = Math.round(weather.main.temp);
      tempMain.innerHTML = `${temp}<span class="unit">°C</span>`;

      const feels = Math.round(weather.main.feels_like);
      feelsLike.textContent = `${feels}°C`;
      humidity.textContent = `${weather.main.humidity}%`;

      let aqiText = "—";
      if (
        air &&
        air.list &&
        air.list[0] &&
        air.list[0].main
      ) {
        const idx = air.list[0].main.aqi;
        aqiText = `${aqiLabel(idx)} (${idx}/5)`;
      }
      aqiEl.textContent = aqiText;

      weatherMain.classList.remove("hidden");
      statTemp.classList.remove("hidden");
      statHumidity.classList.remove("hidden");
      statAqi.classList.remove("hidden");
    } catch (e) {
      showError(e.message || "Something went wrong.");
      weatherMain.classList.add("hidden");
      statTemp.classList.add("hidden");
      statHumidity.classList.add("hidden");
      statAqi.classList.add("hidden");
      BG_CLASSES.forEach((c) => document.body.classList.remove(c));
      document.body.classList.add("bg-default");
    } finally {
      searchBtn.disabled = false;
      searchBtn.textContent = "Search";
    }
  }

  input.addEventListener("input", () => {
    renderSuggestions();
  });

  input.addEventListener("focus", () => {
    renderSuggestions();
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-wrap")) {
      suggestionsEl.classList.remove("visible");
      suggestionsEl.hidden = true;
    }
  });

  searchBtn.addEventListener("click", () => runSearch(input.value));

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      suggestionsEl.classList.remove("visible");
      suggestionsEl.hidden = true;
      runSearch(input.value);
    }
  });

  refreshDatalist();
})();
