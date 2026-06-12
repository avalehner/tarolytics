import { Router, Request, Response } from "express";
import pool from "../db";

const astrologyRouter = Router();

astrologyRouter.get("/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const dbResponse = await pool.query(
      `SELECT full_name, birthday, birth_time, birth_timezone, birth_location, birth_city, natal_chart_svg, natal_chart_data 
      FROM users 
      WHERE id = $1`,
      [userId],
    );

    const userData = dbResponse.rows[0];

    //null guard
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    //birth data check
    if (!userData.birthday || !userData.birth_location) {
      return res.status(400).json({ error: "Birth data incomplete" });
    }

    //check cache
    if (userData.natal_chart_svg && userData.natal_chart_data) {
      return res.status(200).json({
        chartData: userData.natal_chart_svg,
        planetsData: userData.natal_chart_data.planets,
        interpretations: userData.natal_chart_data.interpretations,
      });
    }

    //birthday
    const birthdayDate = new Date(userData.birthday);
    const year = birthdayDate.getUTCFullYear();
    const month = birthdayDate.getUTCMonth() + 1; // +1 because getUTCMonth() is 0-indexed (Jan = 0)
    const day = birthdayDate.getUTCDate();

    //birth time
    const [h, m, s] = userData.birth_time.split(":");
    const hour = parseInt(h);
    const minute = parseInt(m);
    // const second = parseInt(s);

    //birth location
    const lng = userData.birth_location.x;
    const lat = userData.birth_location.y;
    const birthCity = userData.birth_city.split(",")[0];

    const astroPayloadInterpretations = {
      name: userData.full_name,
      year: year,
      month: month,
      day: day,
      time_known: true,
      hour: hour,
      minute: minute,
      city: birthCity,
      lat: lat,
      lng: lng,
      tz_str: userData.birth_timezone,
      response_format: "full",
      house_system: "placidus",
      zodiac_type: "tropical",
      include_speed: true,
      include_dignity: true,
      include_minor_aspects: true,
      include_stelliums: true,
      fixed_stars: ["royal_4", "Spica"],
      include_features: ["chiron", "lilith", "true_node"],
      interpretation: {
        enable: true,
        style: "improved",
      },
      orb_settings: {
        Conjunction: 8.0,
        Opposition: 8.0,
        Trine: 8.0,
        Square: 8.0,
        Sextile: 6.0,
      },
    };

    const astroPayloadImage = {
      name: userData.full_name,
      year: year,
      month: month,
      day: day,
      hour: hour,
      minute: minute,
      time_known: true,
      city: birthCity,
      lat: lat,
      lng: lng,
      tz_str: userData.birth_timezone,
      house_system: "placidus",
      format: "svg",
      size: 800,
      theme_type: "light",
      display_settings: {
        chiron: true,
        lilith: true,
      },
      chart_config: {
        //ivory ink theme
        chart_background: "#F6F1E8",
        custom_planet_color: "#1E1B18",
        custom_sign_color: "#6A5B48",
        custom_house_color: "#3E362C",
        custom_sign_bg_color: "#EFE4D3",
        custom_house_bg_color: "#FAF6EE",
        sign_line_color: "#3A3128",
        house_line_color: "#8C7C68",
        aspect_conjunction_color: "#2F2A24",
        aspect_opposition_color: "#A1362A",
        aspect_trine_color: "#1F4E79",
        aspect_square_color: "#8F2B23",
        aspect_sextile_color: "#355E8D",
        aspect_quincunx_color: "#4D6A3A",
      },
    };

    //chart
    const chartImageResponse = await fetch(
      `https://api.freeastroapi.com/api/v1/natal/chart/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": `${process.env.ASTRO_API_KEY}`,
          // "Idempotency-Key": `${userId}`,
        },
        body: JSON.stringify(astroPayloadImage),
      },
    );

    //wait 1.1 seconds between api requests
    await new Promise((resolve) => setTimeout(resolve, 1100));

    const chartInterpretationResponse = await fetch(
      `https://api.freeastroapi.com/api/v1/natal/calculate`,
      {
        //interpretations
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": `${process.env.ASTRO_API_KEY}`,
          // "Idempotency-Key": `${userId}`,
        },
        body: JSON.stringify(astroPayloadInterpretations),
      },
    );

    if (!chartImageResponse.ok) {
      const errorBody = await chartImageResponse.json().catch(() => ({}));
      throw new Error(
        `Chart API error ${chartImageResponse.status}: ${JSON.stringify(errorBody)}`,
      );
    }

    const buffer = await chartImageResponse.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const contentType =
      chartImageResponse.headers.get("Content-Type") || "image/svg+xml";
    const chartData = `data:${contentType};base64,${base64}`;

    if (!chartInterpretationResponse.ok)
      throw new Error(
        `Server error - astrology planets API, astrology.ts: ${chartInterpretationResponse.status}`,
      );

    const interpretationData = await chartInterpretationResponse.json();
    const planetData = interpretationData.planets;

    //add astro info to db
    await pool.query(
      `UPDATE users SET natal_chart_svg = $1, natal_chart_data = $2
      WHERE id = $3`,
      [
        chartData,
        JSON.stringify({
          planets: planetData,
          interpretations: interpretationData.interpretation,
        }),
        userId,
      ],
    );

    res.status(200).json({
      chartData: chartData,
      planetData: planetData,
      interpretations: interpretationData.interpretation,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unkown error";
    res.status(500).json({ error: message });
  }
});

export default astrologyRouter;
