import { useState, useEffect } from 'react';
import TopTabNav from '../../components/TopTabNav';

const tabs = [
    { label: 'Company', path: '/master/company', roles: ['ADMIN', 'PURCHASE MANAGER'],},
    { label: 'Suppliers', path: '/master/suppliers', roles: ['ADMIN', 'PURCHASE MANAGER'],},
    { label: 'Customers', path: '/master/customers', roles: ['ADMIN', 'PURCHASE MANAGER'],},
    { label: 'Products', path: '/master/products', roles: ['ADMIN', 'PURCHASE MANAGER'],}
    
];

export default function Suppliers() {

    const emptyForm = {
        name: "",
        company_id: "",
        email: "",
        phone: "",
        is_active: true,
    };

    const [form, setForm] = useState(emptyForm);
    const [suppliers, setSuppliers] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);


    useEffect(() => {
        loadSuppliers();
    }, []);


    const loadSuppliers = async () => {
        try {

            const res = await fetch(
                "http://127.0.0.1:8000/supplier_read"
            );

            if (!res.ok) {
                throw new Error("Failed to load Suppliers");
            }

            const data = await res.json();

            setSuppliers(data);

        } catch (error) {

            console.error(error);

            alert("Failed to load Suppliers");
        }
    };


    function handleChange(e) {

        const { name, value, type, checked } = e.target;

        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value
        });
    }


    const createSupplier = async () => {

        try {

            const res = await fetch(
                "http://127.0.0.1:8000/supplier-create",
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
                    errData.detail || "Failed to create Supplier"
                );
            }

            alert("Supplier created successfully");

            setForm(emptyForm);

            await loadSuppliers();

        } catch (error) {

            console.error(error);

            alert(error.message);
        }
    };


    const updateSupplier = async () => {

        try {

            const res = await fetch(
                `http://127.0.0.1:8000/supplier-update/${selectedId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(form)
                }
            );

            if (!res.ok) {

                const errData = await res.json();

                throw new Error(
                    errData.detail || "Failed to update Supplier"
                );
            }

            alert("Supplier updated successfully");

            loadSuppliers();

            setForm(emptyForm);

            setSelectedId(null);

            setIsEditing(false);

        } catch (error) {

            console.error(error);

            alert(error.message);
        }
    };


    const handleSubmit = (e) => {

        e.preventDefault();


        // Required fields
        if (
            !form.name ||
            !form.company_id ||
            !form.email ||
            !form.phone
        ) {

            alert("Please fill all required fields");

            return;
        }


        // Phone validation
        const phonePattern = /^[0-9]{10}$/;

        if (!phonePattern.test(form.phone)) {

            alert("Phone must be 10 digits");

            return;
        }


        // Email validation
        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(form.email)) {

            alert("Enter valid email");

            return;
        }


        if (isEditing) {

            updateSupplier();

        } else {

            createSupplier();
        }
    };


    const handleEdit = (id) => {

        const data = suppliers.find((x) => x.supplier_id === id);

        if (!data) {
            console.error("Supplier not found:", id);
            return;
        }

        setForm({
            name: data.name,
            company_id: data.company_id,
            email: data.email,
            phone: data.phone,
            is_active: data.is_active ?? true,
        });

        setSelectedId(data.supplier_id);
        setIsEditing(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const deleteSupplier = async (id) => {

        try {

            const ok = window.confirm(
                "Do you want to delete this Supplier?"
            );

            if (!ok) {
                return;
            }

            const res = await fetch(
                `http://127.0.0.1:8000/suppliers-delete/${id}`,
                {
                    method: "DELETE"
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.detail || "Failed to delete Supplier"
                );
            }

            alert(data.message || "Supplier deleted successfully");

            await loadSuppliers();

            setForm(emptyForm);
            setSelectedId(null);
            setIsEditing(false);

        } catch (error) {

            console.error("Delete Supplier error:", error);

            alert(error.message || "Failed to delete Supplier");
        }
    };

    const handleDelete = () => {
        if (!selectedId) {
            alert("Please select a Supplier first");
            return;
        }

        deleteSupplier(selectedId);
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
            alignItems: "center",
            gap: "32px",
            marginTop: "5px",
            paddingTop: "4px",
            borderTop: "1px solid #f3f4f6",
        },


        // =========================================
        // Create / Update Button
        // =========================================

        createButton: {
            minWidth: "140px",
            height: "40px",
            padding: "0 22px",
            backgroundColor: "#1d4ed8",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
        },


        // =========================================
        // Clear Button
        // =========================================

        clearButton: {
            minWidth: "100px",
            height: "40px",
            padding: "0px 8px",
            margin: "0px 0px 0px 25px",
            backgroundColor: "#bbbbba",
            color: "#040404",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
        },

        deleteButton: {
            minWidth: "100px",
            height: "40px",
            padding: "0px 8px",
            margin: "0px 0px 0px 25px",
            backgroundColor: "#922020",
            color: "#efe6e6",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
        },

        tableContainer: { overflowX: "auto", marginTop: "40px" },
        table: { width: "100%", borderCollapse: "collapse" },
        th: { background: "#4f46e5", color: "white", padding: "10px" },
        td: { border: "1px solid #ddd", padding: "10px" },
        editBtn: { background: "#22c55e", color: "white", border: "none", padding: "6px 10px", borderRadius: "4px", cursor: "pointer" }

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
                    {isEditing ? "Update Suppliers" : "Add Suppliers"}
                </h3>

            </div>


            {/* Supplier Form */}
            <form style={styles.form} onSubmit={handleSubmit}>

                <div style={styles.grid}>

                    {/* Supplier Name */}
                    <div style={styles.formGroup}>

                        <label
                            style={styles.label}
                            htmlFor="name"
                        >
                            Supplier Name
                        </label>

                        <input
                            id="name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Enter Supplier name"
                            style={styles.input}
                        />

                    </div>

                    {/* Company ID */}
                    <div style={styles.formGroup}>

                        <label
                            style={styles.label}
                            htmlFor="company_id"
                        >
                            Company ID
                        </label>

                        <input
                            id="company_id"
                            name="company_id"
                            value={form.company_id}
                            onChange={handleChange}
                            placeholder="Enter Company ID"
                            style={styles.input}
                        />

                    </div>

                    {/* Email */}
                    <div style={styles.formGroup}>

                        <label
                            style={styles.label}
                            htmlFor="email"
                        >
                            Email Address
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Enter email address"
                            style={styles.input}
                        />

                    </div>


                    {/* Phone */}
                    <div style={styles.formGroup}>

                        <label
                            style={styles.label}
                            htmlFor="phone"
                        >
                            Phone Number
                        </label>

                        <input
                            id="phone"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="Enter phone number"
                            maxLength={10}
                            style={styles.input}
                        />

                    </div>


                    {/* Active Vendor */}
                    <div style={styles.checkboxRow}>

                        <input
                            id="is_active"
                            name="is_active"
                            type="checkbox"
                            checked={form.is_active}
                            onChange={handleChange}
                            style={styles.checkbox}
                        />

                        <label
                            style={styles.checkboxLabel}
                            htmlFor="is_active"
                        >
                            Active Supplier
                        </label>

                    </div>


                    {/* Buttons */}
                    <div style={styles.buttonRow}>

                        <button
                            type="submit"
                            style={styles.createButton}
                        >
                            {isEditing
                                ? "Update Supplier"
                                : "Create Supplier"
                            }
                        </button>

                        <button
                            type="button"
                            style={styles.clearButton}
                            onClick={handleClear}
                        >
                            Clear Form
                        </button>

                        {isEditing && (
                            <button
                                type="button"
                                style={styles.deleteButton}
                                onClick={handleDelete}
                            >
                                Delete Supplier
                            </button>
                        )}

                    </div>

                </div>

            </form>

            <h3 style={{ marginTop: "40px" }}>Suppliers List</h3>

            <div style={styles.tableContainer}>
                <table style={styles.table}>

                    <thead>
                        <tr>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Name</th>
                            <th style={styles.th}>Company_id</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Phone</th>
                            <th style={styles.th}>Active Status</th>
                            <th style={styles.th}>Created</th>
                            <th style={styles.th}>Updated</th>
                            <th style={styles.th}>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {suppliers.length === 0 ? (
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
                                    No Suppliers data found
                                </td>
                            </tr>
                        ) : (

                            suppliers.map((c) => (
                                <tr key={c.vendor_id}>
                                    <td style={styles.td}>{c.supplier_id}</td>
                                    <td style={styles.td}>{c.name}</td>
                                    <td style={styles.td}>{c.company_id}</td>
                                    <td style={styles.td}>{c.email}</td>
                                    <td style={styles.td}>{c.phone}</td>
                                    <td style={styles.td}>{c.is_active ? "Active" : "Inactive"}</td>
                                    <td style={styles.td}>{formatDateTime(c.created_at)}</td>
                                    <td style={styles.td}>{formatDateTime(c.updated_at)}</td>
                                    <td style={styles.td}>
                                        <button style={styles.editBtn} onClick={() => handleEdit(c.supplier_id)}>
                                            Update
                                        </button>
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

