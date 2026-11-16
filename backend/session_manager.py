from datetime import datetime, timedelta
from dotenv import load_dotenv
import secrets
import os

load_dotenv()

# ============================================================
# Session Storage
# ============================================================

sessions = {}


# ============================================================
# Create Session
# ============================================================

def create_session(user_id, user_name, role_name):

    session_id = secrets.token_urlsafe(32)

    now = datetime.utcnow()

    expires_at = now + timedelta(
        minutes=int(os.getenv("SESSION_EXPIRE_MINUTES"))
    )

    sessions[session_id] = {

        "user_id": user_id,

        "user_name": user_name,

        "role_name": role_name,

        "login_time": now,

        "expires_at": expires_at,
    }

    return session_id


# ============================================================
# Delete Session
# ============================================================

def delete_session(session_id):

    sessions.pop(session_id, None)
