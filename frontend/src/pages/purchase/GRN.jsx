import { useState, useEffect } from 'react';
import TopTabNav from '../../components/TopTabNav';

const tabs = [
    { label: 'PO List', path: '/purchase/POList',  roles: ['ADMIN', 'PURCHASE_MANAGER'] },
    { label: 'GRN', path: '/purchase/GRN',  roles: ['ADMIN', 'PURCHASE_MANAGER']},
];


export default function GRN() {

    const emptyForm = {
        po_id: "",
        received_qty: "",
        total_amount: "",
        expiry_at: "",
    };

    const [form, setForm] = useState(emptyForm);
    const [grn, setGrn] = useState([]);
    const [ po, setPo ] = useState([]);
    const [isExpiryTracked, setIsExpiryTracked] = useState(false);
    const [checkingExpiry, setCheckingExpiry] = useState(false);

    const today = new Date();
    const minExpiryDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    useEffect(() => {
        loadGrn();
        fetchPoDropdown();
    }, []);


    const fetchPoDropdown = async () => {

        try {
            const res = await fetch("http://localhost:8000/po-dropdown");
            if (res.ok) 
                setPo(await res.json());
            } 
        catch (e) {
            console.error(e);
        }
    };


    const loadGrn = async () => {
        try {

            const res = await fetch(
                "http://127.0.0.1:8000/grn_read"
            );

            if (!res.ok) {
                throw new Error("Failed to load GRN Orders");
            }

            const data = await res.json();

            setGrn(data);

        } catch (error) {

            console.error(error);

            alert("Failed to load GRN Orders");
        }
    };

const handleItemChange = async (e) => {
    const poId = e.target.value;

    setForm((prev) => ({
        ...prev,
        po_id: poId,
        expiry_at: ""
    }));

    setIsExpiryTracked(false);

    if (!poId) {
        setCheckingExpiry(false);
        return;
    }

    setCheckingExpiry(true);


    try {
        const res = await fetch(
            `http://127.0.0.1:8000/check-expiry/${encodeURIComponent(poId)}`
        );

        if (!res.ok) {
            throw new Error("Failed to check expiry tracking");
        }

        const data = await res.json();

        setIsExpiryTracked(
            data.is_expiry_tracked === true
        );

    } catch (error) {
        console.error("Error fetching expiry value:", error);
        setIsExpiryTracked(false);
        alert("Unable to check product expiry tracking");

    } finally {
        setCheckingExpiry(false);
    }
};


    function handleChange(e) {

        const { name, value } = e.target;

        // Allow only digits in Received Qty and Total Amount
        if (name === "received_qty" || name === "total_amount") {
            const numericValue = value.replace(/[^0-9]/g, "");

            setForm((prev) => ({
                ...prev,
                [name]: numericValue
            }));

            return;
        }

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    }


    const createGrn = async () => {

        try {

            const res = await fetch(
                "http://127.0.0.1:8000/grn-create",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        ...form,
                        expiry_at: form.expiry_at || null
                    })
                }
            );

            if (!res.ok) {

                const errData = await res.json();

                throw new Error(
                    errData.detail || "Failed to create GRN order"
                );
            }

            alert("GRN created successfully");

            setForm(emptyForm);
            setIsExpiryTracked(false);
            setCheckingExpiry(false);

            await loadGrn();

        } catch (error) {

            console.error(error);
        }
    };

    const handleSubmit = (e) => {

        if (checkingExpiry) {
            alert("Please wait while expiry tracking is checked");
            return;
        }

        e.preventDefault();


        // Required fields
        if (
            !form.po_id ||
            !form.received_qty ||
            !form.total_amount
        ) {

            alert("Please fill all required fields");

            return;
        }

        // Validate numeric fields
        if (
            !/^[0-9]+$/.test(form.received_qty) ||
            !/^[0-9]+$/.test(form.total_amount)
        ) {
            alert("Received Qty and Total Amount must contain numbers only");
            return;
        }

        if (isExpiryTracked) {
            if (!form.expiry_at) {
                alert("Please select an expiry date");
                return;
            }

            if (form.expiry_at <= minExpiryDate) {
                alert("Expiry Date must be greater than today's date");
                return;
            }
        }

        createGrn();

    };

    const handleClear = () => {
        setForm(emptyForm);
        setIsExpiryTracked(false);
        setCheckingExpiry(false);
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
                    Create GRN
                </h3>

            </div>


            {/* GRN Form */}
            <form style={styles.form} onSubmit={handleSubmit}>

                <div style={styles.grid}>

                    {/* PO id */}
                    <div style={styles.formGroup}>

                        <label
                            style={styles.label}
                            htmlFor="po_id"
                        >
                            Po Id
                        </label>

                        <select style={styles.input} name="po_id" value={form.po_id} onChange={handleItemChange} required >
                            <option value="">Select Purchase Id</option>
                            {po.map((v) => (
                            <option key={v.po_id} value={v.po_id}>{v.po_id}</option>
                            ))}
                        </select>

                    </div>

                    {checkingExpiry && (
                        <small>Checking expiry tracking...</small>
                    )}

                    {/* Received qty */}
                    <div style={styles.formGroup}>

                        <label
                            style={styles.label}
                            htmlFor="qty"
                        >
                            Received Qty
                        </label>

                        <input
                            id="qty"
                            name="received_qty"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]+"
                            value={form.received_qty}
                            onChange={handleChange}
                            placeholder="Enter Received Qty"
                            style={styles.input}
                            required
                        />


                    </div>

                    {/* Total Amount */}
                    <div style={styles.formGroup}>

                        <label
                            style={styles.label}
                            htmlFor="total_amount"
                        >
                            Total Amount
                        </label>

                        <input
                            id="total_amount"
                            name="total_amount"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]+"
                            value={form.total_amount}
                            onChange={handleChange}
                            placeholder="Enter Total Amount"
                            style={styles.input}
                            required
                        />

                    </div>

                    {/* Expiry Date */}
                    {isExpiryTracked && (
                        <div style={styles.formGroup}>
                            <label
                                style={styles.label}
                                htmlFor="expiry_at"
                            >
                                Expiry Date
                            </label>

                            <input
                                id="expiry_at"
                                name="expiry_at"
                                type="date"
                                min={minExpiryDate}
                                value={form.expiry_at}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                        </div>
                    )}


                    {/* Buttons */}
                    <div style={styles.buttonRow}>

                        <button
                            type="submit"
                            style={styles.createButton}
                        >
                            Create GRN
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

            <h3 style={{ marginTop: "40px" }}>GRN List</h3>

            <div style={styles.tableContainer}>
                <table style={styles.table}>

                    <thead>
                        <tr>
                            <th style={styles.th}>GRN ID</th>
                            <th style={styles.th}>PO ID</th>
                            <th style={styles.th}>RECEIVED QTY</th>
                            <th style={styles.th}>TOTAL AMOUNT</th>
                            <th style={styles.th}>BATCH NO</th>
                            <th style={styles.th}>EXPIRY AT</th>
                            <th style={styles.th}>DELIVERY AT</th>
                        </tr>
                    </thead>

                    <tbody>
                        {grn.length === 0 ? (
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
                                    No GRN data found
                                </td>
                            </tr>
                        ) : (

                            grn.map((c) => (
                                <tr key={c.po_id}>
                                    <td style={styles.td}>{c.grn_id}</td>
                                    <td style={styles.td}>{c.po_id}</td>
                                    <td style={styles.td}>{c.received_qty}</td>
                                    <td style={styles.td}>{c.total_amount}</td>
                                    <td style={styles.td}>{c.batch_no}</td>
                                    <td style={styles.td}>{formatDateTime(c.expiry_at)}</td>
                                    <td style={styles.td}>{formatDateTime(c.delivered_at)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>

                </table>
            </div>

        </div>


    );

}
