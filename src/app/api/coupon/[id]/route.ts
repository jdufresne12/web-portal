import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const cookieStore = cookies();
        const axisToken = (await cookieStore).get('axisToken')?.value;
        const id = (await params).id;

        const response = await fetch(`${process.env.BACKEND_API_URL}/coupon/${id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${axisToken}`,
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

        return NextResponse.json({});
    } catch (error) {
        console.error("API proxy error:", error);
        return NextResponse.json(
            {
                error: 'Failed to delete coupon',
                message: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}