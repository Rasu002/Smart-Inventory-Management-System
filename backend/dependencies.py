from fastapi import Request, HTTPException
from datetime import datetime
from session_manager import sessions

# ============================================================
# Get Current Logged-in User
# ============================================================
def get_current_user(request: Request):

    try:

        # ---------------------------------------
        # 1. Get session ID from cookie
        # ---------------------------------------

        session_id = request.cookies.get("rasu_session_id")

        if not session_id:
            raise HTTPException(
                status_code=401,
                detail="Not authenticated"
            )

        # ---------------------------------------
        # 2. Find session
        # ---------------------------------------

        session = sessions.get(session_id)

        if not session:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired session"
            )

        # ----------------------------------------
        # Getting User Role
        # ----------------------------------------
        user_name = session["user_name"]
        user_role = session["role_name"]


        # ---------------------------------------
        # 3. Check session expiry
        # ---------------------------------------

        if datetime.utcnow() >= session["expires_at"]:

            # Delete expired session
            del sessions[session_id]

            raise HTTPException(
                status_code=401,
                detail="Session expired. Please login again."
            )

        # ---------------------------------------
        # 4. Return logged-in user
        # ---------------------------------------

        return {
            "user_name": user_name,
            "user_role": user_role,
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Internal Server Error"
        )



# ============================================================
# STOCK LEDGER INSERT FUNCTION
# ============================================================
def insert_ledger(
    cursor,
    product_id,
    batch_no,
    movement_type,
    movement_id,
    reference_type,
    before_qty,
    movement_qty,
):

    prefix = "SL_"

    cursor.execute("""
        SELECT sl_id
        FROM stock_ledger
        WHERE sl_id LIKE %s
        ORDER BY sl_id DESC
        LIMIT 1
    """, (f"{prefix}%",))

    last = cursor.fetchone()

    if last:
        last_id   = last[0]
        number = int(last_id.split("_")[1])
        next_number = number + 1
    else:
        next_number = 1

    sl_id = f"{prefix}{next_number:03d}"

    after_qty = 0


    if movement_type == "GRN":
        after_qty = before_qty + movement_qty

    if movement_type == "Sales Order":
        after_qty = before_qty - movement_qty

    cursor.execute("""
        INSERT INTO stock_ledger
        (
            sl_id, product_id, batch_no, movement_type, movement_id, reference_type,
            before_qty, movement_qty, after_qty, created_datetime
        )
        VALUES
        (
         %s, %s, %s, %s, %s, %s, %s,%s, %s, NOW()
        )
    """, (
        sl_id,
        product_id,
        batch_no,
        movement_type,
        movement_id,
        reference_type,
        before_qty,
        movement_qty,
        after_qty,
    ))



def reserved_qty(cursor, ordered_qty, so_id, product_id):

    remaining_qty = float(ordered_qty)
    required_qty = 0
    batch_list = []
    # 1. Fetch available stock in FEFO order
    cursor.execute("""
        SELECT sb_id, batch_no, on_hand_qty,
               COALESCE(reserved_qty, 0)
        FROM stock_balances
        WHERE product_id = %s
          AND (
              expiry_date IS NULL
              OR expiry_date >= CURRENT_DATE
          )
          AND (
              on_hand_qty - COALESCE(reserved_qty, 0)
          ) > 0
        ORDER BY
            expiry_date IS NULL ASC,
            expiry_date ASC,
            created_at ASC,
            sb_id ASC
        FOR UPDATE
    """, (product_id,))

    rows = cursor.fetchall()

    # 2. Reserve available stock batch by batch
    for row in rows:

        stock_id, batch_no, on_hand, reserved = row

        available = float(on_hand) - float(reserved)

        if available <= 0:
            continue

        current_qty = min(remaining_qty, available)

        if current_qty <= 0:
            break

        before_qty = available

        # Update stock balance
        cursor.execute("""
            UPDATE stock_balances
            SET reserved_qty = COALESCE(reserved_qty, 0) + %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE sb_id = %s
        """, (current_qty, stock_id))

        # Insert sales order line
        cursor.execute("""
            INSERT INTO sales_order_lines (
                so_id,
                batch_no,
                reserved_qty
            )
            VALUES (%s, %s, %s)
        """, (so_id, batch_no, current_qty))

        batch_list.append({
            "batch_no": batch_no,
            "reserved_qty": current_qty,
            "before_qty": before_qty
        })

        required_qty += current_qty
        remaining_qty -= current_qty

        if remaining_qty <= 0:
            break

    # 3. Determine final reservation status
    if required_qty == 0:
        status = "OPEN"
        reference_type = None

    elif remaining_qty > 0:
        status = "PARTIALLY_RESERVED"
        reference_type = "PARTIALLY RESERVED"

    else:
        status = "RESERVED"
        reference_type = "RESERVE"


    # 4. Insert stock ledger entries only for reserved batches
    for b in batch_list:

        insert_ledger(
            cursor,
            product_id,
            b["batch_no"],
            "Sales Order",
            so_id,
            reference_type,
            b["before_qty"],
            b["reserved_qty"]
        )

    return required_qty, status

