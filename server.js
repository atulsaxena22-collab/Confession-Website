const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

app.use(express.json());
app.use(express.static(__dirname));

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS confessions (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL DEFAULT 'Anonymous',
      confession TEXT NOT NULL,
      date TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  console.log("PostgreSQL connected and table ready.");
}

app.post("/api/confessions", async (req, res) => {
  try {
    const { name, confession } = req.body;

    if (!confession || confession.trim() === "") {
      return res.status(400).json({
        message: "Confession cannot be empty."
      });
    }

    const result = await pool.query(
      `INSERT INTO confessions (name, confession)
       VALUES ($1, $2)
       RETURNING id, name, confession, date`,
      [
        name && name.trim() ? name.trim() : "Anonymous",
        confession.trim()
      ]
    );

    res.status(201).json({
      message: "Confession submitted successfully.",
      confession: result.rows[0]
    });

  } catch (error) {
    console.error("Error saving confession:", error);
    res.status(500).json({
      message: "Failed to save confession."
    });
  }
});

app.get("/api/confessions", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, confession, date
       FROM confessions
       ORDER BY date DESC`
    );

    res.json(result.rows);

  } catch (error) {
    console.error("Error fetching confessions:", error);
    res.status(500).json({
      message: "Failed to fetch confessions."
    });
  }
});

app.delete("/api/confessions/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "Invalid confession ID."
      });
    }

    const result = await pool.query(
      `DELETE FROM confessions
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Confession not found."
      });
    }

    res.json({
      message: "Confession deleted successfully."
    });

  } catch (error) {
    console.error("Error deleting confession:", error);
    res.status(500).json({
      message: "Failed to delete confession."
    });
  }
});

app.get("/api/test", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      message: "Confession Server is Working!"
    });

  } catch (error) {
    console.error("Database test failed:", error);

    res.status(500).json({
      message: "Database connection failed."
    });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `Confession Website running at http://localhost:${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error("Database initialization failed:", error);
    process.exit(1);
  });
