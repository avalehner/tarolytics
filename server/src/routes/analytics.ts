import { Router, Request, Response } from "express";
import pool from "../db";

const analyticsRouter = Router();

analyticsRouter.get("/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const combinedStatsQuery = ` 
      SELECT 
        (SELECT COUNT(*)
        FROM readings WHERE user_id = $1) AS total_readings, 

        (SELECT COUNT(DISTINCT card_name) 
        FROM cards JOIN readings ON cards.reading_id = readings.id 
        WHERE readings.user_id = $1) AS unique_cards, 
        
        (SELECT ROUND(COUNT(*) FILTER (WHERE suit IS NULL) * 100.0 / NULLIF(COUNT(*), 0), 1)
        FROM cards JOIN readings ON cards.reading_id = readings.id 
        WHERE readings.user_id = $1) AS major_arcana_pct, 

        (SELECT ROUND(
          COUNT(*)::decimal / NULLIF(
            CEIL((MAX(reading_date)::date - MIN(reading_date)::date) / 7.0), 0
          ), 1)
        FROM readings WHERE user_id = $1) AS avg_per_week
      `;

    const mostPulledQuery = `
      SELECT card_name, COUNT(*) AS pull_count
      FROM cards
      JOIN readings ON cards.reading_id = readings.id
      WHERE readings.user_id = $1
      GROUP BY card_name
      ORDER BY pull_count DESC
      LIMIT 10;
    `;

    const suitTrendQuery = `
      SELECT
        COALESCE(suit::text, 'major arcana') AS suit,
        COUNT(*) AS count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) AS percentage
      FROM cards
      JOIN readings ON cards.reading_id = readings.id
      WHERE readings.user_id = $1
      GROUP BY suit
      ORDER BY count DESC;
    `;

    // COUNT(*) returns the total number of rows in a table or filtered result set
    // :: shorthand operator for data type casting
    // JOIN combine columns from two or more tables into a single result set based on a related column between them

    const [summaryStats, mostPulled, suitTrend] = await Promise.all([
      pool.query(combinedStatsQuery, [userId]),
      pool.query(mostPulledQuery, [userId]),
      pool.query(suitTrendQuery, [userId]),
    ]);

    const data = {
      summary_stats: summaryStats.rows[0],
      most_pulled: mostPulled.rows,
      suit_trend: suitTrend.rows,
    };

    res.status(200).json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

export default analyticsRouter;
