import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = await params;

        const cookieStore = cookies();
        const axisToken = (await cookieStore).get('axisToken')?.value;

        // Use the id parameter in the API call
        const response = await fetch(`${process.env.BACKEND_API_URL}/coupons/sponsor/${id}`, {
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
                error: 'Failed to fetch coupons (sponsor)',
                message: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}