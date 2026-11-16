from database import get_connection


def create_tables():

    conn = None
    cursor = None

    try:

        # All Table Creation
        conn = get_connection()
        cursor = conn.cursor()

        print("Creating database tables...")

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS roles(
                role_id VARCHAR(20) PRIMARY KEY NOT NULL,
                name VARCHAR(50) NOT NULL,
                created_at TIMESTAMP NOT NULL,
                updated_at TIMESTAMP NOT NULL
            );
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users(
                user_id VARCHAR(50) PRIMARY KEY NOT NULL,
                user_name VARCHAR(50) UNIQUE NOT NULL,
                user_email VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                user_phone VARCHAR(20) UNIQUE NOT NULL,
                role_id VARCHAR(20) NOT NULL,
                is_active BOOLEAN NOT NULL,
                created_at TIMESTAMP NOT NULL,
                updated_at TIMESTAMP NOT NULL
            );
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS company (
                company_id VARCHAR(50) PRIMARY KEY NOT NULL,
                company_name VARCHAR(50) UNIQUE NOT NULL,
                gst VARCHAR(15) UNIQUE NOT NULL,
                pan VARCHAR(10) UNIQUE NOT NULL,
                company_phone VARCHAR(10) UNIQUE NOT NULL,
                company_email VARCHAR(100) UNIQUE NOT NULL,
                address VARCHAR(150) NOT NULL,
                country VARCHAR(50) NOT NULL,
                state VARCHAR(50) NOT NULL,
                city VARCHAR(50) NOT NULL,
                pincode VARCHAR(6) NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS customers (
                customer_id VARCHAR(50) PRIMARY KEY NOT NULL,
                name VARCHAR(50) NOT NULL,
                company_id VARCHAR(50) NOT NULL,
                email VARCHAR(100) NOT NULL,
                phone VARCHAR(10) NOT NULL,
                is_active Boolean NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS suppliers (
                supplier_id VARCHAR(50) PRIMARY KEY NOT NULL,
                name VARCHAR(50) NOT NULL,
                company_id VARCHAR(50) NOT NULL,
                email VARCHAR(100) NOT NULL,
                phone VARCHAR(10) NOT NULL,
                is_active Boolean NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS products (
                product_id VARCHAR(50) PRIMARY KEY NOT NULL,
                name VARCHAR(100) NOT NULL,
                unit_measure VARCHAR(20) NOT NULL,
                selling_price DECIMAL(10,2) NOT NULL,
                minimum_stock INT NOT NULL DEFAULT 1,
                product_type VARCHAR(50) NOT NULL,
                is_expiry_tracked BOOLEAN NOT NULL,
                is_active BOOLEAN NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS purchase_order (
                po_id           VARCHAR(50) PRIMARY KEY NOT NULL,
                supplier_id     VARCHAR(50) NOT NULL,
                product_id      VARCHAR(50) NOT NULL,
                qty             INT NOT NULL,
                unit_price      DECIMAL(10,2),
                total_amount    DECIMAL(10,2),
                status          VARCHAR(100) NOT NULL,
                order_date      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                    
                CONSTRAINT fk_purchase_order_supplier
                    FOREIGN KEY (supplier_id)
                    REFERENCES suppliers(supplier_id),

                CONSTRAINT fk_purchase_order_product
                    FOREIGN KEY (product_id)
                    REFERENCES products(product_id)
            );
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS grn (
                grn_id           VARCHAR(50) PRIMARY KEY NOT NULL,
                po_id            VARCHAR(50) NOT NULL,
                received_qty     INT NOT NULL,
                total_amount     DECIMAL(10,2),
                batch_no         VARCHAR(20) NOT NULL,
                expiry_at        TIMESTAMP,
                delivered_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                CONSTRAINT fk_purchase_order_id
                    FOREIGN KEY (po_id)
                    REFERENCES purchase_order(po_id)
            );
        ''')

        # Stock Balances Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS stock_balances (
                sb_id           VARCHAR(50) PRIMARY KEY NOT NULL,
                product_id      VARCHAR(100) NOT NULL,
                batch_no        VARCHAR(100),
                expiry_date     DATE,
                on_hand_qty     DECIMAL(12,3),
                reserved_qty    DECIMAL(12,3),
                created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Stock Ledger Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS stock_ledger (
            sl_id              VARCHAR(50) PRIMARY KEY,
            product_id         VARCHAR(50) NOT NULL,
            batch_no           VARCHAR(50),
            movement_type      VARCHAR(50),
            movement_id        VARCHAR(50),
            reference_type     VARCHAR(50) NOT NULL,
            before_qty         DECIMAL(10,2) DEFAULT 0,
            movement_qty       DECIMAL(10,2) DEFAULT 0,
            after_qty          DECIMAL(10,2) DEFAULT 0,
            created_datetime   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # Sales Order Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sales_order (
            so_id           VARCHAR(50) PRIMARY KEY,
            customer_id     VARCHAR(50) NOT NULL,
            product_id      VARCHAR(50) NOT NULL,
            order_qty       DECIMAL(10,2) NOT NULL,
            total_reserved_qty    DECIMAL(10,2) NOT NULL,
            status          VARCHAR(100) NOT NULL,
            created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        """)

        # Sales Order Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sales_order_lines (
            so_lines_id     SERIAL PRIMARY KEY,
            so_id           VARCHAR(50) NOT NULL,
            batch_no        VARCHAR(100),
            reserved_qty    DECIMAL(10,2) NOT NULL,
            created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        """)

        conn.commit()

        print("Database Tables Created succesfully...")

    except Exception as e:
        raise(f"Error Creating tables ; {e}")
        print(f"Error Creating tables ; {e}")

    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()