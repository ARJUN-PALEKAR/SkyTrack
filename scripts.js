const apiKey = "016aa96870866d99f4955c4130fcc62e";
const apiBase = "https://api.openweathermap.org/data/2.5/weather";
const unsplashApiKey = "3hrSwUMm8Lxma3cU-lb7SCzHXD4fzlgYqQDrAkjS51M";
const unsplashApiBase = "https://api.unsplash.com/search/photos";

async function fetchLocationPhoto(location) {
  let searchQuery = location;
  const parentCity = getParentCity(location);
  if (parentCity !== location) {
    console.log(`🔄 Using parent city image instead of ${location}: ${parentCity}`);
    searchQuery = parentCity;
  }

  const formattedLocation = encodeURIComponent(searchQuery);
  const url = `${unsplashApiBase}?query=${formattedLocation}&client_id=${unsplashApiKey}&orientation=landscape&per_page=1`;

  try {
    console.log("📸 Fetching location photo for:", searchQuery);
    const response = await fetch(url);
    const data = await response.json();

    console.log("🔍 Unsplash API Response:", data);

    let photoUrl = "";

    if (data.results && data.results.length > 0) {
      photoUrl = data.results[0].urls.regular;
      console.log("✅ Photo found:", photoUrl);
    } else {
      console.warn(`⚠️ No specific images found for: ${searchQuery}`);
      photoUrl = `https://source.unsplash.com/600x300/?${encodeURIComponent(parentCity)},city`;
    }

    setImage(photoUrl, parentCity);
  } catch (error) {
    console.error("❌ Error fetching location photo:", error);
    setImage(`https://source.unsplash.com/600x300/?${encodeURIComponent(parentCity)},city`, parentCity);
  }
}

function getParentCity(location) {
  const locationToCityMap = {
    "Chetput": "Chennai",
    "Adyar": "Chennai",
    "Teynampet": "Chennai",
    "Amboli": "Mumbai",
    "Andheri": "Mumbai",
    "Juhu": "Mumbai",
    "Bandra": "Mumbai",
    "Pimpri": "Pune",
    "Chinchwad": "Pune",
    "Hinjewadi": "Pune",
    "Shivaji Nagar": "Pune",
    "Koramangala": "Bangalore",
    "Whitefield": "Bangalore",
    "Indiranagar": "Bangalore"
  };

  return locationToCityMap[location] || location.split(" ")[0];
}

function setImage(imageUrl, location) {
  const locationPhoto = document.getElementById("location-photo");
  if (locationPhoto) {
    locationPhoto.src = imageUrl;
    locationPhoto.alt = `Photo of ${location}`;
    locationPhoto.style.display = "block";
    console.log("✅ Final Image URL:", imageUrl);
  } else {
    console.error("❌ Image element not found in DOM.");
  }
}

async function fetchWeatherData(location) {
  const url = `${apiBase}?q=${location}&appid=${apiKey}&units=metric`;

  try {
    console.log(`Fetching weather for: ${location}`);
    const response = await fetch(url);
    const data = await response.json();

    console.log("Weather API Response:", data);

    if (data.cod !== 200) {
      alert(`Error: ${data.message}`);
      return;
    }

    updateWeatherUI(data);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    alert("Failed to fetch weather data. Please try again.");
  }
}

async function fetchWeatherDataByCoords(lat, lon) {
  const url = `${apiBase}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  console.log(`Fetching weather for coordinates: ${lat}, ${lon}`);
  console.log("API Request URL:", url);

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log("Weather API Response:", data);

    if (data.cod !== 200) {
      console.error("Weather API Error:", data);
      alert(`API Error: ${data.message}`);
      return;
    }

    updateWeatherUI(data);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    alert("Failed to fetch weather data. Please try again.");
  }
}

function updateWeatherUI(data) {
  const cityName = data.name;
  const countryCode = data.sys.country;

  document.getElementById("location-name").textContent = `${cityName}, ${countryCode}`;
  document.getElementById("current-temp").textContent = `${data.main.temp}°C`;
  document.getElementById("weather-condition").textContent = data.weather[0].description;
  document.getElementById("humidity-value").textContent = `${data.main.humidity}%`;
  document.getElementById("wind-speed-value").textContent = `${data.wind.speed} km/h`;
  document.getElementById("feels-like-value").textContent = `${data.main.feels_like}°C`;
  document.getElementById("visibility-value").textContent = `${data.visibility / 1000} km`;
  document.getElementById("uv-index-value").textContent = "N/A";
  document.getElementById("local-time-value").textContent = new Date().toLocaleString();

  fetchLocationPhoto(cityName);
}

document.addEventListener("DOMContentLoaded", () => {
  if (navigator.geolocation) {
    console.log("Geolocation is supported.");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (!position || !position.coords) {
          console.error("Geolocation data is missing.");
          alert("Geolocation data is missing. Please allow location access.");
          fetchWeatherData("Mumbai");
          return;
        }

        const { latitude, longitude } = position.coords;
        console.log("User's Coordinates:", latitude, longitude);
        alert(`Your location detected: ${latitude}, ${longitude}`);

        fetchWeatherDataByCoords(latitude, longitude);
      },
      (error) => {
        console.error("Geolocation error:", error.message);
        alert("Location access denied or not available. Defaulting to Mumbai.");
        fetchWeatherData("Mumbai");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  } else {
    console.error("Geolocation is not supported in this browser.");
    alert("Geolocation is not supported in this browser. Defaulting to Mumbai.");
    fetchWeatherData("Mumbai");
  }
});

document.getElementById("searchBtn").addEventListener("click", () => {
  const location = document.getElementById("search").value.trim();
  if (location) {
    fetchWeatherData(location);
  } else {
    alert("Please enter a location.");
  }
});

document.getElementById("searchBtn").addEventListener("click", () => {
  const location = document.getElementById("search").value.trim();
  if (location) {
    fetchWeatherData(location);
  } else {
    alert("Please enter a location.");
  }
});

// Add Enter key event listener
document.getElementById("search").addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    document.getElementById("searchBtn").click();
  }
});
