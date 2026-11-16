import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);

    // Initially true: wait until authentication is checked
    const [loading, setLoading] = useState(true);

    // =========================================================
    // Get logged-in user from backend
    // =========================================================

    const login = useCallback(async () => {

        setLoading(true);

        try {

            const res = await fetch(
                "http://localhost:8000/auth/me",
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            if (!res.ok) {
                setUser(null);
                return false;
            }

            const data = await res.json();

            setUser(data);

            return true;

        } catch (error) {

            console.error("Failed to get user:", error);

            setUser(null);

            return false;

        } finally {

            setLoading(false);
        }

    }, []);

    // =========================================================
    // IMPORTANT: Check authentication when app starts/reloads
    // =========================================================

    useEffect(() => {
        login();
    }, [login]);

    // =========================================================
    // Logout
    // =========================================================

    const logout = async () => {

        try {

            await fetch(
                "http://localhost:8000/auth/logout",
                {
                    method: "POST",
                    credentials: "include",
                }
            );

        } catch (error) {

            console.error("Logout failed:", error);

        } finally {

            setUser(null);
        }
    };

    // =========================================================
    // Share authentication data with components
    // =========================================================

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
