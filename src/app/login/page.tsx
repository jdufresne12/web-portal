"use client";

import { useState } from "react";
import { useAuth } from "@/src/app/contexts/AuthContext";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/src/lib/config/firebase";
import Image from "next/image";

export default function Login() {
    const [generalError, setGeneralError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { googleLogin } = useAuth();

    // Handle Google Sign-In with Firebase
    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setGeneralError("");

        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({
                prompt: 'select_account',
                access_type: 'offline'
            });
            const result = await signInWithPopup(auth, provider);

            // Get the Google credentials
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const googleIdToken = credential?.idToken;

            if (!googleIdToken) {
                setGeneralError("Failed to get Google authentication token");
                setIsLoading(false);
                return;
            }

            // Use the auth context to login
            const success = await googleLogin(googleIdToken);

            if (!success) {
                setGeneralError("Google sign-in failed");
            }
        } catch (err) {
            console.error("Google sign-in error:", err);
            setGeneralError("An error occurred during Google sign-in");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
            <div className="w-full max-w-md space-y-8 -mt-40">
                <div className="flex flex-col items-center">
                    <div className="size-50 mb-5">
                        <Image
                            src="/AxisLogo.jpg"
                            alt="Axis Logo"
                            width={200}
                            height={200}
                            className="rounded-full"
                        />
                    </div>
                    <h2 className="mt-4 text-center text-2xl font-bold text-white">
                        Sign in to Axis Sponsor Hub
                    </h2>
                </div>
                {generalError && (
                    <div className="text-red-500 text-sm text-center">{generalError}</div>
                )}

                <form className="mt-8 space-y-6">
                    {/* Google Sign-In Button */}
                    <div>
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full flex justify-center items-center bg-white text-gray-800 py-2 px-4 rounded hover:bg-gray-100 transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="mr-2">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                <path fill="none" d="M1 1h22v22H1z" />
                            </svg>
                            {isLoading ? "Signing in..." : "Sign in with Google"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}