import "dotenv/config.js"; // Loads .env variables into process.env
import express from "express";
import cookieParser from "cookie-parser";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import landingRouter from "./routes/landing.js";
import weatherRouter from "./routes/weather.js";

// Path to freenance folder
const root = dirname(fileURLToPath(import.meta.url));
// Stores express's application object into variable app
const app = express();
const PORT = process.env.PORT || 5000;
// Listens on client port
const server = app.listen(PORT, () => {
  console.log(`Connected on port ${PORT}`);
});

// configures server view engine to be set to ejs
app.set("view engine", "ejs");
app.set("views", path.join(root, "views"));

// Middleware
// Serves static files from public folder
app.use(express.static(path.join(root, "public")));
// Parses json data on every incoming request
app.use(express.json());
// Parses cookies attached to client req object
app.use(cookieParser());
// Serves website pages
app.use("/", landingRouter);
// Weather api
app.use("/api/weather", weatherRouter);

// Handling connection errors
process.on("unhandledRejection", (err) => {
  console.log(`An error occured: ${err.message}`);
  server.close(() => process.exit(1));
});
