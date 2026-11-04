async function testApi() {

    const result = document.getElementById("result");

    try {

        const response = await fetch("/api/test");

        const data = await response.json();

        result.textContent = JSON.stringify(data, null, 2);

    } catch (error) {

        result.textContent = "Error: " + error;

    }
}

function getWeatherDescription(code) {

    const descriptions = {
        0: "Clear sky ☀️",
        1: "Mainly clear 🌤️",
        2: "Partly cloudy ⛅",
        3: "Overcast ☁️",
        45: "Fog 🌫️",
        48: "Depositing rime fog 🌫️",
        51: "Light drizzle 🌦️",
        53: "Moderate drizzle 🌦️",
        55: "Dense drizzle 🌧️",
        61: "Slight rain 🌧️",
        63: "Moderate rain 🌧️",
        65: "Heavy rain 🌧️",
        71: "Slight snow 🌨️",
        73: "Moderate snow 🌨️",
        75: "Heavy snow ❄️",
        80: "Rain showers 🌦️",
        81: "Moderate rain showers 🌧️",
        82: "Violent rain showers ⛈️",
        95: "Thunderstorm ⛈️",
        96: "Thunderstorm with hail ⛈️",
        99: "Severe thunderstorm with hail ⛈️"
    };

    return descriptions[code] || "Unknown conditions";
}


let currentWeatherData = null;


async function getWeather() {

    const result = document.getElementById("result");

    result.textContent = "Loading weather...";

    try {

        const city = document.getElementById("city").value.trim();
        const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
        const data = await response.json();

        if (!response.ok) {
            result.textContent = data.error || "Unable to load weather.";
            return;
        }

        currentWeatherData = data;
        displayWeather();

    } catch (error) {

        result.textContent = "Error: " + error;

    }
}

function displayWeather() {

    if (!currentWeatherData) {
        return;
    }

    const result = document.getElementById("result");
    const data = currentWeatherData;
    const location = data.location;
    const weather = data.weather;
    const units = document.getElementById("units").value;

    const temperature = units === "F"
        ? weather.temperature * 9 / 5 + 32
        : weather.temperature;

    const feelsLike = units === "F"
        ? weather.feels_like * 9 / 5 + 32
        : weather.feels_like;

    const symbol = units === "F" ? "°F" : "°C";

    result.innerHTML = `
        <h3>${location.city}, ${location.state}</h3>
        <h1>${temperature.toFixed(1)}${symbol}</h1>
        <p>Feels like: ${feelsLike.toFixed(1)}${symbol}</p>
        <p>Humidity: ${weather.humidity}%</p>
        <p>Precipitation: ${weather.precipitation} mm</p>
        <p>Wind speed: ${weather.wind_speed} km/h</p>
        <p>Wind direction: ${weather.wind_direction}°</p>
        <p>Weather code: ${getWeatherDescription(weather.weather_code)}</p>
        <small>Data source: ${data.source || "unknown"}</small>
    `;
}


