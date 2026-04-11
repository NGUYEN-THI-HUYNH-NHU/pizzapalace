type SelectedOption = {
  k: string;
  v: string;
  sku: string;
  productId?: string;
  crustName?: string;
  crustSize?: string;
};

type OrderItem = {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  img?: string;
  size?: string;
  crust?: string;
  crustName?: string;
  selectedOptions: SelectedOption[];
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
  discount?: number;
  totalAmount: number;
};

type OrderResponse = {
  orderId: string;
  message: string;
};

const placeOrder = async (orderData: OrderData): Promise<OrderResponse> => {
  // Use relative path - browser will automatically use current origin
  const URL = '/api/orders';
  console.log('📤 Gửi request tới /api/orders:', JSON.stringify(orderData, null, 2));


  const res = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    console.error('❌ API trả về lỗi:', res.status, errorText);
    let parsedError = errorText;
    try {
      const errorJson = JSON.parse(errorText) as { error?: string; message?: string };
      parsedError = errorJson.error || errorJson.message || errorText;
    } catch {
      parsedError = errorText;
    }
    throw new Error(parsedError || `Failed to place order: ${res.status}`);
  }

  return res.json();
};

export default placeOrder;