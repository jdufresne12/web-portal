"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from 'js-cookie';

interface AuthContextType {
    isAuthenticated: boolean;
    currentUser: UserData | null;
    googleLogin: (token: string) => Promise<boolean>;
    logout: () => void;
    loading: boolean;
}

interface UserData {
    id: string;
    email: string;
    name?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Check authentication on component mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = () => {
        const authCookie = Cookies.get('isAuthenticated');
        const isAuth = authCookie === 'true';
        setIsAuthenticated(isAuth);

        if (isAuth) {
            const userData = localStorage.getItem('userData');
            if (userData) {
                setCurrentUser(JSON.parse(userData));
            }
        } else if (pathname !== "/login") {
            router.push("/login");
        }

        setLoading(false);
    };

    const googleLogin = async (token: string): Promise<boolean> => {
        setLoading(true);
        try {
            const response = await fetch('/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });

            const data = await response.json();

            if (!response.ok) {
                setLoading(false);
                return false;
            }

            // Update authentication state and user data
            setIsAuthenticated(true);
            setCurrentUser(data.user);

            // Store user data in localStorage
            localStorage.setItem('userData', JSON.stringify(data.user));

            // Navigate to home page
            router.push('/');

            setLoading(false);
            return true;
        } catch (error) {
            console.error('Google login error:', error);
            setLoading(false);
            return false;
        }
    };

    const logout = () => {
        // Clear the authentication cookies using client-side JavaScript
        Cookies.remove('isAuthenticated');

        // Expire Auth Token
        document.cookie = "axisToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // Clear user data from localStorage
        localStorage.removeItem('userData');

        setIsAuthenticated(false);
        setCurrentUser(null);

        router.push('/login');
    };

    const contextValue = {
        isAuthenticated,
        currentUser,
        googleLogin,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}