import sqlite3
import os
from datetime import datetime

DB_PATH = "data/chat_logs.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            user_message TEXT,
            bot_reply TEXT,
            language TEXT,
            timestamp TEXT
        )
    """)
    conn.commit()
    conn.close()

def log_conversation(session_id: str, user_msg: str, bot_reply: str, lang: str):
    init_db()
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "INSERT INTO logs (session_id, user_message, bot_reply, language, timestamp) VALUES (?,?,?,?,?)",
        (session_id, user_msg, bot_reply, lang, datetime.now().isoformat())
    )
    conn.commit()
    conn.close()

def get_history(session_id: str) -> list:
    init_db()
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute(
        "SELECT user_message, bot_reply, language, timestamp FROM logs WHERE session_id=? ORDER BY id ASC",
        (session_id,)
    ).fetchall()
    conn.close()
    return [{"user": r[0], "bot": r[1], "lang": r[2], "time": r[3]} for r in rows]
