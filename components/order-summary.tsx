'use client';

import { useCart } from '@/contexts/cart-context';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface OrderSummaryProps {
    discountPercentage?: number;
    shippingFee?: number;
}

export function OrderSummary({
    discountPercentage = 0,
    shippingFee = 0,
}: OrderSummaryProps) {
    const { getTotalPrice, cartItems } = useCart();
    const subtotal = getTotalPrice();
    const discount = Math.round((subtotal * discountPercentage) / 100);
    const total = subtotal - discount + shippingFee;

    return (
        <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
            {/* Voucher Section */}
            <div className="mb-6 border-b pb-6">
                <div className="flex items-center justify-between cursor-pointer hover:text-red-500">
                    <div>
                        <h3 className="font-semibold text-gray-900">Voucher</h3>
                        <p className="text-sm text-red-500">Nhập hoặc chọn voucher của bạn</p>
                    </div>
                    <ChevronRight size={20} />
                </div>
            </div>

            {/* Promotion Section */}
            <div className="mb-6 border-b pb-6">
                <div className="flex items-center justify-between cursor-pointer hover:text-red-500">
                    <div>
                        <h3 className="font-semibold text-gray-900">Muỗng nĩa nhựa</h3>
                        <p className="text-sm text-gray-500">Không</p>
                    </div>
                    <ChevronRight size={20} />
                </div>
            </div>

            {/* Summary Details */}
            <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="font-semibold">
                        {subtotal.toLocaleString('vi-VN')} đ
                    </span>
                </div>

                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                        Giảm giá thành viên
                        <span className="text-xs block">
                            {discountPercentage > 0
                                ? `(-${discountPercentage}%)`
                                : ''}
                        </span>
                    </span>
                    <span className="font-semibold text-green-600">
                        -{discount.toLocaleString('vi-VN')} đ
                    </span>
                </div>

                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí giao hàng</span>
                    <span className="font-semibold">
                        {shippingFee.toLocaleString('vi-VN')} đ
                    </span>
                </div>
            </div>

            {/* Total */}
            <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-semibold text-gray-900">Tổng cộng</h4>
                        <p className="text-xs text-gray-500">
                            Nhận {Math.floor(total / 1000)} điểm Hut rewards
                        </p>
                    </div>
                    <span className="text-xl font-bold text-red-500">
                        {total.toLocaleString('vi-VN')} đ
                    </span>
                </div>
            </div>

            {/* Checkout Button */}
            <Link
                href="/checkout"
                className={`block text-center w-full py-3 rounded-lg font-semibold text-white transition ${cartItems.length === 0
                        ? 'bg-gray-400 cursor-not-allowed pointer-events-none'
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
            >
                {cartItems.length === 0 ? 'Giỏ hàng trống' : 'Thanh Toán'}
            </Link>
        </div>
    );
}
