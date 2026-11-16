import { useState, useEffect } from 'react';
import TopTabNav from '../../components/TopTabNav';

const tabs = [
    { label: 'Stock Balance', path: '/inventory/stock-balance',  roles: ['ADMIN', 'PURCHASE MANAGER'],  },
    { label: 'Stock Ledger', path: '/inventory/stock-ledger',  roles: ['ADMIN', 'PURCHASE MANAGER']  },
];


export default function STockLedger() {

    const [sl, setSl] = useState([]);

    useEffect(() => {
        loadStockLedger();
    }, []);


    const loadStockLedger = async () => {
        try {

            const res = await fetch(
                "http://127.0.0.1:8000/sl_read"
            );

            if (!res.ok) {
                throw new Error("Failed to load Stock Ledger");
            }

            const data = await res.json();

            setSl(data);

        } catch (error) {

            console.error(error);

            alert("Failed to load Stock Ledger");
        }
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

        tableContainer: { overflowX: "auto", marginTop: "40px" },
        table: { width: "100%", borderCollapse: "collapse" },
        th: { background: "#4f46e5", color: "white", padding: "10px" },
        td: { border: "1px solid #ddd", padding: "10px" },
        editBtn: { background: "#22c55e", color: "white", border: "none", padding: "6px 10px", borderRadius: "4px", cursor: "pointer" }

    };





    return (
        <div>

            <TopTabNav tabs={tabs} />

            <h3 style={{ marginTop: "40px" }}>Stock Ledger List</h3>

            <div style={styles.tableContainer}>
                <table style={styles.table}>

                    <thead>
                        <tr>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Product Id</th>
                            <th style={styles.th}>Batch No</th>
                            <th style={styles.th}>Movement Type</th>
                            <th style={styles.th}>Movement Id</th>
                            <th style={styles.th}>Before Qty</th>
                            <th style={styles.th}>Movement Qty</th>
                            <th style={styles.th}>After Qty</th>
                            <th style={styles.th}>Created</th>
                        </tr>
                    </thead>

                    <tbody>
                        {sl.length === 0 ? (
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
                                    No Stock Ledger data found
                                </td>
                            </tr>
                        ) : (

                            sl.map((c) => (
                                <tr key={c.sb_id}>
                                    <td style={styles.td}>{c.sl_id}</td>
                                    <td style={styles.td}>{c.product_id}</td>
                                    <td style={styles.td}>{c.batch_no}</td>
                                    <td style={styles.td}>{c.movement_type}</td>
                                    <td style={styles.td}>{c.movement_id}</td>
                                    <td style={styles.td}>{c.before_qty}</td>
                                    <td style={styles.td}>{c.movement_qty}</td>
                                    <td style={styles.td}>{c.after_qty}</td>
                                    <td style={styles.td}>{formatDateTime(c.created_datetime)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>

                </table>
            </div>

        </div>


    );

}

