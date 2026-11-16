import { useState, useEffect } from 'react';
import TopTabNav from '../../components/TopTabNav';

const tabs = [
    { label: 'Sales Order', path: '/sales/sales-order',  roles: ['ADMIN', 'PURCHASE MANAGER'] },
    
];


export default function SalesOrder() {

    const emptyForm = {
        customer_id: "",
        po_id: "",
        orderd_qty: "",
    };

    const [form, setForm] = useState(emptyForm);
    const [SO, setSO] = useState([]);
    const [ customers, setCustomers ] = useState([]);
    const [ products, setProducts ] = useState([]);


    useEffect(() => {
        loadSales();
        fetchCustomersDropdown();
        fetchProductsDropdown();
    }, []);

    const fetchCustomersDropdown = async () => {

        try {
            const res = await fetch("http://localhost:8000/customers-dropdown");
            if (res.ok) 
                setCustomers(await res.json());
            } 
        catch (e) {
            console.error(e);
        }
    };


    const fetchProductsDropdown = async () => {

        try {
            const res = await fetch("http://localhost:8000/products-dropdown");
            if (res.ok) 
                setProducts(await res.json());
            } 
        catch (e) {
            console.error(e);
        }
    };


    const loadSales = async () => {
        try {

            const res = await fetch(
                "http://127.0.0.1:8000/sales_read"
            );

            if (!res.ok) {
                throw new Error("Failed to load Sales Orders");
            }

            const data = await res.json();

            setSO(data);

        } catch (error) {

            console.error(error);

            alert("Failed to load Sales Orders");
        }
    };


    function handleChange(e) {

        const { name, value, type, checked } = e.target;

        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value
        });
    }


    const createSO = async () => {

        try {

            const res = await fetch(
                "http://127.0.0.1:8000/sales-create",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(form)
                }
            );

            if (!res.ok) {

                const errData = await res.json();

                throw new Error(
                    errData.detail || "Failed to create Sales order"
                );
            }

            alert("SO created successfully");

            setForm(emptyForm);

            await loadSales();

        } catch (error) {

            console.error(error);

            alert(error.message);
        }
    };


    const handleSubmit = (e) => {

        e.preventDefault();


        // Required fields
        if (
            !form.customer_id ||
            !form.product_id ||
            !form.orderd_qty
        ) {

            alert("Please fill all required fields");

            return;
        }

        createSO();

    };

    const handleClear = () => {

        setForm(emptyForm);

        setSelectedId(null);

        setIsEditing(false);
    };

    const formatDateTime = (dateTime) => {
        if (!dateTime) return "";

        const date = new Date(dateTime);

        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");

        const ampm = hours >= 12 ? "PM" : "AM";

        hours = hours % 12;
        hours = hours === 0 ? 12 : hours;

        hours = String(hours).padStart(2, "0");

        return `${day}-${month}-${year} ${hours}:${minutes}:${seconds} ${ampm}`;
    };


    const styles = {

        // =========================================
        // Form Container
        // =========================================

        form: {
            width: "100%",
            maxWidth: "none",
            boxSizing: "border-box",
            marginTop: "24px",
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.02)",
            overflow: "hidden",
        },


        // =========================================
        // Fields Area
        // =========================================

        grid: {
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            columnGap: "24px",
            rowGap: "20px",
            padding: "32px 36px",
            width: "100%",
            boxSizing: "border-box",
        },


        // =========================================
        // Form Group
        // =========================================

        formGroup: {
            display: "flex",
            flexDirection: "column",
            minWidth: "0",
        },


        // =========================================
        // Label
        // =========================================

        label: {
            marginBottom: "6px",
            fontSize: "18px",
            fontWeight: "600",
            letterSpacing: "0.02em",
            textTransform: "uppercase",
            color: "black",
            lineHeight: "16px",
        },


        // =========================================
        // Input
        // =========================================

        input: {
            width: "100%",
            height: "42px",
            padding: "0 14px",
            boxSizing: "border-box",
            backgroundColor: "#ffffff",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            color: "#111827",
            fontSize: "14px",
            outline: "none",
            transition: "border-color 0.15s ease, box-shadow 0.15s ease",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
        },


        // =========================================
        // Checkbox Section
        // =========================================

        checkboxRow: {
            gridColumn: "1 / -1",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginTop: "4px",
            padding: "14px 18px",
            backgroundColor: "#f9fafb",
            border: "1px solid #f3f4f6",
            borderRadius: "8px",
        },


        // =========================================
        // Checkbox
        // =========================================

        checkbox: {
            width: "18px",
            height: "18px",
            margin: "0",
            cursor: "pointer",
            accentColor: "#1e41de",
            borderRadius: "4px",
        },


        // =========================================
        // Checkbox Label
        // =========================================

        checkboxLabel: {
            fontSize: "15px",
            fontWeight: "500",
            color: "#374153",
            cursor: "pointer",
            userSelect: "none",
        },


        // =========================================
        // Button Section
        // =========================================

        buttonRow: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginTop: "0px",
            paddingTop: "0px",
            borderTop: "none",
            justifyContent: "flex-start",
            gridColumn: "1 / 2",
            flexWrap: "wrap",
        },

        // =========================================
        // Create / Update Button
        // =========================================

        createButton: {
            minWidth: "140px",
            height: "42px",
            padding: "0 22px",
            backgroundColor: "#1d4ed8",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
        },


        // =========================================
        // Clear Button
        // =========================================

        clearButton: {
            minWidth: "110px",
            height: "42px",
            padding: "0 14px",
            margin: "0",
            backgroundColor: "#e5e7eb",
            color: "#111827",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
        },

        tableContainer: { overflowX: "auto", marginTop: "40px" },
        table: { width: "100%", borderCollapse: "collapse" },
        th: { background: "#4f46e5", color: "white", padding: "10px" },
        td: { border: "1px solid #ddd", padding: "10px" },
        cancelBtn: {
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            padding: "6px 10px",
            borderRadius: "4px",
            cursor: "pointer",
        },
        cancelledBtn: {
            backgroundColor: "#9ca3af",
            color: "white",
            border: "none",
            padding: "6px 10px",
            borderRadius: "4px",
            cursor: "not-allowed",
            opacity: 0.7,
        },
    };

    return (
        <div>

            <TopTabNav tabs={tabs} />



            {/* Page Heading */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                }}
            >
                <h3 style={{ margin: 0, fontSize: "26px", }}>
                    Create Sales
                </h3>

            </div>


            {/* PO Form */}
            <form style={styles.form} onSubmit={handleSubmit}>

                <div style={styles.grid}>

                    {/* customers id */}
                    <div style={styles.formGroup}>

                        <label
                            style={styles.label}
                            htmlFor="customer_id"
                        >
                            Customers Id
                        </label>

                        <select style={styles.input} name="customer_id" value={form.customer_id} onChange={handleChange} required >
                            <option value="">Select Customers</option>
                            {customers.map((v) => (
                            <option key={v.customer_id} value={v.customer_id}>{v.customer_id}</option>
                            ))}
                        </select>

                    </div>

                    {/* Product ID */}
                    <div style={styles.formGroup}>

                        <label
                            style={styles.label}
                            htmlFor="product_id"
                        >
                            Product Id
                        </label>

                        <select style={styles.input} name="product_id" value={form.product_id} onChange={handleChange} required >
                            <option value="">Select Products</option>
                            {products.map((v) => (
                            <option key={v.products_id} value={v.products_id}>{v.Product_id}</option>
                            ))}
                        </select>

                    </div>

                    {/* qty */}
                    <div style={styles.formGroup}>

                        <label
                            style={styles.label}
                            htmlFor="qty"
                        >
                            Qty
                        </label>

                        <input
                            id="qty"
                            name="qty"
                            value={form.qty}
                            onChange={handleChange}
                            placeholder="Enter Qty"
                            style={styles.input}
                        />

                    </div>

                    {/* Buttons */}
                    <div style={styles.buttonRow}>

                        <button
                            type="submit"
                            style={styles.createButton}
                        >
                            Create So
                        </button>

                        <button
                            type="button"
                            style={styles.clearButton}
                            onClick={handleClear}
                        >
                            Clear Form
                        </button>

                    </div>


                </div>

            </form>

            <h3 style={{ marginTop: "40px" }}>Purchase List</h3>

            <div style={styles.tableContainer}>
                <table style={styles.table}>

                    <thead>
                        <tr>
                            <th style={styles.th}> So ID</th>
                            <th style={styles.th}>Customers Id</th>
                            <th style={styles.th}>Product Id</th>
                            <th style={styles.th}>Ordered qty</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Created At</th>
                            <th style={styles.th}>Updated At</th>
                            <th style={styles.th}>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {SO.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="9"
                                    style={{
                                        textAlign: "center",
                                        padding: "20px",
                                        color: "#6b7280",
                                        fontSize: "15px"
                                    }}
                                >
                                    No Sales Order data found
                                </td>
                            </tr>
                        ) : (

                            SO.map((c) => (
                                <tr key={c.po_id}>
                                    <td style={styles.td}>{c.so_id}</td>
                                    <td style={styles.td}>{c.customer_id}</td>
                                    <td style={styles.td}>{c.product_id}</td>
                                    <td style={styles.td}>{c.order_qty}</td>
                                    <td style={styles.td}>{c.status}</td>
                                    <td style={styles.td}>{formatDateTime(c.created_at)}</td>
                                    <td style={styles.td}>{formatDateTime(c.updated_at)}</td>
                                    <td style={styles.td}>
                                        
                                        {c.status === "Cancelled" && (
                                            <>
                                                <button
                                                    style={styles.cancelledBtn}
                                                    disabled={true}
                                                >
                                                    Cancelled
                                                </button>
                                            
                                            </>
                                        )}

                                        {c.status !== "DELIVERED" && (
                                            <>
                                                <button
                                                    style={styles.cancelBtn}
                                                >
                                                    Cancel
                                                </button>
                                            
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>

                </table>
            </div>

        </div>


    );

}

