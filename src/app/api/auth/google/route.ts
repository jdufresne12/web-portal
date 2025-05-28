import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { token } = body;

        const response = await fetch(`${process.env.BACKEND_API_URL}/sign-in/google`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({}),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { success: false, error: errorData.reason || "Authentication failed" },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Set HTTP-only cookie with the axisToken
        (await cookies()).set({
            name: 'axisToken',
            value: data.axisToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });

        // Set client-accessible authentication cookie
        (await cookies()).set({
            name: 'isAuthenticated',
            value: 'true',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });

        // Return user data
        return NextResponse.json({
            success: true,
            user: {
                id: data.userID,
                email: data.email,
                name: data.name,
                givenName: data.givenName,
                familyName: data.familyName,
                picture: data.picture,
            }
        });
    } catch (error) {
        console.error('Google authentication error:', error);
        return NextResponse.json(
            { success: false, error: "Failed to authenticate with Google" },
            { status: 500 }
        );
    }
}