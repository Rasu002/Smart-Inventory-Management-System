from fastapi import APIRouter, HTTPException
from database import get_connection
from schemas import salesRequest
from dependencies import reserved_qty

router = APIRouter()

#  Suppliers ID -->  Dropdown for Purchase order table
@router.get("/customers-dropdown")
def customers_dropdown():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT customer_id
            FROM customers
            WHERE is_active = TRUE
            ORDER BY customer_id
        """)

        rows = cursor.fetchall()

        cursor.close()
        conn.close()

        return [
            {
                "customer_id": r[0]
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

# Create Sales Order
@router.post("/sales-create", status_code=201)
def create_sales(data: salesRequest):

    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Generate Sales Order ID
        prefix = "SO_"

        cursor.execute("""
            SELECT so_id
            FROM sales_order
            WHERE so_id LIKE %s
            ORDER BY so_id DESC
            LIMIT 1
        """, (f"{prefix}%",))

        last_so = cursor.fetchone()

        if last_so:
            number = int(last_so[0].split("_")[1])
            next_number = number + 1
        else:
            next_number = 1

        so_id = f"{prefix}{next_number:03d}"

        # Reserve stock for the requested product
        required_qty, status = reserved_qty(
            cursor,
            data.ordered_qty,
            so_id,
            data.po_id
        )

        # Create Sales Order
        cursor.execute("""
            INSERT INTO sales_order (
                so_id,
                customer_id,
                product_id,
                order_qty,
                total_reserved_qty,
                status
            )
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            so_id,
            data.customer_id,
            data.po_id,
            data.ordered_qty,
            required_qty,
            status
        ))

        # Commit everything together
        conn.commit()

        return {
            "message": "Sales Order Created Successfully",
            "so_id": so_id,
            "product_id": data.po_id,
            "ordered_qty": data.ordered_qty,
            "reserved_qty": required_qty,
            "status": status
        }

    except HTTPException:
        if conn:
            conn.rollback()
        raise

    except Exception as e:
        if conn:
            conn.rollback()

        print(f"Sales Order Error: {e}")

        raise HTTPException(
            status_code=500,
            detail="Internal Server Error"
        )

    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()


# Sales Order Page Read API
@router.get("/sales_read", status_code=200)
def sales_read():

    conn = None
    cursor = None

    try:

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT so_id, customer_id, product_id, order_qty, status,
                created_at, updated_at
            FROM sales_order
        """)

        row = cursor.fetchall()

        if not row:
            return []

        return [
            {
                "so_id": r[0],
                "customer_id": r[1],
                "product_id": r[2],
                "order_qty": r[3],
                "status": r[4],
                "created_at": r[5],
                "updated_at": r[6]
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


# Sales Order Cancle API
@router.put("/sales-order-cancel/{so_id}")
def cancel_sales_order(so_id: str):

    conn = get_connection()
    cursor = conn.cursor()

    try:

        # ✅ Lock PO row
        cursor.execute("""
            SELECT status
            FROM sales_order
            WHERE so_id = %s
        """, (so_id,))

        po = cursor.fetchone()

        if not po:
            raise HTTPException(status_code=404, detail="PO not found")

        # ✅ Already cancelled
        if po[0] == "Cancelled":
            raise HTTPException(
                status_code=400,
                detail="Sales Order already cancelled"
            )
        
        if po[0] == "Delivered":
            raise HTTPException(
                status_code=400,
                detail="Sales Order already Delivered"
            )

        # ✅ Cancel PO
        cursor.execute("""
            UPDATE sales_order
            SET status = 'Cancelled'
            WHERE so_id = %s
        """, (so_id,))

        conn.commit()

        return {
            "message": "Sales Order Cancelled"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()