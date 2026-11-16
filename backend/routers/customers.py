from fastapi import APIRouter, HTTPException
from database import get_connection
from schemas import CustomerRequest

router = APIRouter()

# Customer Create API
@router.post("/customer-create", status_code = 201)
def customer_create(data : CustomerRequest):

    conn = None
    cursor = None

    try:

        conn =  get_connection()
        cursor = conn.cursor()

        # Generate User_id 
        prefix = "CUS_"

        cursor.execute("""
            SELECT customer_id
            FROM customers
            WHERE customer_id LIKE %s
            ORDER BY customer_id DESC
            LIMIT 1
        """, (f"{prefix}%",))

        last_customer = cursor.fetchone()

        if last_customer:
            last_id = last_customer[0]
            number = int(last_id.split("_")[1])
            next_number = number + 1
        else:
            next_number = 1

        customer_id = f"{prefix}{next_number:03d}"

        # Data Inset Into Tables
        cursor.execute('''
            INSERT INTO customers(
                customer_id, name, company_id, email, phone, is_active
            )
            VALUES(%s, %s, %s, %s, %s, %s)
        ''', (
            customer_id, data.name,data.company_id, data.email,data.phone, data.is_active
            )
        )

        conn.commit()

        return{
            "Message": "Customer Created Successfully",
            "Customer_name": data.name
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


# Customer Page Read API
@router.get("/customer_read", status_code=200)
def Customer_read():

    conn = None
    cursor = None

    try:

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT customer_id, name, company_id, email, phone, is_active,
                created_at, updated_at
            FROM customers
        """)

        row = cursor.fetchall()

        if not row:
            return []

        return [
            {
                "customer_id": r[0],
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

# Customer Page Edit API
@router.put("/customer-update/{customer_id}", status_code = 200 )
def customer_edit(customer_id: str, data:CustomerRequest):
     
    conn = None
    cursor = None

    try:
        
        conn =get_connection()
        cursor =conn.cursor()

        print(customer_id)

         # update the Customer
        cursor.execute("""
            UPDATE customers
            SET name=%s,
                company_id=%s,
                email=%s,
                phone=%s,
                is_active=%s,
                updated_at=CURRENT_TIMESTAMP
            WHERE customer_id=%s
            """, (
                data.name, data.company_id, data.email, data.phone,
                data.is_active, customer_id
            ))

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="Customer not found"
            )

        conn.commit()

        return{
            "Message": "Customer Updated Successfully",
            "Customer_name": data.name
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

# Customer Delete API
@router.delete("/customer-delete/{customer_id}", status_code = 200)
def customer_delete(customer_id : str):

    conn = None
    cursor = None

    try:

        conn = get_connection()
        cursor = conn.cursor()
        print("Cstomer Id")

        cursor.execute(
            "DELETE FROM customers WHERE customer_id = %s",
            (customer_id,)
        )

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="Customer not found"
            )

        conn.commit()

        return{
            "Message": "Customer Deleted Successfully",
            "user_name": customer_id
        }

    except HTTPException:
        raise

    except Exception as e:
        print("Error:", e)
        raise HTTPException(
            status_code=500,
            detail="Failed to delete customer"
        )

    finally:
        
        if cursor:
            cursor.close()

        if conn:
            conn.close()