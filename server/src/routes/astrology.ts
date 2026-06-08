import { Router, Request, Response } from "express";
import pool from "../db";

const astrologyRouter = Router();

astrologyRouter.get("/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const dbResponse = await pool.query(
      `
      SELECT birthday, birth_time, birth_timezone, birth_location, birth_city
      FROM users 
      WHERE id = $1`,
      [userId],
    );

    const userData = dbResponse.rows[0];

    //birthday
    const birthdayStr = userData.birthday.toISOString().split("T")[0];
    const birthdayDate = new Date(userData.birthday);
    const year = birthdayDate.getFullYear();
    const month = birthdayDate.getUTCMonth() + 1; // +1 because getUTCMonth() is 0-indexed (Jan = 0)
    const date = birthdayDate.getUTCDate();

    //birth time
    const [h, m, s] = userData.birth_time.split(":");
    const hours = parseInt(h);
    const minutes = parseInt(m);
    const seconds = parseInt(s);

    //birth location
    const lng = userData.birth_location.x;
    const lat = userData.birth_location.y;

    //birth timezone
    function getBirthUTCOffset(
      timezone: string,
      birthday: string,
      birthTime: string,
    ): number {
      const birthDateTime = new Date(`${birthday}T${birthTime}`);
      const utc = new Date(
        birthDateTime.toLocaleString("en-US", { timeZone: "UTC" }),
      );
      const local = new Date(
        birthDateTime.toLocaleString("en-US", { timeZone: timezone }),
      );
      return (local.getTime() - utc.getTime()) / (1000 * 60 * 60);
    }

    const astroPayload = {
      year: year,
      month: month,
      date: date,
      hours: hours,
      minutes: minutes,
      seconds: seconds,
      latitude: lat,
      longitude: lng,
      timezone: getBirthUTCOffset(
        userData.birth_timezone,
        birthdayStr,
        userData.birth_time,
      ),
    };

    console.log(astroPayload);

    const response = await fetch(
      `https://json.freeastrologyapi.com/western/natal-wheel-chart`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": `${process.env.ASTROLOGY_API_KEY}`,
        },
        body: JSON.stringify(astroPayload),
      },
    );

    if (!response.ok)
      throw new Error(
        `Server error - astrology API, astrology.ts: ${response.status}`,
      );

    const astroData = await response.json();
    const chartURL = astroData.output;

    res.status(200).json({ chartUrl: chartURL });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unkown error";
    res.status(500).json({ error: message });
  }
});

export default astrologyRouter;
