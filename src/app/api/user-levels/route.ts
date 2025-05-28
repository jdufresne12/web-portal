import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const cookieStore = cookies();
        const axisToken = (await cookieStore).get('axisToken')?.value;

        const response = await fetch(`${process.env.BACKEND_API_URL}/user-levels`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${axisToken}`
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("External API error:", response.status, errorText);
            return NextResponse.json(
                { error: `External API error: ${response.status}`, details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("API proxy error:", error);
        return NextResponse.json(
            {
                error: 'Failed to fetch user levels',
                message: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}