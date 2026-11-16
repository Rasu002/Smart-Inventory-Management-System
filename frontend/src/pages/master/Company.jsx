
import { useEffect, useState } from 'react';
import TopTabNav from '../../components/TopTabNav';

const tabs = [
    {
        label: 'Company',
        path: '/master/company',
        roles: ['ADMIN', 'PURCHASE_MANAGER'],
    },
    {
        label: 'Suppliers',
        path: '/master/suppliers',
        roles: ['ADMIN'],
    },
    {
        label: 'Customers',
        path: '/master/customers',
        roles: ['ADMIN'],
    },
    {
        label: 'Products',
        path: '/master/products',
        roles: ['ADMIN', 'PURCHASE_MANAGER'],
    }
];

const emptyForm = {
    company_name: "",
    gst: "",
    pan: "",
    phone: "",
    email: "",
    address: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
};

export default function Company() {

    // STATE
    const [company, setCompany] = useState(null);

    const [form, setForm] = useState(emptyForm);

    const [showModal, setShowModal] = useState(false);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [deleting, setDeleting] = useState(false);


    // READ COMPANY WHEN PAGE LOADS
    useEffect(() => {

        fetchCompany();

    }, []);


    // GET COMPANY
    const fetchCompany = async () => {

        try {

            setLoading(true);

            const res = await fetch(
                "http://127.0.0.1:8000/company_read",
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            if (res.status === 401) {

                window.location.href = "/";

                return;
            }

            if (!res.ok) {

                throw new Error(
                    "Failed to load company details"
                );
            }

            const data = await res.json();

            if (data) {

                setCompany(data);

                setForm({
                    company_name: data.company_name || "",
                    gst: data.gst || "",
                    pan: data.pan || "",
                    phone: data.phone || "",
                    email: data.email || "",
                    address: data.address || "",
                    country: data.country || "",
                    state: data.state || "",
                    city: data.city || "",
                    pincode: data.pincode || "",
                });

            } else {

                setCompany(null);

                setForm(emptyForm);
            }

        } catch (error) {

            console.error(error);

            alert("Unable to load company details");

        } finally {

            setLoading(false);
        }
    };


    // INPUT CHANGE
    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: value
        });

    };


    // CREATE / UPDATE COMPANY
    const saveCompany = async () => {

        try {

            setSaving(true);


            const isEdit = company !== null;

            const url = isEdit
                ? `http://127.0.0.1:8000/company-update/${company.company_id}`
                : "http://127.0.0.1:8000/company-create";

            const method = isEdit ? "PUT" : "POST";

            const res = await fetch(
                url,
                {
                    method: method,
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify(form)
                }
            );

            if (res.status === 401) {

                window.location.href = "/";

                return false;
            }

            const data = await res.json()

            // OTHER ERROR
            if (!res.ok) {

                alert(
                    data.detail ||
                    data.message ||
                    "Unable to save company"
                );

                return false;
            }

            // SUCCESS
            alert(
                isEdit
                    ? "Company updated successfully"
                    : "Company created successfully"
            );

            setShowModal(false);

            await fetchCompany();

            return true;

        } catch (error) {

            console.error(error);

            alert(
                "Server error. Please try again."
            );

            return false;

        } finally {

            setSaving(false);
        }
    };


    // DELETE COMPANY
    const deleteCompany = async () => {

        if (!company) {
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete "${company.company_name}"?\n\nThis action cannot be undone.`
        );

        if (!confirmed) {
            return;
        }

        try {

            setDeleting(true);

            const res = await fetch(
                `http://127.0.0.1:8000/company-delete/${company.company_id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            // Unauthorized
            if (res.status === 401) {

                window.location.href = "/";

                return;
            }

            // DELETE SUCCESS
            // 204 = No Content
            if (res.status === 204) {

                alert("Company deleted successfully");

                setCompany(null);
                setForm(emptyForm);

                return;
            }

            const data = await res.json();
            
            if (!res.ok) {

            alert(
                data.detail ||
                data.message ||
                "Unable to delete company"
            );

            return;
        }

            alert("Company deleted successfully");

            setCompany(null);

            setForm(emptyForm);

        } catch (error) {

            console.error(error);

            alert(
                "Server error. Please try again."
            );

        } finally {

            setDeleting(false);
        }
    };

    // OPEN CREATE MODAL
    const handleCreateClick = () => {

        setForm(emptyForm);



        setShowModal(true);
    };


    // OPEN EDIT MODAL
    const handleEditClick = () => {

        setForm({
            company_name: company.company_name || "",
            gst: company.gst || "",
            pan: company.pan || "",
            phone: company.phone || "",
            email: company.email || "",
            address: company.address || "",
            country: company.country || "",
            state: company.state || "",
            city: company.city || "",
            pincode: company.pincode || "",
        });



        setShowModal(true);
    };


    // SAVE FORM
    const handleSave = async (e) => {

        e.preventDefault();

        await saveCompany();
    };


    // LOADING

    if (loading) {

        return (

            <div className="fade-in">

                <TopTabNav tabs={tabs} />

                <div style={styles.loadingPage}>

                    <div style={styles.spinner}></div>

                    <div style={styles.loadingText}>
                        Loading company details...
                    </div>

                </div>

            </div>
        );
    }


    // MAIN PAGE

    return (

        <div className="fade-in">

            <TopTabNav tabs={tabs} />

            <div style={styles.page}>

                {
                    // NO COMPANY
                }

                {company === null && (

                    <div style={styles.emptyPage}>

                        <div style={styles.emptyIcon}>
                            🏢
                        </div>

                        <h1 style={styles.emptyTitle}>
                            Company Profile
                        </h1>

                        <p style={styles.emptyText}>
                            No company details have been configured.
                            Create your company profile to continue.
                        </p>

                        <button
                            style={styles.createButton}
                            onClick={handleCreateClick}
                        >
                            + Create Company
                        </button>

                    </div>
                )}


                {
                    // COMPANY EXISTS
                }

                {company !== null && (

                    <div style={styles.profile}>

                        {
                         // COMPANY HEADER
                        }

                        <div style={styles.profileHeader}>

                            <div style={styles.companyIdentity}>

                                <div style={styles.companyLogo}>
                                    {company.company_name
                                        ?.charAt(0)
                                        ?.toUpperCase()}
                                </div>

                                <div>

                                    <div style={styles.profileLabel}>
                                        COMPANY PROFILE
                                    </div>

                                    <h1 style={styles.companyName}>
                                        {company.company_name}
                                    </h1>

                                    <div style={styles.companyId}>
                                        Company ID : {company.company_id}
                                    </div>

                                </div>

                            </div>

                            <div style={styles.headerActions}>

                                <div style={styles.activeBadge}>
                                    <span style={styles.activeDot}></span>
                                    Active
                                </div>

                                <button
                                    style={styles.editButton}
                                    onClick={handleEditClick}
                                >
                                    ✎ Edit Company
                                </button>

                                <button
                                    style={styles.deleteButton}
                                    onClick={deleteCompany}
                                    disabled={deleting}
                                >
                                    {deleting
                                        ? "Deleting..."
                                        : "Delete Company"}
                                </button>

                            </div>

                        </div>


                        {
                            // BUSINESS INFORMATION
                        }

                        <div style={styles.section}>

                            <div style={styles.sectionHeader}>

                                <div>

                                    <div style={styles.sectionTitle}>
                                        Business Information
                                    </div>

                                    <div style={styles.sectionSubtitle}>
                                        Registered company information
                                    </div>

                                </div>

                            </div>

                            <div style={styles.infoGrid}>

                                <div style={styles.infoItem}>
                                    <div style={styles.infoLabel}>
                                        Company Name
                                    </div>
                                    <div style={styles.infoValue}>
                                        {company.company_name}
                                    </div>
                                </div>

                                <div style={styles.infoItem}>
                                    <div style={styles.infoLabel}>
                                        GST Number
                                    </div>
                                    <div style={styles.infoValue}>
                                        {company.gst}
                                    </div>
                                </div>

                                <div style={styles.infoItem}>
                                    <div style={styles.infoLabel}>
                                        PAN Number
                                    </div>
                                    <div style={styles.infoValue}>
                                        {company.pan}
                                    </div>
                                </div>

                                <div style={styles.infoItem}>
                                    <div style={styles.infoLabel}>
                                        Phone Number
                                    </div>
                                    <div style={styles.infoValue}>
                                        {company.phone}
                                    </div>
                                </div>

                                <div style={styles.infoItem}>
                                    <div style={styles.infoLabel}>
                                        Email Address
                                    </div>
                                    <div style={styles.infoValue}>
                                        {company.email}
                                    </div>
                                </div>

                            </div>

                        </div>


                        {
                        // ADDRESS INFORMATION
                        }

                        <div style={styles.section}>

                            <div style={styles.sectionHeader}>

                                <div>

                                    <div style={styles.sectionTitle}>
                                        Registered Address
                                    </div>

                                    <div style={styles.sectionSubtitle}>
                                        Company location and contact address
                                    </div>

                                </div>

                            </div>

                            <div style={styles.addressBox}>

                                <div style={styles.addressIcon}>
                                    📍
                                </div>

                                <div>

                                    <div style={styles.addressLabel}>
                                        Full Address
                                    </div>

                                    <div style={styles.addressValue}>
                                        {company.address}
                                    </div>

                                </div>

                            </div>

                            <div style={styles.infoGrid}>

                                <div style={styles.infoItem}>
                                    <div style={styles.infoLabel}>
                                        Country
                                    </div>
                                    <div style={styles.infoValue}>
                                        {company.country}
                                    </div>
                                </div>

                                <div style={styles.infoItem}>
                                    <div style={styles.infoLabel}>
                                        State
                                    </div>
                                    <div style={styles.infoValue}>
                                        {company.state}
                                    </div>
                                </div>

                                <div style={styles.infoItem}>
                                    <div style={styles.infoLabel}>
                                        City
                                    </div>
                                    <div style={styles.infoValue}>
                                        {company.city}
                                    </div>
                                </div>

                                <div style={styles.infoItem}>
                                    <div style={styles.infoLabel}>
                                        Pincode
                                    </div>
                                    <div style={styles.infoValue}>
                                        {company.pincode}
                                    </div>
                                </div>

                            </div>

                        </div>


                        {
                        // PROFILE FOOTER
                        }

                        <div style={styles.profileFooter}>

                            <div>

                                <div style={styles.footerTitle}>
                                    Company Profile Active
                                </div>

                                <div style={styles.footerText}>
                                    This company is currently configured
                                    in the SIMS system.
                                </div>

                            </div>

                            <div style={styles.footerCheck}>
                                ✓
                            </div>

                        </div>

                    </div>

                )}


                {
                    // CREATE / EDIT MODAL
                }

                {showModal && (

                    <div style={styles.overlay}>

                        <div style={styles.modal}>

                            {
                                // MODAL HEADER
                            }

                            <div style={styles.modalHeader}>

                                <div>

                                    <div style={styles.modalLabel}>
                                        COMPANY MASTER
                                    </div>

                                    <div style={styles.modalTitle}>
                                        {company
                                            ? "Edit Company Details"
                                            : "Create Company Details"}
                                    </div>

                                </div>

                                <button
                                    style={styles.closeButton}
                                    onClick={() => setShowModal(false)}
                                    disabled={saving}
                                >
                                    ×
                                </button>

                            </div>


                            {
                                // FORM
                            }

                            <form
                                style={styles.form}
                                onSubmit={handleSave}
                            >

                                <div style={styles.inputGroup}>
                                    <label style={styles.label} htmlFor="">Company Name</label>
                                    <input
                                        name="company_name"
                                        value={form.company_name}
                                        onChange={handleChange}
                                        placeholder="Enter company name"
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label} htmlFor="">GST Number</label>
                                    <input
                                        name="gst"
                                        value={form.gst}
                                        onChange={handleChange}
                                        placeholder=" 33KVVPS5803R1ZA"
                                        maxLength={15}
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label} htmlFor="">PAN Number</label>
                                    <input
                                        name="pan"
                                        value={form.pan}
                                        onChange={handleChange}
                                        placeholder="ABCDE1234F"
                                        maxLength={10}
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label} htmlFor="">Phone Number</label>
                                    <input
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="Enter phone number"
                                        maxLength={10}
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label} htmlFor="">Email Address</label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="Enter email address"
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label} htmlFor="">Address</label>
                                    <input
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        placeholder="Enter complete address"
                                        full
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label} htmlFor="">Country</label>
                                    <input
                                        name="country"
                                        value={form.country}
                                        onChange={handleChange}
                                        placeholder="Enter country"
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label} htmlFor="">State</label>
                                    <input
                                        name="state"
                                        value={form.state}
                                        onChange={handleChange}
                                        placeholder="Enter state"
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label} htmlFor="">City</label>
                                    <input
                                        name="city"
                                        value={form.city}
                                        onChange={handleChange}
                                        placeholder="Enter city"
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label} htmlFor="">Pincode</label>
                                    <input
                                        name="pincode"
                                        value={form.pincode}
                                        onChange={handleChange}
                                        placeholder="Enter pincode"
                                        maxLength={6}
                                        style={styles.input}
                                    />
                                </div>
                                
                                {
                                 // MODAL BUTTONS
                                }

                                <div style={styles.modalButtons}>

                                    <button
                                        type="button"
                                        style={styles.cancelButton}
                                        onClick={() => setShowModal(false)}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        style={styles.saveButton}
                                        disabled={saving}
                                    >
                                        {saving
                                            ? "Saving..."
                                            : company
                                                ? "Update Company"
                                                : "Save Company"}
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>
                )}
                </div>

            </div>
            );
}

