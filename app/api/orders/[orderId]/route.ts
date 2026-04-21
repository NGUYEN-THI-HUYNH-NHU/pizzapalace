import { NextRequest, NextResponse } from 'next/server';

import { getSessionUserFromCookie } from '@/lib/auth-session';

type PatchOrderPayload = {
    status?: string;
    isPaid?: boolean;
    cancelReason?: string;
};

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const sessionUser = await getSessionUserFromCookie();
        if (!sessionUser?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { orderId } = await params;
        const body = (await request.json().catch(() => null)) as PatchOrderPayload | null;

        if (!body) {
            return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
        }

        const upstreamResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            cache: 'no-store',
        });

        const payload = await upstreamResponse.json().catch(() => null);

        if (!upstreamResponse.ok) {
            return NextResponse.json(
                { message: payload?.message || `Khong the cap nhat don hang (upstream ${upstreamResponse.status}).` },
                { status: upstreamResponse.status }
            );
        }

        return NextResponse.json(payload, { status: 200 });
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ message: 'Khong the ket noi may chu don hang.' }, { status: 502 });
    }
}
