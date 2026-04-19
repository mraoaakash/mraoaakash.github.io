const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const menuToggle = document.getElementById("menuToggle");
const topMenu = document.getElementById("topMenu");
const lastUpdatedTargets = document.querySelectorAll(".last-updated");
const homePageProfileImage = document.querySelector("body.home-page .profile-pic");

if (lastUpdatedTargets.length > 0) {
  const parsedLastModified = new Date(document.lastModified);
  const safeDate = Number.isNaN(parsedLastModified.getTime()) ? new Date() : parsedLastModified;
  const formattedLastUpdated = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(safeDate);

  lastUpdatedTargets.forEach((target) => {
    target.textContent = formattedLastUpdated;
  });
}

const getStoredTheme = () => {
  try {
    const stored = localStorage.getItem("theme");
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    return null;
  }
};

const setStoredTheme = (theme) => {
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // Ignore storage failures in restricted contexts.
  }
};

const getInitialTheme = () => {
  const storedTheme = getStoredTheme();
  if (storedTheme) {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const applyTheme = (theme) => {
  root.setAttribute("data-theme", theme);

  if (!themeToggle) {
    return;
  }

  const icon = themeToggle.querySelector("i");
  const isDark = theme === "dark";
  themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");

  if (icon) {
    icon.classList.toggle("fa-moon", !isDark);
    icon.classList.toggle("fa-sun", isDark);
  }
};

applyTheme(getInitialTheme());

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const currentTheme = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    setStoredTheme(nextTheme);
  });
}

const updateHomeGlowOrigin = () => {
  if (!homePageProfileImage) {
    return;
  }

  const rect = homePageProfileImage.getBoundingClientRect();
  const centerX = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
  const centerY = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
  document.body.style.setProperty("--profile-glow-x", `${centerX.toFixed(2)}%`);
  document.body.style.setProperty("--profile-glow-y", `${centerY.toFixed(2)}%`);
};

if (homePageProfileImage) {
  updateHomeGlowOrigin();
  window.addEventListener("load", updateHomeGlowOrigin);
  window.addEventListener("resize", updateHomeGlowOrigin);
}

if (menuToggle && topMenu) {
  const icon = menuToggle.querySelector("i");

  const setMenuOpen = (isOpen) => {
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    topMenu.hidden = !isOpen;

    if (icon) {
      icon.classList.toggle("fa-bars", !isOpen);
      icon.classList.toggle("fa-bars-staggered", isOpen);
    }
  };

  setMenuOpen(false);

  menuToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    setMenuOpen(!isOpen);
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!topMenu.hidden && target instanceof Node && !topMenu.contains(target) && !menuToggle.contains(target)) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !topMenu.hidden) {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });
}

const weatherStatus = document.getElementById("weatherStatus");
const weatherGrid = document.getElementById("weatherGrid");
const weatherLocation = document.getElementById("weatherLocation");
const weatherCondition = document.getElementById("weatherCondition");
const weatherTemperature = document.getElementById("weatherTemperature");
const weatherFeelsLike = document.getElementById("weatherFeelsLike");
const weatherWind = document.getElementById("weatherWind");
const weatherRefreshArea = document.getElementById("weatherRefreshArea");
const weatherIcon = document.getElementById("weatherIcon");
const weatherMap = document.getElementById("weatherMap");
const f1RefreshArea = document.getElementById("f1RefreshArea");
const f1RaceLabel = document.getElementById("f1RaceLabel");
const f1Status = document.getElementById("f1Status");
const f1Podium = document.getElementById("f1Podium");

let weatherLeafletMap = null;
let weatherLeafletMarker = null;
let f1RaceSessionsCache = null;

const weatherCodeLabels = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Dense drizzle",
  56: "Freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Rain showers",
  81: "Heavy rain showers",
  82: "Violent rain showers",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Heavy thunderstorm with hail"
};