// STYLES
const styles = {
    page: {
        background: "#f4f6f9",
        boxSizing: "border-box", 
    },

    loadingPage: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#f4f6f9", 
    },
    
    spinner: {
        width: "40px",
        height: "40px",
        border: "4px solid #e5e7eb",
        borderTop: "4px solid #4f46e5",
        borderRadius: "50%", 
    },

    loadingText: {
        marginTop: "15px",
        color: "#6b7280",
        fontSize: "15px", 
    },

    //  EMPTY PAGE 
    emptyPage: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center", 
    },

    emptyIcon: {
        width: "90px",
        height: "90px",
        borderRadius: "22px",
        background: "#e9edff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "42px",
        marginBottom: "20px", 
    },

    emptyTitle: {
        margin: 0,
        fontSize: "30px",
        fontWeight: "750",
        color: "#111827", 
    },

    emptyText: {
        maxWidth: "500px",
        margin: "12px 0 28px",
        color: "#6b7280",
        fontSize: "15px",
        lineHeight: "1.6",
    },

    createButton: {
        padding: "13px 25px",
        background: "#4f46e5",
        color: "#ffffff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "650",
    },

    overlay: { 
        position: "fixed", 
        inset: 0, 
        background: "rgba(15, 23, 42, 0.65)", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        padding: "20px", 
        zIndex: 1000, 
        boxSizing: "border-box", 
    },

    modal: { 
        width: "900px", 
        maxWidth: "100%", 
        maxHeight: "92vh", 
        overflowY: "auto", 
        background: "#ffffff", 
        borderRadius: "15px", 
        padding: "30px", 
        boxSizing: "border-box", 
        boxShadow: "0 25px 70px rgba(0,0,0,0.25)", 
    },

    modalHeader: { 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "28px", 
    },

    modalLabel: { 
        fontSize: "10px", 
        color: "#6366f1", 
        fontWeight: "750", 
        letterSpacing: "1.5px", 
        marginBottom: "5px", 
    },

    modalTitle: { 
        fontSize: "23px", 
        fontWeight: "750", 
        color: "#111827", 
    },

    closeButton: {
        width: "36px", 
        height: "36px", 
        border: "none", 
        borderRadius: "50%", 
        background: "#f3f4f6", 
        color: "#374151", 
        fontSize: "23px", 
        cursor: "pointer", 
    },

    form: {
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gap: "19px", 
    },

    inputGroup: {
        display: "flex", 
        flexDirection: "column", 
    },

    input: {
        width: "100%", 
        height: "43px", 
        padding: "0 12px", 
        border: "1px solid #d1d5db", 
        borderRadius: "7px", 
        outline: "none", 
        fontSize: "14px", 
        color: "#111827", 
        boxSizing: "border-box", 
    },

    modalButtons: {
        gridColumn: "span 2", 
        display: "flex", 
        justifyContent: "flex-end", 
        gap: "10px", 
        paddingTop: "20px", 
        marginTop: "5px", 
        borderTop: "1px solid #e5e7eb", 
    },

    cancelButton: {
        padding: "11px 22px", 
        background: "#f3f4f6", 
        color: "#374151", 
        border: "none", 
        borderRadius: "7px", 
        cursor: "pointer", 
        fontSize: "13px", 
        fontWeight: "650", 
    },

    saveButton: {
        padding: "11px 24px", 
        background: "#4f46e5", 
        color: "#ffffff", 
        border: "none", 
        borderRadius: "7px", 
        cursor: "pointer", 
        fontSize: "13px", 
        fontWeight: "650", 
    },

    // Page with Company data
    profile: {
        width: "100%",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    },

    //COMPANY HEADER

    profileHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "24px 28px",
        borderBottom: "1px solid #eaeef3",
        background: "#ffffff",
    },

    companyIdentity: {
        display: "flex",
        alignItems: "center",
        gap: "14px",
    },

    companyLogo: {
        width: "56px",
        height: "56px",
        borderRadius: "10px",
        background: "#eef4ff",
        color: "#2563eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "23px",
        fontWeight: "700",
        border: "1px solid #dbe7ff",
    },

    profileLabel: {
        fontSize: "11px",
        fontWeight: "700",
        letterSpacing: "1px",
        color: "#64748b",
        marginBottom: "4px",
    },

    companyName: {
        margin: "0",
        fontSize: "23px",
        fontWeight: "700",
        color: "#172033",
        lineHeight: "1.3",
    },

    companyId: {
        marginTop: "5px",
        fontSize: "12px",
        color: "#64748b",
    },

    headerActions: {
        display: "flex",
        alignItems: "center",
        gap: "9px",
    },

    activeBadge: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 10px",
        borderRadius: "20px",
        background: "#f0fdf4",
        border: "1px solid #bbf7d0",
        color: "#15803d",
        fontSize: "12px",
        fontWeight: "600",
    },

    activeDot: {
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        background: "#22c55e",
    },

    editButton: {
        padding: "8px 13px",
        border: "1px solid #bfdbfe",
        borderRadius: "7px",
        background: "#eff6ff",
        color: "#2563eb",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
    },

    deleteButton: {
        padding: "8px 13px",
        border: "1px solid #fecaca",
        borderRadius: "7px",
        background: "#fff5f5",
        color: "#dc2626",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
    },

    // SECTION

    section: {
        padding: "25px 28px",
        borderBottom: "1px solid #eaeef3",
    },

    sectionHeader: {
        marginBottom: "18px",
    },

    sectionTitle: {
        fontSize: "16px",
        fontWeight: "700",
        color: "#172033",
        marginBottom: "4px",
    },

    sectionSubtitle: {
        fontSize: "12px",
        color: "#64748b",
    },

    // INFORMATION GRID

    infoGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "12px",
    },

    // ADDRESS

    addressBox: {
        display: "flex",
        alignItems: "flex-start",
        gap: "13px",
        padding: "16px",
        marginBottom: "14px",
        background: "#f8fafc",
        border: "1px solid #e5eaf0",
        borderRadius: "9px",
    },

    addressIcon: {
        width: "36px",
        height: "36px",
        borderRadius: "8px",
        background: "#eef4ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "17px",
        flexShrink: 0,
    },

    addressLabel: {
        fontSize: "11px",
        fontWeight: "700",
        color: "#64748b",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        marginBottom: "5px",
    },

    addressValue: {
        fontSize: "14px",
        color: "#334155",
        lineHeight: "1.5",
    },

            
    // FOOTER

    profileFooter: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 28px",
        background: "#f8fafc",
    },

    footerTitle: {
        fontSize: "13px",
        fontWeight: "700",
        color: "#334155",
        marginBottom: "3px",
    },

    footerText: {
        fontSize: "12px",
        color: "#64748b",
    },

    footerCheck: {
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        background: "#dcfce7",
        color: "#16a34a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "16px",
        fontWeight: "700",
    },

    infoItem: {
        padding: "15px 16px",
        background: "#f8fafc",
        border: "1px solid #e5eaf0",
        borderRadius: "9px",
        minHeight: "68px",
        boxSizing: "border-box",
    },

    infoLabel: {
        fontSize: "10px",
        fontWeight: "700",
        color: "#64748b",
        textTransform: "uppercase",
        letterSpacing: "0.6px",
        marginBottom: "7px",
    },

    infoValue: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#1e293b",
        wordBreak: "break-word",
    },

};

