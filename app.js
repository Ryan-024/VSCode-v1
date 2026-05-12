const weatherSummary = document.getElementById('weather-summary');
const weatherIcon = document.getElementById('weather-icon');
const weatherTemp = document.getElementById('weather-temp');
const weatherNote = document.getElementById('weather-note');

const weatherConditions = {
  clear: { emoji: '☀️', label: 'Clear skies' },
  partlyCloudy: { emoji: '⛅', label: 'Partly cloudy' },
  cloudy: { emoji: '☁️', label: 'Cloudy' },
  rain: { emoji: '🌧️', label: 'Rainy' },
  snow: { emoji: '❄️', label: 'Snowy' },
  storm: { emoji: '⛈️', label: 'Stormy' },
  fog: { emoji: '🌫️', label: 'Foggy' },
};

function getCondition(code) {
  if (code === 0) return weatherConditions.clear;
  if ([1, 2, 3].includes(code)) return weatherConditions.partlyCloudy;
  if ([45, 48].includes(code)) return weatherConditions.fog;
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return weatherConditions.rain;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return weatherConditions.snow;
  if ([95, 96, 99].includes(code)) return weatherConditions.storm;
  return weatherConditions.cloudy;
}

function updateWeather({ temperature, weathercode, time, windspeed }) {
  const condition = getCondition(weathercode);
  weatherIcon.textContent = condition.emoji;
  weatherSummary.textContent = `${condition.label}, ${windspeed.toFixed(0)} mph breeze`;
  weatherTemp.textContent = `${Math.round(temperature)}°F`;
  weatherNote.textContent = `Current at ${new Intl.DateTimeFormat([], {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(time))}.`;
}

function showError(message) {
  weatherIcon.textContent = '⚠️';
  weatherSummary.textContent = 'Weather unavailable';
  weatherTemp.textContent = '--°F';
  weatherNote.textContent = message;
}

function fetchWeather(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=fahrenheit&timezone=auto`;

  fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error('Failed to fetch weather');
      return response.json();
    })
    .then((data) => {
      if (data.current_weather) {
        updateWeather(data.current_weather);
      } else {
        showError('Unable to read current weather from the forecast service.');
      }
    })
    .catch(() => {
      showError('There was a problem loading the weather. Please refresh to try again.');
    });
}

if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      fetchWeather(position.coords.latitude, position.coords.longitude);
    },
    (error) => {
      const message =
        error.code === error.PERMISSION_DENIED
          ? 'Enable location to see your weather.'
          : 'Unable to detect your location. Try again or refresh.';
      showError(message);
    },
    { timeout: 10000 }
  );
} else {
  showError('Geolocation is not supported in this browser.');
}
