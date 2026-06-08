import { Router, Request, Response } from "express";
import pool from "../db";

const usersRouter = Router();

usersRouter.patch("/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { birthday, birth_time, birth_timezone, birth_location } = req.body;
    const pointStr = birth_location
      ? `(${birth_location.lng}, ${birth_location.lat})`
      : null;
    const birthCity = birth_location?.formatted;

    const dbResponse = await pool.query(
      `
      UPDATE users 
      SET birthday = $1, birth_time = $2, birth_timezone = $3, birth_location = $4, birth_city = $5
      WHERE id =  $6
      RETURNING *;`,
      [birthday, birth_time, birth_timezone, pointStr, birthCity, userId],
    );

    const updatedUser = dbResponse.rows[0];
    res.status(201).json(updatedUser);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown errors";
    res.status(500).json({ error: message });
  }
});

export default usersRouter;
