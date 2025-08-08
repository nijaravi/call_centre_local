require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Connection
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
  ssl: { rejectUnauthorized: false }, // Required for Azure
});

// Routes
app.get("/api/calls-today/:agentId", async (req, res) => {
  const { agentId } = req.params;
  try {
    const result = await pool.query(
      `SELECT COUNT(*) AS calls_today
      FROM vocalytics.calls
      WHERE user_id = $1
      AND call_id IN (
      SELECT call_id FROM vocalytics.call_sentiments
      WHERE DATE(analyzed_at) = CURRENT_DATE
      );`,
      [agentId]
    );
    res.json({ count: result.rows[0].calls_today });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.get("/api/weekly-volume/:agentId", async (req, res) => {
  const { agentId } = req.params;
  try {
    const result = await pool.query(
      `SELECT 
      TO_CHAR(DATE(analyzed_at), 'YYYY-MM-DD') AS day,
      COUNT(*)::INTEGER AS count
    FROM vocalytics.call_sentiments cs
    JOIN vocalytics.calls c ON cs.call_id = c.call_id
    WHERE c.user_id = $1
      AND analyzed_at >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY day
    ORDER BY day`,
      [agentId]
    );
    console.log("reslut", result);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.get("/api/performance-score/:agentId", async (req, res) => {
  const { agentId } = req.params;
  try {
    const result = await pool.query(
      `SELECT ROUND(AVG(CASE 
          WHEN cs.overall_sentiment = 'positive' THEN 1.0 
          WHEN cs.overall_sentiment = 'neutral' THEN 0.5 
          ELSE 0 END), 2) AS score 
         FROM vocalytics.calls c 
         JOIN vocalytics.call_sentiments cs ON c.call_id = cs.call_id 
         WHERE c.user_id = $1 AND analyzed_at >= date_trunc('month', CURRENT_DATE)`,
      [agentId]
    );
    res.json({ score: result.rows[0].score });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.get("/api/leaderboard-rank/:agentId", async (req, res) => {
  const { agentId } = req.params;
  try {
    const result = await pool.query(
      `WITH scores AS (
            SELECT c.user_id, COUNT(*) AS call_volume
            FROM vocalytics.calls c
            JOIN vocalytics.call_sentiments cs ON c.call_id = cs.call_id
            WHERE cs.analyzed_at >= date_trunc('month', CURRENT_DATE)
            GROUP BY c.user_id
            ),
            ranked AS (
            SELECT user_id, RANK() OVER (ORDER BY call_volume DESC) AS rank
            FROM scores
            )
            SELECT rank FROM ranked WHERE user_id = $1;`,
      [agentId]
    );
    console.log("rank", result.rows[0].rank);
    res.json({ rank: result.rows[0].rank });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.get("/api/sentiment-distribution/:agentId", async (req, res) => {
  const { agentId } = req.params;
  console.log("supervisor_id", agentId);
  try {
    const result = await pool.query(
      `SELECT 
      cs.overall_sentiment,
      COUNT(*)::INTEGER AS count
  FROM vocalytics.call_sentiments cs
  JOIN vocalytics.calls c ON cs.call_id = c.call_id
  WHERE c.user_id = $1
  GROUP BY cs.overall_sentiment
  ORDER BY cs.overall_sentiment;`,
      [agentId]
    );
    res.json({ sentiment: result.rows });
  } catch (err) {
    console.error("Error fetching sentiment distribution:", err);
    res.status(500).send("Server error");
  }
});

app.get("/api/calls-by-tag/:agentId", async (req, res) => {
  const { agentId } = req.params;
  try {
    const result = await pool.query(
      `SELECT tag, COUNT(*) ::INTEGER AS count
      FROM (
        SELECT jsonb_array_elements_text(conversation_tags) AS tag 
        FROM vocalytics.call_sentiments 
        JOIN vocalytics.calls USING (call_id) 
        WHERE user_id = $1
      ) t 
      GROUP BY tag
      order by count DESC
      LIMIT 5`,
      [agentId]
    );
    res.json({ calls: result.rows });
  } catch (err) {
    console.error("Error fetching calls by tag:", err);
    res.status(500).send("Server error");
  }
});

app.get("/api/recent-escalations/:agentId", async (req, res) => {
  const { agentId } = req.params;
  try {
    const result = await pool.query(
      `SELECT e.call_id, e.escalation_reason, e.possible_action, e.created_at 
         FROM vocalytics.escalations e 
         WHERE agent_id = $1 
         ORDER BY created_at DESC 
         LIMIT 4`,
      [agentId]
    );
    res.json({ escalations: result.rows });
  } catch (err) {
    console.error("Error fetching recent escalations:", err);
    res.status(500).send("Server error");
  }
});

app.get("/api/recent-calls/:agentId", async (req, res) => {
  const { agentId } = req.params;
  try {
    const result = await pool.query(
      `SELECT c.call_id, c.duration_sec, c.language, cs.overall_sentiment, cs.analyzed_at 
         FROM vocalytics.calls c 
         JOIN vocalytics.call_sentiments cs ON c.call_id = cs.call_id 
         WHERE c.user_id = $1 
         ORDER BY cs.analyzed_at DESC 
         LIMIT 5`,
      [agentId]
    );
    res.json({ calls: result.rows });
  } catch (err) {
    console.error("Error fetching recent calls:", err);
    res.status(500).send("Server error");
  }
});

app.get("/api/agent-insights/:agentId", async (req, res) => {
  const { agentId } = req.params;
  try {
    const result = await pool.query(
      `SELECT user_id, strengths, area_of_improvement, action_items
       FROM vocalytics.agents_ai_insights
       WHERE user_id = $1`,
      [agentId]
    );
    res.json({ insights: result.rows });
  } catch (err) {
    console.error("Error fetching agent insights:", err);
    res.status(500).send("Server error");
  }
});

// supervisor

app.get("/api/supervisor/calls-today/:supervisorId", async (req, res) => {
  const { supervisorId } = req.params;
  try {
    const result = await pool.query(
      `SELECT COUNT(*) AS total_calls_today
       FROM vocalytics.calls
       WHERE user_id IN (
         SELECT user_id FROM vocalytics.users WHERE supervisor_id = $1
       )
       AND call_id IN (
         SELECT call_id FROM vocalytics.call_sentiments
         WHERE DATE(analyzed_at) = CURRENT_DATE
       )`,
      [supervisorId]
    );
    res.json({ count: result.rows[0].total_calls_today });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.get("/api/supervisor/weekly-volume/:supervisorId", async (req, res) => {
  const { supervisorId } = req.params;
  try {
    const result = await pool.query(
      `SELECT COUNT(*) AS weekly_calls
      FROM vocalytics.call_sentiments cs
      JOIN vocalytics.calls c ON cs.call_id = c.call_id
      WHERE c.user_id IN (
      SELECT user_id FROM vocalytics.users WHERE supervisor_id = $1
      )
      AND cs.analyzed_at >= CURRENT_DATE - INTERVAL '7 days';`,
      [supervisorId]
    );
    res.json({ count: result.rows[0].weekly_calls });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.get(
  "/api/supervisor/monthly-escalations/:supervisorId",
  async (req, res) => {
    const { supervisorId } = req.params;
    try {
      const result = await pool.query(
        `SELECT COUNT(*) AS monthly_escalations
      FROM vocalytics.escalations
      WHERE supervisor_id = $1
      AND created_at >= date_trunc('month', CURRENT_DATE);`,
        [supervisorId]
      );
      res.json({ count: result.rows[0].monthly_escalations });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

app.get("/api/supervisor/agent-performance/:supervisorId", async (req, res) => {
  const { supervisorId } = req.params;
  try {
    const result = await pool.query(
      `SELECT u.name, COUNT(cs.call_id) AS total_calls,
      SUM(CASE WHEN cs.overall_sentiment = 'positive' THEN 1 ELSE 0 END)
      AS positive_calls,
      SUM(CASE WHEN cs.overall_sentiment = 'negative' THEN 1 ELSE 0 END)
      AS negative_calls
      FROM vocalytics.users u
      JOIN vocalytics.calls c ON u.user_id = c.user_id
      JOIN vocalytics.call_sentiments cs ON c.call_id = cs.call_id
      WHERE u.supervisor_id = $1
      GROUP BY u.name;`,
      [supervisorId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.get(
  "/api/supervisor/tag-sentiment-heatmap/:supervisorId",
  async (req, res) => {
    const { supervisorId } = req.params;
    try {
      const result = await pool.query(
        `WITH top_tags AS (
          SELECT tag
          FROM (
            SELECT jsonb_array_elements_text(conversation_tags) AS tag
            FROM vocalytics.call_sentiments
            JOIN vocalytics.calls USING (call_id)
            WHERE user_id IN (
              SELECT user_id FROM vocalytics.users WHERE supervisor_id = $1
            )
          ) AS tag_list
          GROUP BY tag
          ORDER BY COUNT(*) DESC
          LIMIT 6
        )

        SELECT tag, overall_sentiment, COUNT(*)::INTEGER AS count
        FROM (
          SELECT jsonb_array_elements_text(conversation_tags) AS tag, overall_sentiment
          FROM vocalytics.call_sentiments
          JOIN vocalytics.calls USING (call_id)
          WHERE user_id IN (
            SELECT user_id FROM vocalytics.users WHERE supervisor_id = $1
          )
        ) AS all_data
        WHERE tag IN (SELECT tag FROM top_tags)
        GROUP BY tag, overall_sentiment
        ORDER BY tag, overall_sentiment;`,
        [supervisorId]
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

app.get("/api/supervisor/team-sentiment/:supervisorId", async (req, res) => {
  const { supervisorId } = req.params;
  try {
    const result = await pool.query(
      `SELECT cs.overall_sentiment, COUNT(*) ::INTEGER AS count
      FROM vocalytics.call_sentiments cs
      JOIN vocalytics.calls c ON cs.call_id = c.call_id
      WHERE c.user_id IN (
      SELECT user_id FROM vocalytics.users WHERE supervisor_id = $1
      )
      GROUP BY cs.overall_sentiment;`,
      [supervisorId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.get("/api/supervisor/escalations/:supervisorId", async (req, res) => {
  const { supervisorId } = req.params;
  try {
    const result = await pool.query(
      `SELECT
      call_id,
      agent_id,
      escalation_reason,
      possible_action,
      escalation_id,
      status,
      u."name",
      CASE
        WHEN status = 'Closed' THEN 'Resolved'
        WHEN status = 'Open' AND DATE(created_at) = CURRENT_DATE THEN 'Open today'
        WHEN status = 'Open' AND DATE(created_at) < CURRENT_DATE THEN
          'Not actioned since ' || (CURRENT_DATE - DATE(created_at)) || ' days'
        WHEN status != 'Closed' AND last_actioned_at IS NOT NULL THEN
          'Last actioned ' || (CURRENT_DATE - DATE(last_actioned_at)) || ' days ago'
        ELSE 'Status Unknown'
      END AS status_display
    FROM vocalytics.escalations e
    JOIN vocalytics.users u ON u.user_id = e.agent_id
    WHERE e.supervisor_id = $1
    ORDER BY call_id ASC
    LIMIT 10;`,
      [supervisorId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("err", err);
    res.status(500).send("Server error");
  }
});

app.get("/api/supervisor/learderboad", async (req, res) => {
  try {
    const result = await pool.query(
      `select user_name as Name, positive_calls ,negative_calls , "rank"   as rank, performance_score  
      from vocalytics.leaderboard l 
      order by "rank" asc limit 15`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.get("/api/supervisor/compare-agents", async (req, res) => {
  const { agent1, agent2 } = req.query;

  try {
    const result = await pool.query(
      `SELECT u.name,
      COUNT(cs.call_id) AS call_count,
      AVG(cs.sentiment_score) AS avg_sentiment,
      SUM(CASE WHEN cs.overall_sentiment = 'negative' THEN 1 ELSE 0 END) AS negative_calls
FROM vocalytics.users u
JOIN vocalytics.calls c ON u.user_id = c.user_id
JOIN vocalytics.call_sentiments cs ON c.call_id = cs.call_id
WHERE u.user_id IN ($1, $2)
GROUP BY u.name;`,
      [agent1, agent2]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error in compare-agents route:", err);
    res.status(500).send("Server error");
  }
});

// Assuming you're using Express and a PostgreSQL database with a pool of connections

app.post("/api/supervisor/update-status", async (req, res) => {
  const { callId, newStatus } = req.body;

  console.log("newStatus", newStatus, callId);
  if (!callId || !newStatus) {
    return res.status(400).json({ error: "Missing callId or newStatus" });
  }

  try {
    const updateQuery = `
      UPDATE vocalytics.escalations
      SET status = $1, last_actioned_at = NOW()
      WHERE call_id = $2
      RETURNING call_id, status, last_actioned_at;
    `;

    const result = await pool.query(updateQuery, [`${newStatus}`, callId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Call not found" });
    }

    const updatedCall = result.rows[0];
    console.log("updatedCall", updatedCall);
    res.json(updatedCall);
  } catch (err) {
    console.error("Error in update-status route:", err);
    res.status(500).send("Server error");
  }
});

app.get("/api/call-count-by-tag", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT tag, COUNT(*)::INTEGER  AS count
      FROM (
      SELECT jsonb_array_elements_text(conversation_tags) AS tag
      FROM vocalytics.call_sentiments
      ) AS tag_data
      GROUP BY tag
      ORDER BY count DESC
      limit 20;`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error in /call-count-by-tag:", err);
    res.status(500).send("Server error");
  }
});

app.get("/api/sentiment-by-tag", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
  tag,
  overall_sentiment,
  ROUND(CASE
    WHEN tag = 'credit card' AND overall_sentiment = 'positive' THEN 50
    WHEN tag = 'credit card' AND overall_sentiment = 'neutral' THEN 25
    WHEN tag = 'credit card' AND overall_sentiment = 'negative' THEN 25

    WHEN tag = 'auto loan' AND overall_sentiment = 'positive' THEN 70
    WHEN tag = 'auto loan' AND overall_sentiment = 'neutral' THEN 20
    WHEN tag = 'auto loan' AND overall_sentiment = 'negative' THEN 10

    WHEN tag = 'interest rate' AND overall_sentiment = 'positive' THEN 60
    WHEN tag = 'interest rate' AND overall_sentiment = 'neutral' THEN 30
    WHEN tag = 'interest rate' AND overall_sentiment = 'negative' THEN 10

    WHEN tag = 'online banking' AND overall_sentiment = 'positive' THEN 65
    WHEN tag = 'online banking' AND overall_sentiment = 'neutral' THEN 20
    WHEN tag = 'online banking' AND overall_sentiment = 'negative' THEN 15

    WHEN tag = 'credit score' AND overall_sentiment = 'positive' THEN 70
    WHEN tag = 'credit score' AND overall_sentiment = 'neutral' THEN 15
    WHEN tag = 'credit score' AND overall_sentiment = 'negative' THEN 15

    WHEN tag = 'interest rates' AND overall_sentiment = 'positive' THEN 60
    WHEN tag = 'interest rates' AND overall_sentiment = 'neutral' THEN 25
    WHEN tag = 'interest rates' AND overall_sentiment = 'negative' THEN 15

    ELSE 0
  END)::INTEGER AS count
FROM (
  SELECT
    unnest(ARRAY[
      'credit card', 'credit card', 'credit card',
      'auto loan', 'auto loan', 'auto loan',
      'interest rate', 'interest rate', 'interest rate',
      'online banking', 'online banking', 'online banking',
      'credit score', 'credit score', 'credit score',
      'interest rates', 'interest rates', 'interest rates'
    ]) AS tag,
    unnest(ARRAY[
      'positive', 'neutral', 'negative',
      'positive', 'neutral', 'negative',
      'positive', 'neutral', 'negative',
      'positive', 'neutral', 'negative',
      'positive', 'neutral', 'negative',
      'positive', 'neutral', 'negative'
    ]) AS overall_sentiment
) AS simulated_data;`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error in /sentiment-by-tag:", err);
    res.status(500).send("Server error");
  }
});

app.get("/api/escalation-by-tag", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT tag, COUNT(*) ::INTEGER AS count
      FROM (
      SELECT jsonb_array_elements_text(cs.conversation_tags) AS tag
      FROM vocalytics.call_sentiments cs
      JOIN vocalytics.escalations e ON cs.call_id = e.call_id
      ) AS tag_escalations
      GROUP BY tag
      ORDER BY count DESC
      limit 10;`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error in /escalation-by-tag:", err);
    res.status(500).send("Server error");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
