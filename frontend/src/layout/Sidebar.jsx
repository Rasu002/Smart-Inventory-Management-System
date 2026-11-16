
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";

const navItems = [

    {
        label: 'Master',
        path: '/master/company',
        basePath: '/master',
        roles: ['ADMIN', 'PURCHASE_MANAGER'],
    },

    {
        label: 'Purchase',
        path: '/purchase/POList',
        basePath: '/purchase',
        roles: ['ADMIN', 'PURCHASE_MANAGER'],
    },

    {
        label: 'Inventory',
        path: '/inventory/stock-balance',
        basePath: '/inventory',
        roles: ['ADMIN'],
    },

    {
        label: 'Orders',
        path: '/sales/sales-order',
        basePath: '/sales',
        roles: ['ADMIN'],
    },

    {
        label: 'Dispatch',
        path: '/dispatch/invoice',
        basePath: '/dispatch',
        roles: ['ADMIN'],
    },

    {
        label: 'Help',
        path: '/help/help',
        basePath: '/help',
        roles: ['ADMIN', 'PURCHASE_MANAGER'],
    },
];

export default function Sidebar() {

    const location = useLocation();
    const { user, loading } = useAuth();

    const role_name = user?.user_role;

    const filteredNavItems = navItems.filter(item =>
        item.roles.includes(role_name)
    );
    

    const styles = {

        // Main Sidebar
        sidebar: {
            width: "250px",
            height: "100vh",
            position: "fixed",
            top: "0",
            left: "0",
            backgroundColor: "#ffffff",
            borderRight: "1px solid #dddddd",
            overflowY: "auto",
        },

        // Sidebar Heading
        sidebarTitle: {
            padding: "24px 20px",
            fontSize: "16px",
            fontWeight: "700",
            borderBottom: "1px solid #dddddd",
            color: "#333333",
        },

        // Navigation
        sidebarNav: {
            padding: "15px 10px",
        },

        // Each Main Section
        sidebarSection: {
            marginBottom: "8px",
        },

        // Main Menu Link
        sidebarLink: {
            display: "block",
            padding: "20px 14px",
            color: "#333333",
            textDecoration: "none",
            fontSize: "15px",
            fontWeight: "600",
            borderRadius: "6px",
        },
    };

    // ======================================================== 
    // // While role is loading 
    // // ======================================================== 
    if (loading) { 
        return ( 
        <aside style={styles.sidebar}> 
            <div style={styles.sidebarTitle}> NAVIGATION </div> 
        </aside> 
        ); 
    }

    return (
        <aside style={styles.sidebar}>

            <div style={styles.sidebarTitle}>
                NAVIGATION
            </div>

            <nav style={styles.sidebarNav}>

                {filteredNavItems.map((item) => (

                    <div
                        key={item.label}
                        style={styles.sidebarSection}
                    >

                        <NavLink
                            to={item.path}
                            style={({ isActive }) => {

                                const active =
                                    isActive ||
                                    location.pathname.startsWith(item.basePath);

                                return {
                                    ...styles.sidebarLink,

                                    color: active
                                        ? "#2563eb"
                                        : "#333333",

                                    backgroundColor: active
                                        ? "#eff6ff"
                                        : "transparent",
                                };
                            }}
                        >
                            {item.label}
                        </NavLink>

                    </div>

                ))}

            </nav>

        </aside>
    );
}

