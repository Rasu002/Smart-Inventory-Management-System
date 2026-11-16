import { useState, useEffect } from 'react';
import TopTabNav from '../../components/TopTabNav';

const tabs = [
    { label: 'Company', path: '/master/company', roles: ['ADMIN', 'PURCHASE MANAGER'], },
    { label: 'Suppliers', path: '/master/suppliers', roles: ['ADMIN', 'PURCHASE MANAGER'], },
    { label: 'Customers', path: '/master/customers', roles: ['ADMIN', 'PURCHASE MANAGER'], },
    { label: 'Products', path: '/master/products', roles: ['ADMIN', 'PURCHASE MANAGER'], }

];

export default function Products() {

    const emptyForm = {
        product_id: "",
        name: "",
        unit_measure: "",
        selling_price: "",
        minimum_stock: "",
        product_type: "",
        is_expiry_tracked: true,
        is_active: true,
    };

    const [form, setForm] = useState(emptyForm);
    const [products, setProducts] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);


    useEffect(() => {
        loadProducts();
    }, []);


    const loadProducts = async () => {
        try {

            const res = await fetch(
                "http://127.0.0.1:8000/product_read"
            );

            if (!res.ok) {
                throw new Error("Failed to load Products");
            }

            const data = await res.json();

            setProducts(data);

        } catch (error) {

            console.error(error);

            alert("Failed to load Products");
        }
    };

    const formatPrice = (value) => {

        // Allow only numbers and decimal point
        value = value.replace(/[^0-9.]/g, "");

        // Allow only one decimal point
        const parts = value.split(".");

        if (parts.length > 2) {
            value = parts[0] + "." + parts.slice(1).join("");
        }

        // Maximum 2 digits after decimal
        if (value.includes(".")) {
            const [integerPart, decimalPart] = value.split(".");

            value = integerPart + "." + decimalPart.slice(0, 2);
        }

        // Maximum 10 digits total
        const totalDigits = value.replace(".", "");

        if (totalDigits.length > 10) {
            return null;
        }

        return value;
    };


    function handleChange(e) {

        const { name, value, type, checked } = e.target;

        if (name === "selling_price") {

            const formattedValue = formatPrice(value);

            if (formattedValue !== null) {
                setForm({
                    ...form,
                    selling_price: formattedValue
                });
            }

            return;
        }
        
        if (name === "minimum_stock") {

            const formattedValue = formatPrice(value);

            if (formattedValue !== null) {
                setForm({
                    ...form,
                    minimum_stock: formattedValue
                });
            }

            return;
        }

        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value
        });
    }


    const createProduct = async () => {

        try {

            const res = await fetch(
                "http://127.0.0.1:8000/product-create",
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
                    errData.detail || "Failed to create Products"
                );
            }

            alert("Products created successfully");

            setForm(emptyForm);

            await loadProducts();

        } catch (error) {

            console.error(error);

            alert(error.message);
        }
    };


    const updateProduct = async () => {

        try {

            const res = await fetch(
                `http://127.0.0.1:8000/product-update/${selectedId}`,
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
                    errData.detail || "Failed to update Products"
                );
            }

            alert("Products updated successfully");

            loadProducts();

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
            !form.product_id ||
            !form.name ||
            !form.unit_measure ||
            !form.selling_price ||
            !form.minimum_stock ||
            !form.product_type 
        ) {

            alert("Please fill all required fields");

            return;
        }

        if (isEditing) {

            updateProduct();

        } else {

            createProduct();
        }
    };


    const handleEdit = (id) => {

        const data = products.find((x) => x.product_id === id);

        if (!data) {
            console.error("Product not found:", id);
            return;
        }

        setForm({
            product_id: data.product_id,
            name: data.name,
            unit_measure: data.unit_measure,
            selling_price: data.selling_price,
            minimum_stock: data.minimum_stock,
            product_type: data.product_type,
            is_expiry_tracked: data.is_expiry_tracked ?? true,
            is_active: data.is_active ?? true
        });

        setSelectedId(data.product_id);
        setIsEditing(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const deleteProduct = async (id) => {

        try {

            const ok = window.confirm(
                "Do you want to delete this Product?"
            );

            if (!ok) {
                return;
            }

            const res = await fetch(
                `http://127.0.0.1:8000/product-delete/${id}`,
                {
                    method: "DELETE"
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.detail || "Failed to delete Product"
                );
            }

            alert(data.message || "Product deleted successfully");

            await loadProducts();

            setForm(emptyForm);
            setSelectedId(null);
            setIsEditing(false);

        } catch (error) {

            console.error("Delete Product error:", error);

            alert(error.message || "Failed to delete Product");
        }
    };

    const handleDelete = () => {
        if (!selectedId) {
            alert("Please select a Product first");
            return;
        }

        deleteProduct(selectedId);
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
             gap: "8px", 
             flexWrap: "wrap", 
             alignItems: "center" 
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
                    {isEditing ? "Update Product" : "Add Product"}
                </h3>

            </div>


            {/* Product Form */}
            <form style={styles.form} onSubmit={handleSubmit}>

                <div style={styles.grid}>

                    {/* Product Id */}
                    <div style={styles.formGroup}>

                        <label
                            style={styles.label}
                            htmlFor="product_id"
                        >
                            Product Id
                        </label>

                        <input
                            id="product_id"
                            name="product_id"
                            value={form.product_id}
                            onChange={handleChange}
                            placeholder="Enter Product Id"
                            style={{
                                ...styles.input,
                                backgroundColor: isEditing ? "#f0f0f0" : "white",
                                cursor: isEditing ? "not-allowed" : "text"
                            }}
                            disabled={isEditing}
                        />

                    </div>

                    {/* Product Name */}
                    <div style={styles.formGroup}>

                        <label
                            style={styles.label}
                            htmlFor="name"
                        >
                            Product Name
                        </label>

                        <input
                            id="name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Enter Product name"
                            style={styles.input}
                        />

                    </div>

                    {/* Unit Measure */}
                    <div style={styles.formGroup}>

                        <label
                            style={styles.label}
                            htmlFor="unit_measure"
                        >
                            Unit Measure
                        </label>

                        <select
                            id="unit_measure"
                            name="unit_measure"
                            value={form.unit_measure}
                            onChange={handleChange}
                            style={styles.input}
                        >
                            <option value="">Select Measure Unit</option>
                            <option value="KG">KILOGRAM</option>
                            <option value="PCS">PISCES</option>
                            <option value="LITER">LITER</option>
                            <option value="BOX">BOX</option>
                            <option value="METER">METER</option>
                        </select>

                    </div>

                    {/* Selling Price */}
                    <div style={styles.formGroup}>

                        <label
                            style={styles.label}
                            htmlFor="selling_price"
                        >
                            Selling Price
                        </label>

                        <input
                            id="selling_price"
                            name="selling_price"
                            value={form.selling_price}
                            onChange={handleChange}
                            placeholder="Enter selling Price"
                            style={styles.input}
                        />

                    </div>


                    {/* Minimum stock */}
                    <div style={styles.formGroup}>

                        <label
                            style={styles.label}
                            htmlFor="minimum_stock"
                        >
                            Mininum Stock
                        </label>

                        <input
                            id="minimum_stock"
                            name="minimum_stock"
                            type="number"
                            min="1"
                            value={form.minimum_stock}
                            onChange={handleChange}
                            placeholder="Enter Minimum Stock"
                            style={styles.input}
                        />

                    </div>

                    {/* Product Type */}
                    <div style={styles.formGroup}>

                        <label
                            style={styles.label}
                            htmlFor="product_type"
                        >
                            Select Product Type
                        </label>

                        <select
                            id="product_type"
                            name="product_type"
                            value={form.product_type}
                            onChange={handleChange}
                            style={styles.input}
                        >
                            <option value="">Select Product Type</option>
                            <option value="RAW MATERIAL">RAW MATERIAL</option>
                            <option value="FINISHED GOODS">FINISHED GOODS</option>
                        </select>

                    </div>
                    
                    <div style={styles.checkboxRow}>

                        {/* Expiry Track */}
                        <div style={styles.checkboxRow}>

                            <input
                                id="is_expiry_tracked"
                                name="is_expiry_tracked"
                                type="checkbox"
                                checked={form.is_expiry_tracked}
                                onChange={handleChange}
                                style={styles.checkbox}
                            />

                            <label
                                style={styles.checkboxLabel}
                                htmlFor="is_expiry_tracked"
                            >
                                Expiry Track
                            </label>

                        </div>

                        {/* Active Product */}
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
                                Active Product
                            </label>

                        </div>

                    </div>


                    {/* Buttons */}
                    <div style={styles.buttonRow}>

                        <button
                            type="submit"
                            style={styles.createButton}
                        >
                            {isEditing
                                ? "Update Product"
                                : "Create Product"
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
                                Delete Product
                            </button>
                        )}

                    </div>

                </div>

            </form>

            <h3 style={{ marginTop: "40px" }}>Products List</h3>

            <div style={styles.tableContainer}>
                <table style={styles.table}>

                    <thead>
                        <tr>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Name</th>
                            <th style={styles.th}>Unit Measure</th>
                            <th style={styles.th}>Selling Price</th>
                            <th style={styles.th}>Minimum Stock</th>
                            <th style={styles.th}>Product Type</th>
                            <th style={styles.th}>Expiry Track</th>
                            <th style={styles.th}>Active Status</th>
                            <th style={styles.th}>Created</th>
                            <th style={styles.th}>Updated</th>
                            <th style={styles.th}>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {products.length === 0 ? (
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
                                    No Products data found
                                </td>
                            </tr>
                        ) : (

                            products.map((c) => (
                                <tr key={c.product_id}>
                                    <td style={styles.td}>{c.product_id}</td>
                                    <td style={styles.td}>{c.name}</td>
                                    <td style={styles.td}>{c.unit_measure}</td>
                                    <td style={styles.td}>{c.selling_price}</td>
                                    <td style={styles.td}>{c.minimum_stock}</td>
                                    <td style={styles.td}>{c.product_type}</td>
                                    <td style={styles.td}>{c.is_expiry_tracked ? "Active" : "Inactive"}</td>
                                    <td style={styles.td}>{c.is_active ? "Active" : "Inactive"}</td>
                                    <td style={styles.td}>{formatDateTime(c.created_at)}</td>
                                    <td style={styles.td}>{formatDateTime(c.updated_at)}</td>
                                    <td style={styles.td}>
                                        <button style={styles.editBtn} onClick={() => handleEdit(c.product_id)}>
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