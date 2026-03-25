'use client';

import { useState } from 'react';
import { CartItem } from '@/contexts/cart-context';
import { useCart } from '@/contexts/cart-context';
import { Trash2 } from 'lucide-react';
import ProductModal from './product-modal';
import { Product } from '@/type';

interface CartItemProps {
    item: CartItem;
    product?: Product;
}

export function CartItemComponent({ item, product }: CartItemProps) {
    const { removeFromCart } = useCart();
    const [editOpen, setEditOpen] = useState(false);

    return (
        <>
            <div className="flex gap-4 pb-4 border-b">
                {/* Image */}
                <div className="w-20 h-20 bg-gray-100 rounded shrink-0 overflow-hidden">
                    {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">Pizza image unavailable</div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    {item.size && (
                        <p className="text-sm text-gray-500">Cỡ: {item.size}</p>
                    )}
                    {(item.crustName || item.crust) && (
                        <p className="text-sm text-gray-500">Đế: {item.crustName || item.crust}</p>
                    )}
                    {product && (
                        <button
                            onClick={() => setEditOpen(true)}
                            className="text-sm text-yellow-500 font-medium mt-1 hover:underline"
                        >
                            Chỉnh sửa
                        </button>
                    )}
                </div>

                {/* Quantity & Price */}
                <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700 w-6 text-center">
                        {item.quantity}
                    </span>

                    <div className="text-right">
                        <p className="font-semibold text-gray-900 w-24">
                            {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                        </p>
                        <p className="text-xs text-gray-500">
                            {item.price.toLocaleString('vi-VN')} đ/cái
                        </p>
                    </div>

                    <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-yellow-500 hover:bg-yellow-50 rounded"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {product && (
                <ProductModal
                    product={product}
                    open={editOpen}
                    onClose={() => setEditOpen(false)}
                    editItem={{ size: item.size, crust: item.crust, quantity: item.quantity }}
                />
            )}
        </>
    );
}