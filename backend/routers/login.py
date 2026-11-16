from fastapi import APIRouter, HTTPException, Response, Depends
from passlib.context import CryptContext
from database import get_connection
from dependencies import get_current_user
from schemas import LoginRequest
from session_manager import create_session


router = APIRouter()


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# =========================
# Login Page API
# =========================
@router.post("/login", status_code = 200)
def login(data: LoginRequest, response: Response):

    conn = None
    cursor = None

    try:

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT user_id, user_name, role_id, password_hash 
            FROM users 
            WHERE user_name = %s AND is_active = true
        ''', (data.username,))

        user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=401, detail="Invalid Username or Password")

        user_id, user_name, role_id, stored_hash = user

        cursor.execute('''
            SELECT name FROM roles WHERE role_id = %s
        ''', (role_id,))

        role_name = cursor.fetchone()[0]

        # -------------------------
        # 3. Verify Password
        # -------------------------
        if not pwd_context.verify(data.password, stored_hash):
            raise HTTPException(status_code=401, detail="Invalid Username or Password")

        # ==================================================== 
        #  Create session 
        #  ==================================================== 
        session_id = create_session( 
            user_id =   user_id, 
            user_name   =   user_name, 
            role_name =   role_name 
        )

        # ==================================================== 
        #  Send session ID as cookie 
        #  ==================================================== 
        response.set_cookie( 
            key="rasu_session_id", 
            value=session_id, 
            httponly=True, 
            secure=False, 
            samesite="lax", 
            max_age=60 * 30 
        )

        return{
            "message":"Login Successfully"
        }


    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Internal Server Error"
        )
        
    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()

# --------------------------------
# Role Based Authentication
# --------------------------------
@router.get("/auth/me")
def get_me(user: dict = Depends(get_current_user)):

    return user

# -------------------------------------------------
# Logout Api to delete session on server-side
# -------------------------------------------------
@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key="rasu_session_id",
        httponly=True,
        samesite="lax"
    )

    return {"message": "Logged out successfully"}