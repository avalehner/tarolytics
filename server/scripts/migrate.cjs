require("dotenv/config");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
});

(async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      readFileSync(
        join(__dirname, "../migrations/001_reading_save_requests.sql"),
        "utf8",
      ),
    );
    await client.query("COMMIT");
    console.log("Reading save request migration applied (safe to rerun).");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
})()
  .catch((error) => {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
