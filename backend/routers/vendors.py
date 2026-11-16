from fastapi import APIRouter, HTTPException
from database import get_connection
from schemas import SupplierRequest

router = APIRouter()

# supplier Create API
@router.post("/supplier-create", status_code = 201)
def supplier_create(data : SupplierRequest):

    conn = None
    cursor = None

    try:

        conn =  get_connection()
        cursor = conn.cursor()

        # Generate User_id 
        prefix = "SUP_"

        cursor.execute("""
            SELECT supplier_id
            FROM suppliers
            WHERE supplier_id LIKE %s
            ORDER BY supplier_id DESC
            LIMIT 1
        """, (f"{prefix}%",))

        last_supplier = cursor.fetchone()

        if last_supplier:
            last_id = last_supplier[0]
            number = int(last_id.split("_")[1])
            next_number = number + 1
        else:
            next_number = 1

        supplier_id = f"{prefix}{next_number:03d}"

        # Data Inset Into Tables
        cursor.execute('''
            INSERT INTO suppliers(
                supplier_id, name, company_id, email, phone, is_active
            )
            VALUES(%s, %s, %s, %s, %s, %s)
        ''', (
            supplier_id, data.name,data.company_id, data.email,data.phone, data.is_active
            )
        )

        conn.commit()

        return{
            "Message": "Supplier Created Successfully",
            "Supplier_name": data.name
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


# suppliers Page Read API
@router.get("/supplier_read", status_code=200)
def Supplier_read():

    conn = None
    cursor = None

    try:

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT supplier_id, name, company_id, email, phone, is_active,
                created_at, updated_at
            FROM suppliers
        """)

        row = cursor.fetchall()

        if not row:
            return []

        return [
            {
                "supplier_id": r[0],
                "name": r[1],
                "company_id": r[2],
                "email": r[3],
                "phone": r[4],
                "is_active": r[5],
                "created_at": r[6],
                "updated_at": r[7]
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


# supplier Page Edit API
@router.put("/supplier-update/{supplier_id}", status_code = 200 )
def supplier_edit(supplier_id: str, data:SupplierRequest):
     
    conn = None
    cursor = None

    try:
        
        conn =get_connection()
        cursor =conn.cursor()

         # update the company
        cursor.execute("""
            UPDATE suppliers
            SET name=%s,
                company_id=%s,
                email=%s,
                phone=%s,
                is_active=%s,
                updated_at=CURRENT_TIMESTAMP
            WHERE supplier_id=%s
            """, (
                data.name, data.company_id, data.email, data.phone,
                data.is_active, supplier_id
            ))

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="supplier not found"
            )

        conn.commit()

        return{
            "Message": "supplier Updated Successfully",
            "user_name": data.name
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


# suppliers Delete API
@router.delete("/suppliers-delete/{supplier_id}", status_code = 200)
def supplier_delete(supplier_id : str):

    conn = None
    cursor = None

    try:

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "DELETE FROM suppliers WHERE supplier_id = %s",
            (supplier_id,)
        )

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="supplier not found"
            )

        conn.commit()

        return{
            "Message": "supplier Deleted Successfully",
            "user_name": supplier_id
        }

    except HTTPException:
        raise

    except Exception as e:
        print("Error:", e)
        raise HTTPException(
            status_code=500,
            detail="Failed to delete Supplier"
        )

    finally:
        
        if cursor:
            cursor.close()

        if conn:
            conn.close()