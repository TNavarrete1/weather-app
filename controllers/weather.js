import axios from "axios";

export const current = async (req, res, next) => {
  const API_URL = process.env.API_CURRENT_URL;
  const { city } = req.query;

  try {
    const weather = await axios.get(`${API_URL}&q=${city}`);
    const current = weather.data.current;

    res.status(201).json({
      message: "Successful api call",
      city: weather.data.location.name,
      localtime: weather.data.location.localtime,
      temp_f: current.temp_f,
      condition_text: current.condition.text,
      condition_icon: current.condition.icon,
      condition_code: current.condition.code,
      wind_mph: current.wind_mph,
      wind_degree: current.wind_degree,
      humidity: current.humidity,
      cloud: current.cloud,
      feelslike_f: current.feelslike_f,
      gust_mph: current.gust_mph,
    });
  } catch (error) {
    res.status(401).json({
      message: "Unsuccesful api call",
      error: error.message,
    });
  }
};

export const astronomy = async (req, res, next) => {
  const API_URL = process.env.API_ASTRONOMY_URL;
  const { city } = req.query;

  try {
    const weather = await axios.get(`${API_URL}&q=${city}`);
    const astronomy = weather.data.astronomy.astro;

    res.status(201).json({
      message: "Successful api call",
      sunrise: astronomy.sunrise,
      sunset: astronomy.sunset,
      moonrise: astronomy.moonrise,
      moonset: astronomy.moonset,
    });
  } catch (error) {
    res.status(401).json({
      message: "Unsuccesful api call",
      error: error.message,
    });
  }
};

export const search = async (req, res, next) => {
  const API_URL = process.env.API_SEARCH_URL;
  const { city } = req.query;

  try {
    const search = await axios.get(`${API_URL}&q=${city}`);

    res.status(201).json({
      message: "Successfull api call",
      search: search.data,
    });
  } catch (error) {
    res.status(401).json({
      message: "Unsuccessfull api call",
      error: error.message,
    });
  }
};
