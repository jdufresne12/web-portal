"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import { ReactNode, useEffect } from "react";
import { useAuth } from "./contexts/AuthContext";
import { useRouter } from "next/navigation";

interface LayoutWrapperProps {
    children: ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
    const { isAuthenticated, loading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const isLoginPage = pathname === "/login";

    // Add this effect to handle redirects on the client side
    useEffect(() => {
        if (!loading && !isAuthenticated && !isLoginPage) {
            router.replace("/login");
        } else if (!loading && isAuthenticated && isLoginPage) {
            router.replace("/");
        }
    }, [isAuthenticated, loading, isLoginPage, router]);

    // Show loading state for ALL pages while authentication is being determined
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-900">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-4 border-gray-700 border-t-[#C8A560]"></div>
            </div>
        );
    }

    // Only render the actual content when authentication check is complete
    // AND the user is authenticated (or on login page)
    if (!isAuthenticated && !isLoginPage) {
        return null; // Return nothing while redirecting
    }

    return (
        <>
            {!isLoginPage && <Header />}
            {children}
            {!isLoginPage && <Footer />}
        </>
    );
}