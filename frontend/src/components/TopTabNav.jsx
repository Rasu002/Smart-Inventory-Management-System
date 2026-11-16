import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";



export default function TopTabNav({ tabs }) {

    const { user, loading } = useAuth();
    
    const role_name = user?.user_role;

    const filteredNavItems = tabs.filter(item =>
        item.roles.includes(role_name)
    );


    // ============================================================
    // Styles
    // ============================================================

    const styles = {

        nav: {
            display: "flex",
            gap: "50px",
            borderBottom: "1px solid #dddddd",
            marginBottom: "35px",
        },

        tab: {
            padding: "0 0 14px",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: "500",
            color: "#6b7280",
            borderBottom: "2px solid transparent",
        },

        activeTab: {
            color: "#2563eb",
            fontWeight: "600",
            borderBottom: "2px solid #2563eb",
        },
    };


    // ============================================================
    // Loading
    // ============================================================

    if (loading) {
        return null;
    }


    // ============================================================
    // Display tabs
    // ============================================================

    return (
        <nav style={styles.nav}>

            {filteredNavItems.map((tab, index) => (

                <NavLink
                    key={index}
                    to={tab.path}
                    style={({ isActive }) => ({
                        ...styles.tab,
                        ...(isActive ? styles.activeTab : {}),
                    })}
                >
                    {tab.label}
                </NavLink>

            ))}

        </nav>
    );
}