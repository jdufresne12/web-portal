import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function PUT(request: NextRequest) {
    try {
        const cookieStore = cookies();
        const axisToken = (await cookieStore).get('axisToken')?.value;
        const requestBody = await request.json();

        const response = await fetch(`${process.env.BACKEND_API_URL}/product`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${axisToken}`,
            },
            body: requestBody
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("External API error:", response.status, errorText);
            return NextResponse.json(
                { error: `External API error: ${response.status}`, details: errorText },
                { status: response.status }
            );
        }

        return NextResponse.json({});
    } catch (error) {
        console.error("API proxy error:", error);
        return NextResponse.json(
            {
                error: 'Failed to add/update sponsor (product)',
                message: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}