const randomWeatherLocations = [
  { name: "London", country: "United Kingdom", latitude: 51.5072, longitude: -0.1276 },
  { name: "Birmingham", country: "United Kingdom", latitude: 52.4862, longitude: -1.8904 },
  { name: "New York", country: "United States", latitude: 40.7128, longitude: -74.006 },
  { name: "San Francisco", country: "United States", latitude: 37.7749, longitude: -122.4194 },
  { name: "Tokyo", country: "Japan", latitude: 35.6762, longitude: 139.6503 },
  { name: "Sydney", country: "Australia", latitude: -33.8688, longitude: 151.2093 },
  { name: "Auckland", country: "New Zealand", latitude: -36.8509, longitude: 174.7645 },
  { name: "Cape Town", country: "South Africa", latitude: -33.9249, longitude: 18.4241 },
  { name: "Nairobi", country: "Kenya", latitude: -1.2921, longitude: 36.8219 },
  { name: "Rio de Janeiro", country: "Brazil", latitude: -22.9068, longitude: -43.1729 },
  { name: "Buenos Aires", country: "Argentina", latitude: -34.6037, longitude: -58.3816 },
  { name: "Paris", country: "France", latitude: 48.8566, longitude: 2.3522 },
  { name: "Berlin", country: "Germany", latitude: 52.52, longitude: 13.405 },
  { name: "Reykjavik", country: "Iceland", latitude: 64.1466, longitude: -21.9426 },
  { name: "Dubai", country: "United Arab Emirates", latitude: 25.2048, longitude: 55.2708 },
  { name: "Singapore", country: "Singapore", latitude: 1.3521, longitude: 103.8198 },
  { name: "Seoul", country: "South Korea", latitude: 37.5665, longitude: 126.978 },
  { name: "Mumbai", country: "India", latitude: 19.076, longitude: 72.8777 },
  { name: "Bengaluru", country: "India", latitude: 12.9716, longitude: 77.5946 },
  { name: "Ushuaia", country: "Argentina", latitude: -54.8019, longitude: -68.303 }
];

const getWeatherIconClass = (code, isDay) => {
  if (code === 0) {
    return isDay ? "fa-sun" : "fa-moon";
  }
  if (code === 1 || code === 2) {
    return isDay ? "fa-cloud-sun" : "fa-cloud-moon";
  }
  if (code === 3) {
    return "fa-cloud";
  }
  if (code === 45 || code === 48) {
    return "fa-smog";
  }
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return "fa-cloud-rain";
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return "fa-snowflake";
  }
  if ([95, 96, 99].includes(code)) {
    return "fa-cloud-bolt";
  }
  return "fa-cloud";
};

const setWeatherStatus = (message, isError) => {
  if (!weatherStatus) {
    return;
  }

  weatherStatus.textContent = message;
  weatherStatus.hidden = !message;
  weatherStatus.classList.toggle("is-error", Boolean(isError));
};

const formatCoordinate = (value, positive, negative) => {
  const direction = value >= 0 ? positive : negative;
  return `${Math.abs(value).toFixed(2)}\u00b0${direction}`;
};

const ensureWeatherMap = () => {
  if (!weatherMap || typeof window.L === "undefined") {
    return false;
  }

  if (weatherLeafletMap) {
    return true;
  }

  weatherLeafletMap = window.L.map(weatherMap, {
    zoomControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    touchZoom: false,
    tap: false
  }).setView([20, 0], 2);

  window.L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    maxZoom: 18,
    subdomains: "abcd",
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO"
  }).addTo(weatherLeafletMap);

  weatherLeafletMarker = window.L.marker([20, 0]).addTo(weatherLeafletMap);
  setTimeout(() => {
    weatherLeafletMap.invalidateSize();
  }, 0);

  return true;
};

const updateWeatherMap = (latitude, longitude, label) => {
  if (!ensureWeatherMap() || !weatherLeafletMap || !weatherLeafletMarker) {
    return;
  }

  weatherLeafletMap.setView([latitude, longitude], 6, { animate: true });
  weatherLeafletMarker.setLatLng([latitude, longitude]);
  if (label) {
    weatherLeafletMarker.bindPopup(label);
  }
  setTimeout(() => {
    weatherLeafletMap.invalidateSize();
  }, 0);
};

const getRandomWeatherLocation = () => {
  const randomIndex = Math.floor(Math.random() * randomWeatherLocations.length);
  return randomWeatherLocations[randomIndex];
};

const getCurrentWeather = async (latitude, longitude) => {
  const params = new URLSearchParams({
    latitude: latitude.toFixed(5),
    longitude: longitude.toFixed(5),
    current: "temperature_2m,apparent_temperature,weather_code,wind_speed_10m,is_day",
    timezone: "auto"
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
    cache: "no-store"
  });
  if (!response.ok) {
    throw new Error("Weather request failed");
  }

  return response.json();
};

