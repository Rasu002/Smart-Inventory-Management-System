from fastapi import APIRouter, HTTPException
from database import get_connection
from schemas import grnRequest
from dependencies import insert_ledger

router = APIRouter()


#  Purchase Order ID -->  Dropdown for grn table
@router.get("/po-dropdown")
def po_dropdown():

    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()


        cursor.execute("""
            SELECT po_id
            FROM purchase_order
            WHERE status = "PO_CREATED"
            ORDER BY po_id
        """)

        rows = cursor.fetchall()

        cursor.close()
        conn.close()

        return [
            {
                "po_id": r[0]
            }
            for r in rows
        ]

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/grn-create", status_code = 201)
def grn_create(data:grnRequest):

    conn = None
    cursor = None

    try:

        conn = get_connection()
        cursor = conn.cursor()


        # Generate User_id 
        prefix = "GRN_"

        cursor.execute("""
            SELECT grn_id
            FROM grn
            WHERE grn_id LIKE %s
            ORDER BY grn_id DESC
            LIMIT 1
        """, (f"{prefix}%",))

        last_grn = cursor.fetchone()

        if last_grn:
            last_id = last_grn[0]
            number = int(last_id.split("_")[1])
            next_number = number + 1
        else:
            next_number = 1

        grn_id = f"{prefix}{next_number:03d}"

        # Generate Batch
        batch_prefix = "BATCH_"

        cursor.execute("""
            SELECT batch_no FROM grn 
            WHERE batch_no LIKE %s
            ORDER BY batch_no DESC LIMIT 1
        """, (f"{batch_prefix}%",))

        last_batch = cursor.fetchone()

        if last_batch:
            lst_id = last_batch[0]
            num = int(lst_id.split("_")[1])
            nxt_number = num + 1
        else:
            nxt_number = 1

        batch_no = f"{batch_prefix}{nxt_number:03d}"

        cursor.execute('''
            INSERT INTO grn(
                grn_id, po_id, received_qty, total_amount,
                batch_no, expiry_at
            )
            VALUES(%s, %s, %s, %s, %s, %s)
        ''', (
            grn_id, data.po_id, data.received_qty, data.total_amount,
            batch_no, data.expiry_at
        ) )

        unit_price = data.total_amount / data.received_qty

        # Purchase Order Table Status Update
        cursor.execute('''
            UPDATE purchase_order 
            SET unit_price = %s, 
                total_amount= %s , 
                status = "Received"
            WHERE po_id = %s
        ''', (unit_price, data.total_amount, data.po_id,))

        # Generate Stock Balance Id
        sb_prefix = "SB_"

        cursor.execute("""
            SELECT sb_id FROM stock_balances 
            WHERE sb_id LIKE %s
            ORDER BY sb_id DESC LIMIT 1
        """, (f"{sb_prefix}%",))

        last_sb = cursor.fetchone()

        if last_sb:
            lst_id = last_sb[0]
            num = int(lst_id.split("_")[1])
            nxt_number = num + 1
        else:
            nxt_number = 1

        sb_no = f"{sb_prefix}{nxt_number:03d}"

        cursor.execute('''
            SELECT product_id 
            FROM purchase_order
            WHERE po_id = %s
        ''',(data.po_id,))

        product_id = cursor.fetchone()[0]


        cursor.execute('''
            INSERT INTO stock_balances(
                sb_id, product_id, batch_no, expiry_date, on_hand_qty,
                reserved_qty
            )
            VALUES(%s, %s, %s, %s, %s, 0)
        ''', (
            sb_no, product_id, batch_no, data.expiry_at, data.received_qty
        ) )

        # Ledger entry
        insert_ledger(
            cursor,
            product_id,
            batch_no,
            "GRN",
            grn_id,
            "Income",
            0,
            int(data.received_qty),
        )

        conn.commit()
        
        return{
            "Message": "GRN Created Successfully",
            "GRN ID": grn_id
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


# GRN Page Read API
@router.get("/grn_read", status_code=200)
def grn_read():

    conn = None
    cursor = None

    try:

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT grn_id, po_id, received_qty, total_amount, batch_no,
                expiry_at, delivered_at
            FROM grn
        """)

        row = cursor.fetchall()

        if not row:
            return []

        return [
            {
                "grn_id": r[0],
                "po_id": r[1],
                "received_qty": r[2],
                "total_amount": r[3],
                "batch_no": r[4],
                "expiry_at": r[5],
                "delivered_at": r[6]
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


# Check if Product has Expiry Tracking
@router.get("/check-expiry/{po_id}")
def check_expiry(po_id: str):

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT p.is_expiry_tracked
            FROM purchase_order l
            JOIN products p ON p.product_id = l.product_id
            WHERE l.po_id = %s
        """, (po_id,))

        result = cursor.fetchone()

        # Check whether the PO exists
        if result is None:
            raise HTTPException(
                status_code=404,
                detail="No product found for this PO"
            )

        expiry = result[0]

        

        return {
            "po_id": po_id,
            "is_expiry_tracked": bool(expiry)
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Internal Server Error"
        )

    finally:
        cursor.close()
        conn.close()
