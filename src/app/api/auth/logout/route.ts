// MIGHT NOT NEED
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    // Clear the auth cookie
    (await cookies()).set({
        name: 'axisToken',
        value: '',
        expires: new Date(0),
        path: '/',
    });

    return NextResponse.json({ success: true });
}