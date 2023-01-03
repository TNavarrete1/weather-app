// Debouncer func
function debouncer(func, timeout = 500) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

// Calls weather API
const requestWeather = async (type, city) => {
  try {
    const res = await fetch(`/api/weather/${type}?city=${city}`);
    const data = await res.json();
    if (res.status === 400 || res.status === 401) {
      console.log(`${data.message}. ${data.error ? data.error : ""}`);
      return null;
    }
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Displays autocomplete search results
const focusInInput = (event) => {
  event.stopPropagation();
  const searchResults = document.querySelector("#search-results");
  if (searchResults.style.display == "flex") {
    return;
  }

  searchResults.style.display = "flex";
};
const focusOutInput = () => {
  const searchResults = document.querySelector("#search-results");
  if (searchResults.style.display == "none") {
    return;
  }

  searchResults.style.display = "none";
};

// Checks if search input changes
const inputChanged = debouncer(async (event) => {
  const searchResults = document.querySelector("#search-results");

  // Check if at least 4 letters are used to request autocomplete
  if (event.target.value.length < 4) {
    // Reset search results display
    searchResults.innerHTML = "No results found";
    return;
  }
  const searchRes = await requestWeather("search", event.target.value);
  const searchArr = searchRes.search;
  // Check if cities in response array
  if (searchArr.length == 0) {
    // Reset search results display
    searchResults.innerHTML = "No results found";
    return;
  }
  // Remove children elements
  searchResults.innerHTML = "";
  // Fill in search results
  searchArr.forEach((city, index) => {
    const suggestiveText = document.createElement("div");
    suggestiveText.classList.add("suggestive-text");
    if (index == 0) {
      suggestiveText.classList.add("search-selected");
    }
    suggestiveText.textContent = `${city.name}, ${city.region}`;
    suggestiveText.dataset.city = city.name;
    suggestiveText.addEventListener("click", clickSuggestiveText);
    searchResults.appendChild(suggestiveText);
  });
});

// Checks if search was entered with enter key
const inputEntered = async (event) => {
  if (event.key == "Enter") {
    event.preventDefault();
    document.querySelector("#search").dataset.city = event.target.value;
    searchAndReset();
  }
};

// Checks if search was entered through icon click
const clickSearchButton = (event) => {
  event.stopPropagation();
  const search = document.querySelector("#search");
  search.dataset.city = search.value;
  searchAndReset();
};

// Checks if autocomplete suggestion is clicked
const clickSuggestiveText = async (event) => {
  event.stopPropagation();
  document.querySelector("#search").dataset.city = event.target.dataset.city;
  searchAndReset();
};

const searchAndReset = async () => {
  const search = document.querySelector("#search");
  if (!search.dataset.city) {
    return;
  }
  // Check if there is a valid city to search
  const searchResults = document.querySelector("#search-results");
  if (searchResults.children.length == 0) {
    return;
  }
  // Check if page was able to be updated
  const weather = await getWeatherData(search.dataset.city);
  if (!weather) {
    return;
  }
  updatePageData(weather);
  // Reset
  delete search.dataset.city;
  search.value = ""; // Removes text in search bar
  document.querySelector("#search-results").innerHTML = "No results found..."; // Removes suggestions
  document.querySelector("#search-results").style.display = "none"; // Removes focus off of search results
  document.querySelector("#search-container").blur(); // Removes focus from input element container
  document.querySelector("#search").blur(); // Removes focus from input
};

// Helper functions to update page data
const TimeBetweenString = (time1, time2) => {
  const time1Arr = time1.replace(":", " ").split(" ");
  const time2Arr = time2.replace(":", " ").split(" ");
  let minutes1 = parseInt(time1Arr[1]);
  if (time1Arr[2] == "PM" && time1Arr[0] != "12") {
    minutes1 += (parseInt(time1Arr[0]) + 12) * 60;
  } else {
    minutes1 += parseInt(time1Arr[0]) * 60;
  }
  let minutes2 = parseInt(time2Arr[1]);
  if (time2Arr[2] == "PM") {
    minutes2 += (parseInt(time2Arr[0]) + 12) * 60;
  } else {
    minutes2 += parseInt(time2Arr[0]) * 60;
  }

  let resMinutes = Math.abs(minutes2 - minutes1);
  let resHours = Math.floor(resMinutes / 60);
  resMinutes -= resHours * 60;

  if (isNaN(resHours) || isNaN(resMinutes)) {
    return "Not Available";
  }

  return resHours + " hr " + resMinutes + " min";
};
const timeBetweenToDeg = (startTimeInClock, currTimeInMilitary, totTimeStr) => {
  // Convert times to minutes
  const currArr = currTimeInMilitary.replace(" ", "").split(":");
  const startArr = startTimeInClock.replace(":", " ").split(" ");
  const currMinPassed =
    parseInt(currArr[0]) * 60 +
    parseInt(currArr[1]) -
    (startArr[2] == "PM" && startArr[0] != "12"
      ? parseInt(startArr[0]) + 12
      : parseInt(startArr[0])) *
      60 -
    parseInt(startArr[1]);
  const totArr = totTimeStr.replace(" hr ", ":").replace(" min", "").split(":");
  const totMin = parseInt(totArr[0]) * 60 + parseInt(totArr[1]);

  if (currMinPassed <= 0) {
    return 0;
  } else if (currMinPassed > totMin) {
    return 180;
  }
  return (currMinPassed / totMin) * 180;
};

const updatePageData = (weather) => {
  if (!weather) {
    return;
  }
  // Update all fields with current weather data
  document.querySelector("#date").textContent = weather.localtime;
  document.querySelector("#degrees-num").textContent = Math.floor(
    weather.temp_f
  );
  document.querySelector("#city").textContent = weather.city;
  document.querySelector("#icon").src = weather.condition_icon;
  document.querySelector("#weather-type").textContent = weather.condition_text;
  document.querySelector("#wind").textContent = `${weather.wind_mph} MPH`;
  document.querySelector("#wind-degree").textContent = weather.wind_degree;
  document.querySelector("#humidity").textContent = `${weather.humidity}%`;
  document.querySelector("#cloud").textContent = `${weather.cloud}%`;
  document.querySelector("#feelslike").textContent = weather.feelslike_f;
  document.querySelector("#gust").textContent = `${weather.gust_mph} MPH`;

  // Update sun moon cyle with astronomy data
  const sunTime = TimeBetweenString(weather.sunrise, weather.sunset);
  const moonTime = TimeBetweenString(weather.moonset, weather.moonrise);

  document.querySelector("#sunrise-time").textContent = weather.sunrise;
  document.querySelector("#sunset-time").textContent = weather.sunset;
  document.querySelector("#moonset-time").textContent = weather.moonset;
  document.querySelector("#moonrise-time").textContent = weather.moonrise;
  document.querySelector("#sun-time").textContent = sunTime;
  document.querySelector("#moon-time").textContent = moonTime;
  document
    .querySelector("#sun-icon")
    .style.setProperty(
      "--degrees",
      `${timeBetweenToDeg(
        weather.sunrise,
        weather.localtime.slice(-5),
        sunTime
      )}deg`
    );
  document
    .querySelector("#moon-icon")
    .style.setProperty(
      "--degrees",
      `-${timeBetweenToDeg(
        weather.moonset,
        weather.localtime.slice(-5),
        moonTime
      )}deg`
    );

  // Update background image with weather codes
  const layoutBg = document.querySelector("#layout-bg");
  if (weather.condition_code == 1000) {
    layoutBg.style.setProperty("--url", "url('/images/sunny.jpg')");
  } else if (weather.condition_code == 1003) {
    layoutBg.style.setProperty("--url", "url('/images/partial-clouds.jpg')");
  } else if (weather.condition_code == 1006) {
    layoutBg.style.setProperty("--url", "url('/images/cloudy.jpg')");
  } else if (weather.condition_code == 1009) {
    layoutBg.style.setProperty("--url", "url('/images/overcast.jpg')");
  } else if ([1030, 1135, 1147].includes(weather.condition_code)) {
    layoutBg.style.setProperty("--url", "url('/images/fog.jpg')");
  } else if (
    [
      1063, 1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246,
    ].includes(weather.condition_code)
  ) {
    layoutBg.style.setProperty("--url", "url('/images/rain.jpg')");
  } else if ([1072, 1150, 1153, 1168, 1171].includes(weather.condition_code)) {
    layoutBg.style.setProperty("--url", "url('/images/drizzle.jpg')");
  } else if (
    [
      1066, 1069, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225,
      1237, 1249, 1252, 1255, 1258, 1261, 1264,
    ].includes(weather.condition_code)
  ) {
    layoutBg.style.setProperty("--url", "url('/images/snow.jpg')");
  } else if ([1087, 1273, 1276, 1279, 1282].includes(weather.condition_code)) {
    layoutBg.style.setProperty("--url", "url('/images/storm.jpg')");
  } else {
    layoutBg.style.setProperty("--url", "url('/images/random.jpg')");
  }
};
const getWeatherData = async (searchText) => {
  const current = await requestWeather("current", searchText);
  if (!current) {
    return null;
  }
  const astronomy = await requestWeather("astronomy", searchText);
  if (!astronomy) {
    return null;
  }

  const weather = {
    ...current,
    ...astronomy,
  };

  localStorage.setItem("weather", JSON.stringify(weather));
  return weather;
};

const initializeWeatherData = async () => {
  if (localStorage.getItem("weather")) {
    updatePageData(JSON.parse(localStorage.getItem("weather")));
    return;
  }
  const weather = await getWeatherData("San Diego");
  if (!weather) {
    return;
  }
  updatePageData(weather);
};

// Events ------------------->
// Window events
window.addEventListener("load", initializeWeatherData);

// Click events
document.querySelector("body").addEventListener("click", focusOutInput);
document
  .querySelector("#search-container")
  .addEventListener("click", focusInInput);
document
  .querySelector("#search-button")
  .addEventListener("click", clickSearchButton);

// Key press events
document.querySelector("#search").addEventListener("keypress", inputEntered);

// Input events
document.querySelector("#search").addEventListener("input", inputChanged);
