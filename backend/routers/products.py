from fastapi import APIRouter, HTTPException
from database import get_connection
from schemas import ProductRequest

router = APIRouter()

@router.post("/product-create", status_code = 201)
def product_create(data:ProductRequest):

    conn = None
    cursor = None

    try:

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT 1 FROM products 
            WHERE product_id = %s
        ''',(data.product_id,))

        duplicate_id = cursor.fetchone()

        if duplicate_id:
            raise HTTPException(status_code = 409, detail= "Product Id Already exists")

        cursor.execute('''
            INSERT INTO products(
                product_id, name, unit_measure, selling_price, minimum_stock,
                product_type, is_expiry_tracked, is_active
            )
            VALUES(%s, %s, %s, %s, %s, %s, %s, %s)
        ''', (
            data.product_id, data.name, data.unit_measure, data.selling_price, data.minimum_stock,
            data.product_type, data.is_expiry_tracked, data.is_active
        ) )

        conn.commit()
        
        return{
            "Message": "Product Created Successfully",
            "Product_name": data.name
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


# Products Page Read API
@router.get("/product_read", status_code=200)
def product_read():

    conn = None
    cursor = None

    try:

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT product_id, name, unit_measure, selling_price, minimum_stock,
                product_type, is_expiry_tracked, is_active, created_at, updated_at
            FROM products
        """)

        row = cursor.fetchall()

        if not row:
            return []

        return [
            {
                "product_id": r[0],
                "name": r[1],
                "unit_measure": r[2],
                "selling_price": r[3],
                "minimum_stock": r[4],
                "product_type": r[5],
                "is_expiry_tracked": r[6],
                "is_active": r[7],
                "created_at": r[8],
                "updated_at": r[9]
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


# Product Page Edit API
@router.put("/product-update/{product_id}", status_code = 200 )
def customer_edit(product_id: str, data:ProductRequest):
     
    conn = None
    cursor = None

    try:
        
        conn =get_connection()
        cursor =conn.cursor()

        print(data.selling_price)

         # update the product
        cursor.execute("""
            UPDATE products
            SET name=%s,
                unit_measure=%s,
                selling_price=%s,
                minimum_stock=%s,
                product_type=%s,
                is_expiry_tracked=%s,
                is_active=%s,
                updated_at=CURRENT_TIMESTAMP
            WHERE product_id=%s
            """, (
                data.name, data.unit_measure, data.selling_price, data.minimum_stock, 
                data.product_type, data.is_expiry_tracked,  data.is_active, product_id
            ))

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="Product not found"
            )

        conn.commit()

        return{
            "Message": "Product Updated Successfully",
            "Product_name": data.name
        }

    except HTTPException:
            raise

    except Exception as e:
     
        print(f"error {e}")

        raise HTTPException(
            status_code=500,
            detail="Internal Server Error"
        )

    finally:
    
        if cursor:
            cursor.close()

        if conn:
            conn.close()


# Product Delete API
@router.delete("/product-delete/{product_id}", status_code = 200)
def product_delete(product_id : str):

    conn = None
    cursor = None

    try:

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "DELETE FROM products WHERE product_id = %s",
            (product_id,)
        )

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="Product not found"
            )

        conn.commit()

        return{
            "message": "Product Deleted Successfully",
            "Product_name": product_id
        }

    except HTTPException:
        raise

    except Exception as e:
        print("Error:", e)
        raise HTTPException(
            status_code=500,
            detail="Failed to delete Product"
        )

    finally:
        
        if cursor:
            cursor.close()

        if conn:
            conn.close()