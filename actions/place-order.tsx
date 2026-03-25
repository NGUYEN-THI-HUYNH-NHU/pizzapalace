type OrderItem = {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  img: string;
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

type OrderResponse = {
  orderId: string;
  message: string;
};

const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const URL = apiBase.endsWith("/api")
    ? `${apiBase}/orders`
    : `${apiBase}/api/orders`;

const placeOrder = async (orderData: OrderData): Promise<OrderResponse> => {
    if (!apiBase) {
        throw new Error("API base URL not configured");
    }

    const res = await fetch(URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
    });

    if (!res.ok) {
        throw new Error(`Failed to place order: ${res.status}`);
    }

    return res.json();
};

export default placeOrder;