const renderWeather = (payload, latitude, longitude, locationName) => {
  if (!weatherGrid || !weatherLocation || !weatherCondition || !weatherTemperature || !weatherFeelsLike || !weatherWind) {
    return;
  }

  const current = payload.current || payload.current_weather;
  const units = payload.current_units || {};
  if (!current) {
    throw new Error("Weather payload missing current data");
  }

  const weatherCode = Number(current.weather_code ?? current.weathercode);
  const isDay = Number(current.is_day ?? 1) === 1;
  const temperature = current.temperature_2m ?? current.temperature;
  const feelsLike = current.apparent_temperature;
  const windSpeed = current.wind_speed_10m ?? current.windspeed;
  const temperatureUnit = units.temperature_2m || "\u00b0C";
  const feelsLikeUnit = units.apparent_temperature || temperatureUnit;
  const windUnit = units.wind_speed_10m || "km/h";

  const coordinatesText = `${formatCoordinate(latitude, "N", "S")}, ${formatCoordinate(longitude, "E", "W")}`;
  weatherLocation.textContent = locationName ? `${locationName} (${coordinatesText})` : coordinatesText;
  weatherCondition.textContent = weatherCodeLabels[weatherCode] || "Unknown";
  weatherTemperature.textContent = temperature != null ? `${temperature}${temperatureUnit}` : "--";
  weatherFeelsLike.textContent = feelsLike != null ? ` (${feelsLike}${feelsLikeUnit})` : "";
  weatherWind.textContent = windSpeed != null ? `${windSpeed} ${windUnit}` : "--";
  updateWeatherMap(latitude, longitude, locationName);

  if (weatherIcon) {
    weatherIcon.className = `fa-solid weather-name-icon ${getWeatherIconClass(weatherCode, isDay)}`;
  }

  weatherGrid.hidden = false;
  setWeatherStatus("", false);
};

const initializeWeatherSection = async () => {
  if (!weatherStatus) {
    return;
  }

  try {
    setWeatherStatus("Fetching weather for a random location...", false);
    if (weatherGrid) {
      weatherGrid.hidden = true;
    }

    const randomLocation = getRandomWeatherLocation();
    const payload = await getCurrentWeather(randomLocation.latitude, randomLocation.longitude);
    const locationLabel = `${randomLocation.name}, ${randomLocation.country}`;
    renderWeather(payload, randomLocation.latitude, randomLocation.longitude, locationLabel);
  } catch (error) {
    setWeatherStatus("Unable to load weather right now. Please try again.", true);
  }
};

if (weatherRefreshArea) {
  weatherRefreshArea.addEventListener("click", () => {
    initializeWeatherSection();
  });

  weatherRefreshArea.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      initializeWeatherSection();
    }
  });
}

initializeWeatherSection();

const setF1Status = (message, isError) => {
  if (!f1Status) {
    return;
  }

  f1Status.textContent = message;
  f1Status.hidden = !message;
  f1Status.classList.toggle("is-error", Boolean(isError));
};

const formatF1RaceLabel = (session) => {
  const raceName = session.meeting_name || session.country_name || "Race";
  const sessionDate = session.date_start ? new Date(session.date_start) : null;
  const dateLabel =
    sessionDate && !Number.isNaN(sessionDate.getTime())
      ? new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "2-digit" }).format(sessionDate)
      : "";
  return dateLabel ? `${raceName} · ${dateLabel}` : raceName;
};

const getRandomRaceSession = async () => {
  if (!Array.isArray(f1RaceSessionsCache)) {
    const sessionsResponse = await fetch("https://api.openf1.org/v1/sessions?session_name=Race", {
      cache: "no-store"
    });
    if (!sessionsResponse.ok) {
      throw new Error("Unable to fetch race sessions");
    }

    const sessions = await sessionsResponse.json();
    f1RaceSessionsCache = Array.isArray(sessions) ? sessions.filter((session) => session && session.session_key) : [];
  }

  if (!f1RaceSessionsCache || f1RaceSessionsCache.length === 0) {
    throw new Error("No race sessions available");
  }

  const randomIndex = Math.floor(Math.random() * f1RaceSessionsCache.length);
  return f1RaceSessionsCache[randomIndex];
};

