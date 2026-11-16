from fastapi import APIRouter, HTTPException
from database import get_connection
from datetime import datetime, date
from passlib.context import CryptContext
from schemas import SignupRequest

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/signup", status_code = 201)
def Signup(data:SignupRequest):

    conn = None
    cursor = None

    try:

        conn = get_connection()
        cursor = conn.cursor()

        # ---------------------------
        # Generate User_id 
        # ---------------------------
        prefix = "USER_"

        cursor.execute("""
            SELECT user_id
            FROM users
            WHERE user_id LIKE %s
            ORDER BY user_id DESC
            LIMIT 1
        """, (f"{prefix}%",))

        last_user = cursor.fetchone()

        if last_user:
            last_id = last_user[0]
            number = int(last_id.split("_")[1])
            next_number = number + 1
        else:
            next_number = 1

        user_id = f"{prefix}{next_number:03d}"

        # ---------------------------
        # Current Date & Time
        # ---------------------------
        today = datetime.now()

        # ---------------------------
        # Hash Password
        # ---------------------------
        password_hash = pwd_context.hash(data.password)

        # ----------------------------------
        # Data Inset Into Tables
        # ----------------------------------
        cursor.execute('''
            INSERT INTO users(
                user_id, user_name, user_email, password_hash, user_phone, 
                role_id, is_active, created_at, updated_at
            )
            VALUES(%s, %s, %s, %s, %s, %s, True, %s, %s)
        ''', (
            user_id, data.user_name, data.user_email, password_hash,
            data.user_phone, data.role_id, today, today
            )
        )

        conn.commit()

        return{
            "Message": "User Created Successfully",
            "user_name": data.user_name
        }

    except HTTPException:
        raise

    except Exception as e:
        print(f"error {e}")
        raise HTTPException(
            status_code = 500, 
            detail= "Internal Server Error"
        )

    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()


