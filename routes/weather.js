import express from "express";
import { astronomy, current, search } from "../controllers/weather.js";

const router = express.Router();

router.route("/current").get(current);
router.route("/astronomy").get(astronomy);
router.route("/search").get(search);

export default router;
