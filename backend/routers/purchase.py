from fastapi import APIRouter, HTTPException
from database import get_connection
from schemas import PoRequest

router = APIRouter()

#  Suppliers ID -->  Dropdown for Purchase order table
@router.get("/suppliers-dropdown")
def suppliers_dropdown():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT supplier_id
            FROM suppliers
            WHERE is_active = TRUE
            ORDER BY supplier_id
        """)

        rows = cursor.fetchall()

        cursor.close()
        conn.close()

        return [
            {
                "supplier_id": r[0]
            }
            for r in rows
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    
#  Products ID -->  Dropdown for Purchase order table
@router.get("/products-dropdown")
def products_dropdown():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT product_id
            FROM products
            WHERE is_active = TRUE
            ORDER BY product_id
        """)

        rows = cursor.fetchall()

        cursor.close()
        conn.close()

        return [
            {
                "Product_id": r[0]
            }
            for r in rows
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Purchase Order Create 
@router.post("/purchase-create")
def create_purchase(data:PoRequest):

    conn = None
    cursor = None

    try:

        conn = get_connection()
        cursor = conn.cursor()

        # Generate User_id 
        prefix = "PO_"

        cursor.execute("""
            SELECT po_id
            FROM purchase_order
            WHERE po_id LIKE %s
            ORDER BY po_id DESC
            LIMIT 1
        """, (f"{prefix}%",))

        last_po = cursor.fetchone()

        if last_po:
            last_id = last_po[0]
            number = int(last_id.split("_")[1])
            next_number = number + 1
        else:
            next_number = 1

        po_id = f"{prefix}{next_number:03d}"

        status = "PO_CREATED"

        cursor.execute("""
            INSERT INTO purchase_order(
                po_id, supplier_id, product_id, qty, status
            )
            VALUES(%s, %s, %s, %s, %s)
        """,(
            po_id, data.supplier_id, data.product_id, data.qty, status
        ))

        conn.commit()

        return{
            "Message": "Purchase Order Created Successfully",
            "Po_id": po_id
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


# Purchase Order Page Read API
@router.get("/purchase_read", status_code=200)
def purchase_read():

    conn = None
    cursor = None

    try:

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT po_id, supplier_id, product_id, qty, unit_price,
                total_amount, status, order_date, updated_at
            FROM purchase_order
        """)

        row = cursor.fetchall()

        if not row:
            return []

        return [
            {
                "po_id": r[0],
                "supplier_id": r[1],
                "product_id": r[2],
                "qty": r[3],
                "unit_price": r[4],
                "total_amount": r[5],
                "status": r[6],
                "order_date": r[7],
                "updated_at": r[8]
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

# Purchase Order Cancle API
@router.put("/purchase-order-cancel/{po_id}")
def cancel_purchase_order(po_id: str):

    conn = get_connection()
    cursor = conn.cursor()

    try:

        # ✅ Lock PO row
        cursor.execute("""
            SELECT status
            FROM purchase_order
            WHERE po_id = %s
        """, (po_id,))

        po = cursor.fetchone()

        if not po:
            raise HTTPException(status_code=404, detail="PO not found")

        # ✅ Already cancelled
        if po[0] == "Cancelled":
            raise HTTPException(
                status_code=400,
                detail="Purchase Order already cancelled"
            )
        
        if po[0] == "Received":
            raise HTTPException(
                status_code=400,
                detail="Purchase Order already Received"
            )

        # ✅ Cancel PO
        cursor.execute("""
            UPDATE purchase_order
            SET status = 'Cancelled'
            WHERE po_id = %s
        """, (po_id,))

        conn.commit()

        return {
            "message": "Purchase Order Cancelled"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()