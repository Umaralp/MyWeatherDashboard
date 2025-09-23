document.addEventListener('DOMContentLoaded', () => {
    const apiKey = 'cf41ab7265b6f5785cfc377c549a6ac3';

    const searchBtn = document.getElementById('search-btn');
    const cityInput = document.getElementById('city-input');
    const currentWeatherDiv = document.getElementById('current-weather');
    const forecastDiv = document.getElementById('forecast');

    // Function to fetch weather data
    // Function to fetch weather data by city name OR by coordinates
    const getWeatherData = async (location) => {
        // Inside getWeatherData, at the beginning
        const loader = document.getElementById('loader');
        loader.style.display = 'block';
        currentWeatherDiv.innerHTML = ''; // Clear old data
        forecastDiv.innerHTML = '';

        // Inside the 'try' block, after displaying data
        loader.style.display = 'none';

        // Inside the 'catch' block
        loader.style.display = 'none';
    // Define the API URLs for current weather and forecast
    let currentWeatherUrl;
    let forecastUrl;

    if (typeof location === 'string') {
        // If location is a string, user searched for a city name
        currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;
        forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`;
    } else if (typeof location === 'object' && location.lat && location.lon) {
        // If location is an object, it's coordinates from geolocation
        const { lat, lon } = location;
        currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    } else {
        // Handle invalid input
        alert('Invalid location provided.');
        return;
    }

    try {
        // Fetch current weather  
        const currentResponse = await fetch(currentWeatherUrl);
        if (!currentResponse.ok) throw new Error('Weather data not found for the specified location.');
        const currentData = await currentResponse.json();
        
        // Fetch 5-day forecast
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();

        // Update the city input field with the name returned by the weather API
        // This ensures consistency, e.g., if user types "nyc", it shows "New York"
        cityInput.value = currentData.name;

        displayCurrentWeather(currentData);
        displayForecast(forecastData);

    } catch (error) {
        alert(error.message);
    }
};

    // Function to display current weather
    const displayCurrentWeather = (data) => {
        const weatherCondition = data.weather[0].main;
        document.body.className = ''; // Reset classes
        document.body.classList.add(weatherCondition.toLowerCase());
        currentWeatherDiv.innerHTML = `
            <h2>${data.name}, ${data.sys.country}</h2>
            <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="weather icon">
            <p><strong>Temperature:</strong> ${data.main.temp}°C</p>
            <p><strong>Condition:</strong> ${data.weather[0].description}</p>
            <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
            <p><strong>Wind Speed:</strong> ${data.wind.speed} m/s</p>
        `;
    };

    // Function to display 5-day forecast
    const displayForecast = (data) => {
        forecastDiv.innerHTML = ''; // Clear previous forecast
        
        // Filter the forecast list to get one entry per day (around noon)
        const dailyForecasts = data.list.filter(item => item.dt_txt.includes("12:00:00"));

        dailyForecasts.forEach(day => {
            const date = new Date(day.dt * 1000).toLocaleDateString();
            forecastDiv.innerHTML += `
                <div class="forecast-card">
                    <h4>${date}</h4>
                    <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="weather icon">
                    <p>Temp: ${day.main.temp}°C</p>
                    <p>${day.weather[0].description}</p>
                </div>
            `;
        });
    };

    // Event listener for the search button
    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
        } else {
            alert('Please enter a city name.');
        }
    });
    
    // Function to get weather by user's location
    const getWeatherByLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // Fetch city name from coordinates (reverse geocoding)
                    const response = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`);
                    const data = await response.json();
                    if (data.length > 0) {
                        const cityName = data[0].name;
                        cityInput.value = cityName; // Sets the input box's text to the detected city name
                        getWeatherData(cityName); // Get weather for the detected city
                    }  
                } catch (error) {
                    alert('Could not fetch location-based weather.');
                }
            }, () => {
                alert('Geolocation permission denied. Please search for a city.');
                // Default to a city if geolocation fails
                getWeatherData('London'); 
            });
        } else {
            alert('Geolocation is not supported by this browser.');
             // Default to a city if geolocation is not supported
            getWeatherData('London');
        }
    };
    
    // Load weather for user's location on page load
    getWeatherByLocation();
});