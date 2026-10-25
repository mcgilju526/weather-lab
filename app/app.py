from flask import Flask, request
import redis
import requests
import json

app = Flask(__name__)

# Connect to Redis using the Docker Compose service name.
redis_client = redis.Redis(
    host="redis",
    port=6379,
    decode_responses=True
)


@app.route("/api/health")
def health():
    return {
        "status": "healthy",
        "message": "Weather API is running"
    }


@app.route("/api/test")
def test():
    return {
        "message": "Hello from Flask!"
    }


@app.route("/api/cache-test")
def cache_test():

    key = "weather:test"

    cached_value = redis_client.get(key)

    print(cached_value)

    if cached_value:
        return {
            "cache": "HIT",
            "value": cached_value
        }

    value = "Hello from Redis!"

    redis_client.setex(
        key,
        30,
        value
    )

    return {
        "cache": "MISS",
        "value": value
    }


@app.route("/api/weather")
def weather():

    city = request.args.get("city", "atlanta")

    cache_key = f"weather:{city}"

    cached_value = redis_client.get(cache_key)

    if cached_value:
        cache_data = json.loads(cached_value)

        return {
            "source": "redis",
            **cache_data
        }

    # Look up the city's latitude and longitude.
    geocode_url = "https://geocoding-api.open-meteo.com/v1/search"

    geocode_params = {
        "name": city,
        "count": 1
    }

    geocode_response = requests.get(
        geocode_url,
        params=geocode_params
    )

    geocode_data = geocode_response.json()

    if "results" not in geocode_data:
        return {
            "error": f"City '{city}' not found"
        }, 404

    location = geocode_data["results"][0]

    location_data = {
        "city": location["name"],
        "state": location.get("admin1"),
        "country": location["country"],
        "timezone": location["timezone"]

    }

    latitude = location["latitude"]
    longitude = location["longitude"]

    # Request weather using the coordinates returned by the geocoding API.
    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m"
    }

    response = requests.get(
        url,
        params=params
    )

    data = response.json()

    # Normalize the Open-Meteo response for our application.
    weather_data = {
        "temperature": data["current"]["temperature_2m"],
        "feels_like": data["current"]["apparent_temperature"],
        "humidity": data["current"]["relative_humidity_2m"],
        "precipitation": data["current"]["precipitation"],
        "weather_code": data["current"]["weather_code"],
        "wind_speed": data["current"]["wind_speed_10m"],
        "wind_direction": data["current"]["wind_direction_10m"]
    }

    cache_data = {
        "location": location_data,
        "weather": weather_data
    }

    # Cache the normalized weather data for 5 minutes.
    redis_client.setex(
        cache_key,
        300,
        json.dumps(cache_data)
    )

    return {
        "source": "open-meteo",
        **cache_data
    }

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