const getPodiumForSession = async (sessionKey) => {
  const [driversResponse, positionsResponse] = await Promise.all([
    fetch(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`, { cache: "no-store" }),
    fetch(`https://api.openf1.org/v1/position?session_key=${sessionKey}`, { cache: "no-store" })
  ]);

  if (!driversResponse.ok || !positionsResponse.ok) {
    throw new Error("Unable to fetch race details");
  }

  const [drivers, positions] = await Promise.all([driversResponse.json(), positionsResponse.json()]);
  const driversByNumber = new Map();
  const latestPositionByDriver = new Map();

  if (Array.isArray(drivers)) {
    drivers.forEach((driver) => {
      const driverNumber = Number(driver?.driver_number);
      if (Number.isFinite(driverNumber)) {
        driversByNumber.set(driverNumber, driver);
      }
    });
  }

  if (Array.isArray(positions)) {
    positions.forEach((entry) => {
      const driverNumber = Number(entry?.driver_number);
      const position = Number(entry?.position);
      if (!Number.isFinite(driverNumber) || !Number.isFinite(position)) {
        return;
      }

      const timestamp = entry?.date ? Date.parse(entry.date) : 0;
      const previous = latestPositionByDriver.get(driverNumber);
      if (!previous || timestamp > previous.timestamp) {
        latestPositionByDriver.set(driverNumber, { driverNumber, position, timestamp });
      }
    });
  }

  const podium = Array.from(latestPositionByDriver.values())
    .sort((left, right) => left.position - right.position)
    .slice(0, 3)
    .map((entry) => {
      const driver = driversByNumber.get(entry.driverNumber) || {};
      return {
        rank: entry.position,
        name: driver.full_name || driver.broadcast_name || `Driver #${entry.driverNumber}`,
        team: driver.team_name || "",
        headshot: driver.headshot_url || "",
        driverNumber: entry.driverNumber
      };
    });

  if (podium.length === 0) {
    throw new Error("No podium data available");
  }

  return podium;
};

const getInitials = (name) => {
  const initials = String(name || "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return initials || "F1";
};

const renderF1Podium = (session, podium) => {
  if (!f1Podium || !f1RaceLabel) {
    return;
  }

  f1RaceLabel.textContent = formatF1RaceLabel(session);
  f1Podium.innerHTML = "";

  podium.forEach((driver, index) => {
    const item = document.createElement("li");
    item.className = "f1-driver";

    const rank = document.createElement("span");
    rank.className = "f1-rank";
    rank.textContent = `P${index + 1}`;

    const content = document.createElement("div");
    content.className = "f1-driver-content";

    let media;
    if (driver.headshot) {
      media = document.createElement("img");
      media.className = "f1-driver-photo";
      media.loading = "lazy";
      media.src = driver.headshot;
      media.alt = `${driver.name} headshot`;
      media.addEventListener("error", () => {
        media.replaceWith(Object.assign(document.createElement("span"), { className: "f1-driver-fallback", textContent: getInitials(driver.name) }));
      });
    } else {
      media = document.createElement("span");
      media.className = "f1-driver-fallback";
      media.textContent = getInitials(driver.name);
    }

    const text = document.createElement("div");
    text.className = "f1-driver-text";

    const name = document.createElement("p");
    name.className = "f1-driver-name";
    name.textContent = driver.name;

    const meta = document.createElement("p");
    meta.className = "f1-driver-meta";
    meta.textContent = driver.team || `#${driver.driverNumber}`;

    text.appendChild(name);
    text.appendChild(meta);
    content.appendChild(media);
    content.appendChild(text);
    item.appendChild(rank);
    item.appendChild(content);
    f1Podium.appendChild(item);
  });

  f1Podium.hidden = false;
  setF1Status("", false);
};

const initializeF1Section = async () => {
  if (!f1Status || !f1Podium || !f1RaceLabel) {
    return;
  }

  try {
    setF1Status("Fetching random race results...", false);
    f1Podium.hidden = true;
    f1RaceLabel.textContent = "--";
    const session = await getRandomRaceSession();
    const podium = await getPodiumForSession(session.session_key);
    renderF1Podium(session, podium);
  } catch {
    setF1Status("Unable to load F1 race data right now. Please try again.", true);
  }
};

if (f1RefreshArea) {
  f1RefreshArea.addEventListener("click", () => {
    initializeF1Section();
  });

  f1RefreshArea.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      initializeF1Section();
    }
  });
}

initializeF1Section();
