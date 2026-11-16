from fastapi import APIRouter, HTTPException
from database import get_connection

router = APIRouter()

# Stock Ledger Page Read API
@router.get("/sl_read", status_code=200)
def sl_read():

    conn = None
    cursor = None

    try:

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT sl_id, product_id, batch_no, movement_type, movement_id,
                before_qty, movement_qty, after_qty, created_datetime
            FROM stock_ledger
        """)

        row = cursor.fetchall()

        if not row:
            return []

        return [
            {
                "sl_id": r[0],
                "product_id": r[1],
                "batch_no": r[2],
                "movement_type": r[3],
                "movement_id": r[4],
                "before_qty": r[5],
                "movement_qty": r[6],
                "after_qty": r[7],
                "created_datetime": r[8]
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