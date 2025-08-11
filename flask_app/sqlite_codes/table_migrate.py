import psycopg2
import sqlite3
import json
import decimal

# Connect to Postgres
pg_conn = psycopg2.connect(
    host="cxo-concierge.postgres.database.azure.com",
    dbname="postgres",
    user="cxoadmin",
    password="dbadmin@2024"
)
pg_cur = pg_conn.cursor()

# Connect to SQLite
sqlite_conn = sqlite3.connect(r'D:\Ambarish\softwares\sqlite\vocalytics.sqlite')
sqlite_cur = sqlite_conn.cursor()

# Enable foreign keys in SQLite
sqlite_cur.execute("PRAGMA foreign_keys = ON;")

# Function to migrate one table
def migrate_table(table_name, columns, json_columns=[]):
    pg_cur.execute(f"SELECT {', '.join(columns)} FROM {table_name}")
    rows = pg_cur.fetchall()

    placeholders = ', '.join(['?'] * len(columns))
    insert_sql = f"INSERT INTO {table_name.split('.')[-1]} ({', '.join(columns)}) VALUES ({placeholders})"

    for row in rows:
        row = list(row)
        # convert JSON columns to string
        for i, col in enumerate(columns):
            if col in json_columns and row[i] is not None:
                row[i] = json.dumps(row[i])
            elif isinstance(row[i], decimal.Decimal):
                row[i] = float(row[i])
        sqlite_cur.execute(insert_sql, row)

    sqlite_conn.commit()
    print(f"Migrated {len(rows)} rows from {table_name}")

# Migrate each table with proper columns
#migrate_table('vocalytics.users', ['user_id', 'name', 'email', 'role', 'supervisor_id', 'team_name', 'join_date', 'is_active'])
#migrate_table('vocalytics.agents_ai_insights', ['user_id', 'strengths', 'area_of_improvement', 'action_items', 'generated_at'])
#migrate_table('vocalytics.calls', ['call_id', 'user_id', 'duration_sec', 'language', 'transcript_text', 'call_type'])
migrate_table('vocalytics.call_sentiments', ['call_id', 'overall_sentiment', 'sentiment_score', 'sentiment_breakdown', 'conversation_tags', 'analyzed_at'], json_columns=['sentiment_breakdown', 'conversation_tags'])
migrate_table('vocalytics.escalations', ['escalation_id', 'call_id', 'agent_id', 'supervisor_id', 'escalation_reason', 'possible_action', 'created_at', 'status', 'last_actioned_at'])
migrate_table('vocalytics.leaderboard', ['user_name', 'total_calls', 'positive_calls', 'negative_calls', 'performance_score', 'rank'])

pg_cur.close()
pg_conn.close()
sqlite_cur.close()
sqlite_conn.close()
