from fastapi import APIRouter, HTTPException
from database import get_connection

router = APIRouter()

# Stock Balance Page Read API
@router.get("/sb_read", status_code=200)
def sb_read():

    conn = None
    cursor = None

    try:

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT sb_id, product_id, batch_no, expiry_date, on_hand_qty,
                reserved_qty, created_at, updated_at
            FROM stock_balances
        """)

        row = cursor.fetchall()

        if not row:
            return []

        return [
            {
                "sb_id": r[0],
                "product_id": r[1],
                "batch_no": r[2],
                "expiry_date": r[3],
                "on_hand_qty": r[4],
                "reserved_qty": r[5],
                "created_at": r[6],
                "updated_at": r[7],
            }
            for r in row
        ]

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail="Internal Server Error"
        )

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()