import { NextRequest, NextResponse } from "next/server";

type OrderItem = {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
};

type OrderData = {
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
  discount: number;
  totalAmount: number;
};

export async function POST(request: NextRequest) {
  try {
    const body: OrderData = await request.json();

    // Validate required fields
    if (!body.fullName || !body.phoneNumber || !body.email || !body.address || !body.cartItems?.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate order ID (in real app, this would come from database)
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Here you would typically save to database
    // For now, just return success response

    console.log("Order placed:", { orderId, ...body });

    return NextResponse.json({
      orderId,
      message: "Order placed successfully",
    });
  } catch (error) {
    console.error("Error placing order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}