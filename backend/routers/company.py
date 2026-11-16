from fastapi import APIRouter, HTTPException
from database import get_connection
from schemas import CompanyRequest

router = APIRouter()

# company Create API

@router.post("/company-create", status_code = 201)
def Company_create(data : CompanyRequest):

    conn = None
    cursor = None

    try:
        
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT COUNT(*)
            FROM company
        """)

        company_count = cursor.fetchone()[0]

        if company_count >= 1:

            raise HTTPException(
                status_code=409,
                detail="Company already exists. Only one company is allowed."
            )


        # Generate User_id 
        prefix = "COMP_"

        cursor.execute("""
            SELECT company_id
            FROM company
            WHERE company_id LIKE %s
            ORDER BY company_id DESC
            LIMIT 1
        """, (f"{prefix}%",))

        last_company = cursor.fetchone()

        if last_company:
            last_id = last_company[0]
            number = int(last_id.split("_")[1])
            next_number = number + 1
        else:
            next_number = 1

        company_id = f"{prefix}{next_number:03d}"

        # Data Inset Into Tables
        cursor.execute('''
            INSERT INTO company(
                company_id, company_name, gst, pan, company_phone, company_email, address,
                country, state, city, pincode
            )
            VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ''', (
            company_id, data.company_name,data.gst, data.pan,data.phone, 
            data.email,data.address, data.country, data.state, data.city, data.pincode
            )
        )

        conn.commit()
        
        return{
            "Message": "Company Created Successfully",
            "user_name": data.company_name
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


# Company Page Read API
@router.get("/company_read", status_code=200)
def Company_read():

    conn = None
    cursor = None

    try:

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT company_id, company_name, gst, pan, company_phone, company_email,
                address, country, state, city, pincode
            FROM company
            LIMIT 1
        """)

        row = cursor.fetchone()

        if not row:
            return None

        return {
            "company_id": row[0],
            "company_name": row[1],
            "gst": row[2],
            "pan": row[3],
            "phone": row[4],
            "email": row[5],
            "address": row[6],
            "country": row[7],
            "state": row[8],
            "city": row[9],
            "pincode": row[10]
        }

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

# Company Page Edit API
@router.put("/company-update/{company_id}", status_code = 200 )
def Company_edit(company_id: str,data:CompanyRequest):
     
    conn = None
    cursor = None

    try:
        
        conn =get_connection()
        cursor =conn.cursor()

         # update the company
        cursor.execute("""
            UPDATE company
            SET company_name=%s,
                gst=%s,
                pan=%s,
                company_phone=%s,
                company_email=%s,
                address=%s,
                country=%s,
                state=%s,
                city=%s,
                pincode=%s,
                updated_at=CURRENT_TIMESTAMP
            WHERE company_id=%s
            """, (
                data.company_name, data.gst, data.pan, data.phone, data.email, data.address,
                data.country, data.state, data.city, data.pincode, company_id
            ))

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="Company not found"
            )

        conn.commit()

        return{
            "Message": "Company Updated Successfully",
            "user_name": data.company_name
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


# Company Page Edit API
@router.delete("/company-delete/{company_id}", status_code=204)
def Company_delete(company_id: str):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "DELETE FROM company WHERE company_id = %s",
            (company_id,)
        )

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="Company not found"
            )

        conn.commit()

        return{
            "Message": "Company Deleted Successfully",
            "user_name": company_id
        }

    except HTTPException:
        raise

    except Exception as e:
        print("Error:", e)
        raise HTTPException(
            status_code=500,
            detail="Failed to delete company"
        )

    finally:
        
        if cursor:
            cursor.close()

        if conn:
            conn.close()