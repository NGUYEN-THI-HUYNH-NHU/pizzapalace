'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import placeOrder from '@/actions/place-order';
import { useCart } from '@/contexts/cart-context';

type CartItem = {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  img: string;
  size?: string;
  crust?: string;
  crustName?: string;
};

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
};

const sessionUrl = '/api/auth/session';
const selectedCartItemsKey = 'pizzapalace-selected-cart-item-ids';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems: contextCartItems, clearCart } = useCart();
  const [note, setNote] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCartItemIds, setSelectedCartItemIds] = useState<string[] | null>(null);
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [appliedVoucher, setAppliedVoucher] = useState<string>('');
  const [voucherMessage, setVoucherMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const paymentOptions = [
    { id: 'cash', label: 'Tiền mặt', icon: 'https://cdn.pizzahut.vn/images/Web_V3/Payment/cash.png' },
    { id: 'zalopay', label: 'ZaloPay', icon: 'https://cdn.pizzahut.vn/images/Web_V3/Payment/ZaloPay_vuong.png' },
    { id: 'momo', label: 'Momo', icon: 'https://cdn.pizzahut.vn/images/Web_V3/Payment/momo.png' },
    { id: 'visa', label: 'ATM/VISA', icon: 'https://cdn.pizzahut.vn/images/Web_V3/Payment/visa.png' },
    { id: 'vnpay', label: 'VNPAY', icon: 'https://cdn.pizzahut.vn/images/Web_V3/Payment/vnpay.png' },
  ];

  // Load cart items from context
  useEffect(() => {
    let active = true;

    try {
      const storedSelection = localStorage.getItem(selectedCartItemsKey);
      queueMicrotask(() => {
        if (!active) return;

        if (storedSelection !== null) {
          try {
            const parsedSelection = JSON.parse(storedSelection);
            if (Array.isArray(parsedSelection)) {
              setSelectedCartItemIds(parsedSelection.map((itemId) => String(itemId)));
              return;
            }
          } catch (error) {
            console.warn('Lỗi load selected cart items:', error);
          }
        }

        setSelectedCartItemIds(null);
      });
    } catch (error) {
      console.warn('Lỗi load selected cart items:', error);
      queueMicrotask(() => {
        if (active) {
          setSelectedCartItemIds(null);
        }
      });
    }

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const normalizedItems: CartItem[] = contextCartItems.map((item: any) => ({
      id: String(item.id ?? ''),
      name: String(item.name ?? 'Sản phẩm'),
      sku: String(item.size ?? item.crust ?? ''),
      price: Number(item.price ?? 0),
      quantity: Number(item.quantity ?? 1),
      img: String(item.image ?? item.img ?? 'https://via.placeholder.com/64'),
      size: typeof item.size === 'string' ? item.size : undefined,
      crust: typeof item.crust === 'string' ? item.crust : undefined,
      crustName: typeof item.crustName === 'string' ? item.crustName : undefined,
    }));

    queueMicrotask(() => {
      if (!active) return;

      if (selectedCartItemIds === null) {
        setCartItems(normalizedItems);
        return;
      }

      setCartItems(normalizedItems.filter((item) => selectedCartItemIds.includes(item.id)));
    });

    return () => {
      active = false;
    };
  }, [contextCartItems, selectedCartItemIds]);

  // Load user session
  useEffect(() => {
    const loadSession = async () => {
      try {
        const session = await fetch(sessionUrl, { cache: 'no-store' });
        if (session.ok) {
          const user = (await session.json()) as SessionUser;
          setFullName(user.name ?? '');
          setEmail(user.email ?? '');
          setPhoneNumber(user.phone ?? '');
          setAddress(user.address ?? '');
        }
      } catch (error) {
        console.warn('Lỗi fetch session:', error);
      }

      // Load address from address modal if available
      try {
        const savedAddress = localStorage.getItem('pp_address');
        if (savedAddress) {
          const addressData = JSON.parse(savedAddress);
          if (addressData.address && addressData.address.trim()) {
            const fullAddress = addressData.city?.name && addressData.district?.name
              ? `${addressData.address}, ${addressData.district.name}, ${addressData.city.name}`
              : addressData.address;
            setAddress(fullAddress);
          }
        }
      } catch (error) {
        console.warn('Lỗi load address:', error);
      }

      setLoading(false);
    };
    loadSession();
  }, []);

  // Listen to address changes from address modal
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleAddressChange = (event: any) => {
      const addressData = event.detail;
      if (addressData.address && addressData.address.trim()) {
        const fullAddress = addressData.city?.name && addressData.district?.name
          ? `${addressData.address}, ${addressData.district.name}, ${addressData.city.name}`
          : addressData.address;
        setAddress(fullAddress);
      }
    };

    window.addEventListener('pp_address_changed', handleAddressChange);

    return () => {
      window.removeEventListener('pp_address_changed', handleAddressChange);
    };
  }, []);

  const subTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subTotal > 0 ? 15000 : 0;
  const totalAmount = Math.max(0, subTotal + shippingFee);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)));
  };

  const removeCartItem = (itemId: string) => setCartItems((prev) => prev.filter((item) => item.id !== itemId));

  const dedupeCartItems = (items: CartItem[]) => {
    const merged = new Map<string, CartItem>();

    items.forEach((item) => {
      const key = [item.id, item.sku, item.size ?? "", item.crust ?? "", item.crustName ?? "", item.price].join("|");
      const existing = merged.get(key);

      if (existing) {
        merged.set(key, {
          ...existing,
          quantity: existing.quantity + item.quantity,
        });
        return;
      }

      merged.set(key, { ...item });
    });

    return Array.from(merged.values());
  };

  const canPlaceOrder = Boolean(fullName && phoneNumber && email && address && agreedToTerms && cartItems.length > 0);

  const onPlaceOrder = async () => {
    if (!canPlaceOrder) return;

    try {
      const uniqueCartItems = dedupeCartItems(cartItems);

      const orderData = {
        fullName,
        phoneNumber,
        email,
        address,
        note,
        paymentMethod,
        cartItems: uniqueCartItems,
        subTotal: uniqueCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        shippingFee,
        totalAmount: Math.max(0, uniqueCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) + shippingFee),
      };

      console.log('📦 Gửi dữ liệu đặt hàng:', orderData);
      const response = await placeOrder(orderData);
      console.log('✅ Phản hồi từ server:', response);

      if (response?.orderId) {
        clearCart();
        setCartItems([]);
        localStorage.removeItem(selectedCartItemsKey);
        localStorage.removeItem('pizzapalace-cart');
        router.push(`/order-success/${response.orderId}`);
      } else {
        console.error('❌ Không nhận được orderId từ server');
        alert('Lỗi: Không nhận được mã đơn hàng từ server.');
      }
    } catch (error) {
      console.error('❌ Lỗi đặt hàng:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('📋 Chi tiết lỗi:', errorMessage);
      alert(`Có lỗi xảy ra khi đặt hàng: ${errorMessage}`);
    }
  };

  if (loading) {
    return (
      <main className="max-w-[1170px] mx-auto p-4 md:p-6 min-h-screen font-sans text-gray-800">
        <p>Đang tải dữ liệu...</p>
      </main>
    );
  }

  return (
    <main className="max-w-[1170px] mx-auto p-4 md:p-6 bg-gray-50 md:bg-white min-h-screen font-sans text-gray-800">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">

        {/* === CỘT TRÁI: Thông tin giao hàng & Thanh toán === */}
        <div className="w-full md:w-2/3 flex flex-col gap-4 md:gap-6">

          {/* 1. Giao Đến */}
          <div className="bg-white border-0 md:border md:border-gray-200 rounded-2xl p-4 md:p-6 shadow-sm md:shadow-none">
            <div className="flex justify-between items-center mb-6 cursor-pointer">
              <div>
                <h6 className="text-base md:text-xl font-semibold text-black">Giao đến</h6>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" className="text-gray-400">
                <path fill="currentColor" d="M8.822 19.116a.7.7 0 0 1-.45-.169.63.63 0 0 1 0-.9L14.278 12 8.372 5.981a.63.63 0 0 1 0-.9.63.63 0 0 1 .9 0l6.356 6.47a.63.63 0 0 1 0 .9l-6.356 6.468a.66.66 0 0 1-.45.197"></path>
              </svg>
            </div>

            <div className="flex flex-col gap-4">
              {/* Địa chỉ hiển thị */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Địa chỉ giao hàng</p>
                <p className="text-base font-medium text-black">{address || 'Chưa có địa chỉ'}</p>
              </div>

              {/* Ghi chú */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-black">Ghi chú</label>
                  <span className="text-sm text-gray-500 font-medium">{note.length}/200</span>
                </div>
                <input
                  type="text"
                  placeholder="Ghi chú cho giao hàng, ví dụ: tầng, phòng..."
                  maxLength={200}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none transition-colors"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              {/* Thời gian nhận */}
              <div>
                <label className="block text-sm font-medium mb-2 text-black">Thời gian nhận</label>
                <button type="button" className="w-full p-3 border border-gray-300 rounded-md flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <span className="text-base text-black font-normal">Ngay lập tức</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"><path fill="#637381" d="m2.296 5.154.005.004 5.35 5.225.35.343.35-.345 5.35-5.275.002-.002c.019-.019.036-.023.047-.023s.028.004.046.023l.352-.352-.352.352c.019.018.023.035.023.046s-.004.027-.022.046L8.05 10.843l-.003.004a.4.4 0 0 1-.06.052l-.017-.004a.2.2 0 0 1-.04-.023L2.203 5.246c-.018-.019-.022-.035-.022-.046s.004-.028.022-.046c.019-.019.036-.023.047-.023s.028.004.046.023Z"></path></svg>
                </button>
              </div>
            </div>
          </div>

          {/* 2. Người đặt hàng */}
          <div className="bg-white border-0 md:border md:border-gray-200 rounded-2xl p-4 md:p-6 shadow-sm md:shadow-none">
            <div className="mb-4 md:mb-6">
              <h6 className="text-base md:text-xl font-semibold text-black">Người đặt hàng</h6>
              <p className="text-sm text-gray-500 mt-1">Thông tin được dùng để tích lũy điểm thành viên</p>
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-black">Họ và tên</label>
                <input
                  type="text"
                  placeholder="Nhập đầy đủ họ tên của bạn"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none transition-colors"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-black">Số điện thoại</label>
                <div className="relative">
                  <span className="absolute left-0 top-0 bottom-0 w-[50px] flex items-center justify-center bg-gray-100 border border-gray-300 border-r-0 rounded-l-md text-sm text-black select-none pointer-events-none">+84</span>
                  <input
                    type="tel"
                    placeholder="Nhập số điện thoại của bạn"
                    className="w-full py-3 pr-3 pl-[65px] border border-gray-300 rounded-md focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none transition-colors"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-black">Email</label>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 3. Phương thức thanh toán */}
          <div className="bg-white border-0 md:border md:border-gray-200 rounded-2xl p-4 md:p-6 shadow-sm md:shadow-none">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h6 className="text-base md:text-xl font-semibold text-black">Phương thức thanh toán</h6>
              <div className="md:hidden flex items-center text-sm font-medium">
                Tiền mặt
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" className="ml-1"><path fill="#637381" d="M8.822 19.116a.7.7 0 0 1-.45-.169.63.63 0 0 1 0-.9L14.278 12 8.372 5.981a.63.63 0 0 1 0-.9.63.63 0 0 1 .9 0l6.356 6.47a.63.63 0 0 1 0 .9l-6.356 6.468a.66.66 0 0 1-.45.197"></path></svg>
              </div>
            </div>

            <div className="hidden md:flex flex-col gap-5">
              {paymentOptions.map((option) => (
                <label key={option.id} className="flex items-center gap-3 cursor-pointer select-none">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="radio"
                      name="payment"
                      value={option.id}
                      className="peer appearance-none w-5 h-5 border border-gray-300 rounded-full checked:border-red-600 checked:border-[5px] transition-all cursor-pointer"
                      checked={paymentMethod === option.id}
                      onChange={() => setPaymentMethod(option.id)}
                    />
                  </div>
                  <div className="flex items-center gap-4 ml-2">
                    <img src={option.icon} alt={option.label} className="w-9 h-9 object-contain" />
                    <span className="text-sm font-medium text-black">{option.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* === CỘT PHẢI: Khuyến mãi & Tổng kết === */}
        <div className="w-full md:w-1/3 flex flex-col gap-4 md:gap-6">

          {/* 4. Voucher */}
          <div className="bg-white border-0 md:border md:border-gray-200 rounded-2xl p-4 md:p-6 shadow-sm md:shadow-none">
            <div className="flex justify-between items-center mb-2">
              <h6 className="text-base md:text-xl font-semibold text-black">Voucher</h6>
            </div>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Mã voucher"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none transition-colors"
              />
              <button
                type="button"
                className="px-4 py-3 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
              >
                Áp dụng
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {voucherMessage || 'Nhập mã voucher để nhận ưu đãi'}
            </p>
            {appliedVoucher && (
              <p className="text-sm text-green-600">Đã áp dụng: {appliedVoucher}</p>
            )}
          </div>

          {/* 5. Giỏ hàng & Tạm tính */}
          <div className="bg-white border-0 md:border md:border-gray-200 rounded-2xl p-4 md:p-6 shadow-sm md:shadow-none">
            <div className="flex justify-between items-center cursor-pointer mb-1">
              <h6 className="text-base md:text-xl font-semibold text-black">Giỏ hàng của tôi</h6>
            </div>
            <p className="text-sm text-gray-600">Có {cartItems.length} sản phẩm trong giỏ hàng của bạn</p>
            <div className="w-full h-[1px] bg-gray-200 my-4"></div>

            <div className="flex flex-col gap-3 pb-4 text-black">
              {cartItems.length ? cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img src={item.img || 'https://via.placeholder.com/64'} alt={item.name} className="w-12 h-12 object-cover rounded" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.sku}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <button type="button" className="px-2 py-1 border rounded" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button type="button" className="px-2 py-1 border rounded" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      <button type="button" className="text-xs text-red-500" onClick={() => removeCartItem(item.id)}>Xoá</button>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">{(item.price * item.quantity).toLocaleString('vi-VN')} ₫</p>
                </div>
              )) : <p className="text-sm text-gray-500">Giỏ hàng trống.</p>}
            </div>

            <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
              <p className="text-sm font-medium">Tạm tính</p>
              <p className="text-sm md:text-base font-semibold">{subTotal.toLocaleString('vi-VN')} ₫</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">Phí giao hàng</p>
              <p className="text-sm md:text-base font-semibold">{shippingFee.toLocaleString('vi-VN')} ₫</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">Giảm giá thành viên</p>
              <p className="text-sm md:text-base font-semibold text-green-600">-0 ₫</p>
            </div>

            <div className="border-t border-gray-200 pt-4 flex justify-between items-end">
              <p className="font-medium text-black">Tổng cộng</p>
              <p className="text-xl md:text-3xl font-bold text-black">{totalAmount.toLocaleString('vi-VN')} ₫</p>
            </div>

            <div className="mt-2 text-sm text-gray-500 flex justify-end items-center gap-1">
              <span>Nhận</span>
              <span className="font-semibold text-black">{Math.max(0, Math.round(totalAmount / 10000))} điểm</span>
              <span>PizzaPalace rewards</span>
            </div>
          </div>

          {/* 6. Đồng ý điều khoản */}
          <div className="bg-white border-0 md:border md:border-gray-200 rounded-2xl p-4 md:p-6 shadow-sm md:shadow-none">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-5 h-5 mt-0.5 text-red-600 border-gray-300 rounded focus:ring-red-600"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
              <span className="text-sm text-black leading-relaxed font-normal">
                Tôi đồng ý với <a href="#" className="text-red-600 underline">các điều khoản và điều kiện</a> và tham gia <a href="#" className="text-red-600 underline">chương trình thành viên PizzaPalace Rewards</a> để tích điểm và hưởng quyền lợi theo quy định của chương trình.
              </span>
            </label>
          </div>

          {/* 7. Nút Đặt Hàng */}
          <div className="bg-white md:bg-transparent p-4 md:p-0">
            <button
              type="button"
              onClick={onPlaceOrder}
              className={`w-full py-3 rounded-lg font-medium text-white transition-colors flex items-center justify-center gap-2 ${canPlaceOrder
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : 'bg-gray-300 cursor-not-allowed pointer-events-none'
                }`}
              disabled={!canPlaceOrder}
            >
              <span className="text-base font-medium">Đặt hàng</span>
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}