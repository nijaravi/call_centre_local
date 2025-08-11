from flask import Flask, jsonify
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)

# Connect to PostgreSQL
conn = psycopg2.connect(
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    dbname=os.getenv("DB_NAME"),
    port=5432,
    sslmode='require'  # if your DB needs SSL, otherwise remove this
)

@app.route("/api/weekly-volume/<agent_id>", methods=["GET"])
def weekly_volume(agent_id):
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT 
                  TO_CHAR(DATE(analyzed_at), 'YYYY-MM-DD') AS day,
                  COUNT(*)::INTEGER AS count
                FROM vocalytics.call_sentiments cs
                JOIN vocalytics.calls c ON cs.call_id = c.call_id
                WHERE c.user_id = %s
                  AND analyzed_at >= CURRENT_DATE - INTERVAL '7 days'
                GROUP BY day
                ORDER BY day;
                """,
                (agent_id,)
            )
            result = cur.fetchall()
        print("result", result)
        return jsonify(result)
    except Exception as e:
        print("Error:", e)
        return "Server error", 500
    

@app.route("/api/performance-score/<agent_id>", methods=["GET"])
def performance_score(agent_id):
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT ROUND(AVG(CASE 
                    WHEN cs.overall_sentiment = 'positive' THEN 1.0 
                    WHEN cs.overall_sentiment = 'neutral' THEN 0.5 
                    ELSE 0 END), 2) AS score 
                FROM vocalytics.calls c 
                JOIN vocalytics.call_sentiments cs ON c.call_id = cs.call_id 
                WHERE c.user_id = %s AND analyzed_at >= date_trunc('month', CURRENT_DATE)
                """,
                (agent_id,)
            )
            result = cur.fetchone()
        return jsonify({"score": result["score"]})
    except Exception as e:
        print("Error:", e)
        return "Server error", 500


@app.route("/api/leaderboard-rank/<agent_id>", methods=["GET"])
def leaderboard_rank(agent_id):
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                WITH scores AS (
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
                SELECT rank FROM ranked WHERE user_id = %s;
                """,
                (agent_id,)
            )
            result = cur.fetchone()
        return jsonify({"rank": result["rank"] if result else None})
    except Exception as e:
        print("Error:", e)
        return "Server error", 500


@app.route("/api/sentiment-distribution/<agent_id>", methods=["GET"])
def sentiment_distribution(agent_id):
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT 
                    cs.overall_sentiment,
                    COUNT(*)::INTEGER AS count
                FROM vocalytics.call_sentiments cs
                JOIN vocalytics.calls c ON cs.call_id = c.call_id
                WHERE c.user_id = %s
                GROUP BY cs.overall_sentiment
                ORDER BY cs.overall_sentiment;
                """,
                (agent_id,)
            )
            result = cur.fetchall()
        return jsonify({"sentiment": result})
    except Exception as e:
        print("Error fetching sentiment distribution:", e)
        return "Server error", 500


@app.route("/api/calls-by-tag/<agent_id>", methods=["GET"])
def calls_by_tag(agent_id):
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT tag, COUNT(*)::INTEGER AS count
                FROM (
                    SELECT jsonb_array_elements_text(conversation_tags) AS tag
                    FROM vocalytics.call_sentiments
                    JOIN vocalytics.calls USING (call_id)
                    WHERE user_id = %s
                ) t
                GROUP BY tag
                ORDER BY count DESC
                LIMIT 5;
                """,
                (agent_id,)
            )
            result = cur.fetchall()
        return jsonify({"calls": result})
    except Exception as e:
        print("Error fetching calls by tag:", e)
        return "Server error", 500


@app.route("/api/recent-escalations/<agent_id>", methods=["GET"])
def recent_escalations(agent_id):
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT e.call_id, e.escalation_reason, e.possible_action, e.created_at
                FROM vocalytics.escalations e
                WHERE agent_id = %s
                ORDER BY created_at DESC
                LIMIT 4;
                """,
                (agent_id,)
            )
            result = cur.fetchall()
        return jsonify({"escalations": result})
    except Exception as e:
        print("Error fetching recent escalations:", e)
        return "Server error", 500


@app.route("/api/recent-calls/<agent_id>", methods=["GET"])
def recent_calls(agent_id):
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT c.call_id, c.duration_sec, c.language, cs.overall_sentiment, cs.analyzed_at
                FROM vocalytics.calls c
                JOIN vocalytics.call_sentiments cs ON c.call_id = cs.call_id
                WHERE c.user_id = %s
                ORDER BY cs.analyzed_at DESC
                LIMIT 5;
                """,
                (agent_id,)
            )
            result = cur.fetchall()
        return jsonify({"calls": result})
    except Exception as e:
        print("Error fetching recent calls:", e)
        return "Server error", 500



if __name__ == "__main__":
    app.run(port=int(os.getenv("PORT", 3002)), debug=True)
