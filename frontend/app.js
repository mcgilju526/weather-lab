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
        <p>Weather code: ${weather.weather_code}</p>
        <small>Data source: ${data.source || "unknown"}</small>
    `;
}


