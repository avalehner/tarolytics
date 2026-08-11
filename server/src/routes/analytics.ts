import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import pool from "../db";

const analyticsRouter = Router();

analyticsRouter.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    //need to type cast as any because there is no userId property on the Request type
    const userId = (req as any).userId; //from the JWT, not the url

    const combinedStatsQuery = ` 
      SELECT 
        (SELECT COUNT(*)
        FROM readings WHERE user_id = $1) AS total_readings, 

        (SELECT COUNT(DISTINCT REGEXP_REPLACE(card_name, ' rx$', ''))
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
      SELECT REGEXP_REPLACE(card_name, ' rx$', '') AS card_name, COUNT(*) AS pull_count
      FROM cards
      JOIN readings ON cards.reading_id = readings.id
      WHERE readings.user_id = $1
      GROUP BY REGEXP_REPLACE(card_name, ' rx$', '')
      ORDER BY pull_count DESC
      LIMIT 6;
    `;

    const suitTrendQuery = `
      SELECT 
        TO_CHAR(readings.reading_date, 'Mon') AS month,
        EXTRACT(YEAR FROM readings.reading_date) AS year,
        EXTRACT(MONTH FROM readings.reading_date) AS month_num,
        ROUND(COUNT(*) FILTER (WHERE cards.suit = 'cups') * 100.0 / NULLIF(COUNT(*), 0), 1) AS cups,
        ROUND(COUNT(*) FILTER (WHERE cards.suit = 'swords') * 100.0 / NULLIF(COUNT(*), 0), 1) AS swords,
        ROUND(COUNT(*) FILTER (WHERE cards.suit = 'wands') * 100.0 / NULLIF(COUNT(*), 0), 1) AS wands,
        ROUND(COUNT(*) FILTER (WHERE cards.suit = 'pentacles') * 100.0 / NULLIF(COUNT(*), 0), 1) AS pentacles,
        ROUND(COUNT(*) FILTER (WHERE cards.suit IS NULL) * 100.0 / NULLIF(COUNT(*), 0), 1) AS major
      FROM cards
      JOIN readings ON cards.reading_id = readings.id
      WHERE readings.user_id = $1
      GROUP BY TO_CHAR(readings.reading_date, 'Mon'), EXTRACT(YEAR FROM readings.reading_date), EXTRACT(MONTH FROM readings.reading_date)
      ORDER BY year ASC, month_num ASC;
    `;

    const readingsPerMonthQuery = `
    SELECT
      TO_CHAR(reading_date, 'YYYY-MM') AS month,
      COUNT(*) AS readings
    FROM readings
    WHERE user_id = $1
    GROUP BY TO_CHAR(reading_date, 'YYYY-MM')
    ORDER BY month ASC;
    `;

    // COUNT(*) returns the total number of rows in a table or filtered result set
    // :: shorthand operator for data type casting
    // JOIN combine columns from two or more tables into a single result set based on a related column between them

    const [summaryStats, mostPulled, suitTrend, pullsPerMonth] =
      await Promise.all([
        pool.query(combinedStatsQuery, [userId]),
        pool.query(mostPulledQuery, [userId]),
        pool.query(suitTrendQuery, [userId]),
        pool.query(readingsPerMonthQuery, [userId]),
      ]);

    const data = {
      summary_stats: summaryStats.rows[0],
      most_pulled: mostPulled.rows,
      suit_trend: suitTrend.rows,
      readings_per_month: pullsPerMonth.rows,
    };

    res.status(200).json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

analyticsRouter.get(
  "/card-search",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { cardName, timePeriod } = req.query;
      const dbResponse = await pool.query(
        `
        SELECT 
          COUNT(*) AS total_pulls, 
          MIN(cards.suit) AS suit, 
          COUNT(*) FILTER (WHERE cards.reversed = true) AS reversed_pulls, 
          ROUND(COUNT(*) FILTER (WHERE cards.reversed = true) * 100.00 / NULLIF(COUNT(*), 0), 1) AS reversed_pct, 
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'reading_id', readings.id, 
              'date', readings.reading_date, 
              'spread_type', readings.spread_type, 
              'position_name', cards.position_name, 
              'notes', readings.notes
            )) FILTER (WHERE readings.notes IS NOT NULL AND readings.notes != '')
          AS reading_notes 
        FROM cards
        LEFT JOIN readings ON cards.reading_id = readings.id
        WHERE readings.user_id = $1
          AND (cards.card_name = $2 OR cards.card_name = $2 || ' rx')
          AND ($3::int IS NULL OR readings.reading_date >= NOW() - ($3 || ' days')::interval)
      `,
        [userId, cardName, timePeriod],
      );

      const cardSearchData = dbResponse.rows[0];
      res.status(200).json(cardSearchData);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown Error";
      res.status(500).json({ error: message });
    }
  },
);

export default analyticsRouter;
