import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {

    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = async () => {

        await logout();

        navigate("/", { replace: true });
    };


    const styles = {

        // Header
        header: {
            height: "60px",
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #dddddd",
            padding: "0px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: "0",
            zIndex: "100",
        },


        // Application Name
        title: {
            fontWeight: "700",
            fontSize: "20px",
            color: "#2563eb",
        },


        // Logout Button
        logoutButton: {
            backgroundColor: "transparent",
            color: "#6b7280",
            border: "1px solid #dddddd",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
        },

    };


    return (

        <header style={styles.header}>

            <div>
                <span style={styles.title}>
                    SIMS SYSTEM
                </span>
            </div>


            <button
                type="button"
                onClick={handleLogout}
                style={styles.logoutButton}
            >
                Logout
            </button>

        </header>
    );
}

