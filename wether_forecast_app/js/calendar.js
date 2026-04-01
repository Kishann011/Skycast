(function () {
  const input = document.getElementById("cal-city");
  const btn = document.getElementById("cal-load");
  const grid = document.getElementById("cal-grid");
  const err = document.getElementById("cal-error");
  const label = document.getElementById("cal-city-label");

  const hist = getSearchHistory();
  if (hist.length) input.placeholder = `Try: ${hist[0]}`;

  function showErr(msg) {
    err.textContent = msg || "";
    err.classList.toggle("visible", !!msg);
  }

  function pickOneSlotPerDay(list) {
    const seen = new Set();
    const out = [];
    list.forEach((item) => {
      const day = item.dt_txt.split(" ")[0];
      if (!seen.has(day)) {
        seen.add(day);
        out.push(item);
      }
    });
    return out;
  }

  function formatDay(dtTxt) {
    const d = new Date(dtTxt.replace(" ", "T") + "Z");
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  async function load() {
    const q = input.value.trim() || getSearchHistory()[0] || "";
    if (!q) {
      showErr("Enter a city or search from Home first.");
      return;
    }
    if (!WEATHER_API_KEY || WEATHER_API_KEY === "YOUR_API_KEY_HERE") {
      showErr("Set your API key in js/config.js.");
      return;
    }
    showErr("");
    btn.disabled = true;
    btn.textContent = "Loading…";
    grid.innerHTML = "";
    label.textContent = "";

    try {
      const geo = await geocodeCity(q);
      const fc = await fetchForecast(geo.lat, geo.lon);
      label.textContent = `Forecast for ${fc.city.name}`;
      const days = pickOneSlotPerDay(fc.list);
      days.forEach((item) => {
        const w = item.weather[0];
        const cell = document.createElement("div");
        cell.className = "forecast-cell";
        cell.innerHTML = `
          <div class="forecast-time">${formatDay(item.dt_txt)}</div>
          <img src="https://openweathermap.org/img/wn/${w.icon}@2x.png" alt="" width="56" height="56" />
          <div style="font-size:1.1rem;font-weight:600;">${Math.round(item.main.temp)}°C</div>
          <div style="font-size:0.85rem;color:var(--text-muted);text-transform:capitalize;">${w.description}</div>
        `;
        grid.appendChild(cell);
      });
    } catch (e) {
      showErr(e.message || "Could not load forecast.");
    } finally {
      btn.disabled = false;
      btn.textContent = "Load forecast";
    }
  }

  btn.addEventListener("click", load);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") load();
  });
})();
