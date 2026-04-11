import { NextRequest, NextResponse } from "next/server";
import { getSessionUserFromCookie } from "@/lib/auth-session";
import { OrderItem } from "@/type";

type OrderData = {
  userId?: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  note: string;
  paymentMethod: string;
  cartItems: OrderItem[];
  voucherCode?: string;
  subTotal: number;
  shippingFee: number;
  discount?: number;
  totalAmount: number;
};

export async function GET() {
  try {
    const sessionUser = await getSessionUserFromCookie();

    if (!sessionUser?.id) {
      return NextResponse.json({ orders: [] }, { status: 200 });
    }

    const upstreamResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders?userId=${encodeURIComponent(sessionUser.id)}`, {
      method: "GET",
      cache: "no-store",
    });

    const payload = await upstreamResponse.json().catch(() => ({ orders: [] }));

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        { message: payload?.message || `Khong the lay danh sach don hang (upstream ${upstreamResponse.status}).` },
        { status: upstreamResponse.status }
      );
    }

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Khong the ket noi may chu don hang." },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: OrderData = await request.json();
    const sessionUser = await getSessionUserFromCookie();

    // Validate required fields
    if (!body.fullName || !body.phoneNumber || !body.email || !body.address || !body.cartItems?.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const payloadToUpstream: OrderData = {
      ...body,
      userId: sessionUser?.id,
    };

    const upstreamResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payloadToUpstream),
      cache: "no-store",
    });

    const payload = await upstreamResponse.json().catch(() => null);

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        { error: payload?.error || payload?.message || `Failed to place order: ${upstreamResponse.status}` },
        { status: upstreamResponse.status }
      );
    }

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error("Error placing order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}