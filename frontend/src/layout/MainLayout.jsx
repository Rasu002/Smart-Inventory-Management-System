import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout() {

    const styles = {
        layoutWrapper: {
            display: "flex",
            minHeight: "100vh",
            backgroundColor: "#f4f6f8",
        },

        mainContent: {
            marginLeft: "250px",
            width: "calc(100% - 250px)",
            minHeight: "100vh",
        },

        pageContainer: {
            padding: "30px",
        },
    };

    return (
        <div style={styles.layoutWrapper}>

            <Sidebar />

            <div style={styles.mainContent}>

                <Header />

                <main style={styles.pageContainer}>
                    <Outlet />
                </main>

            </div>

        </div>
    );
}