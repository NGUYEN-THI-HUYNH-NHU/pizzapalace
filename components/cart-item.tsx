'use client';

import { CartItem } from '@/contexts/cart-context';
import { useCart } from '@/contexts/cart-context';
import { Trash2, Plus, Minus } from 'lucide-react';

interface CartItemProps {
    item: CartItem;
}

export function CartItemComponent({ item }: CartItemProps) {
    const { updateQuantity, removeFromCart } = useCart();

    return (
        <div className="flex gap-4 pb-4 border-b">
            {/* Product Image */}
            <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                {item.image ? (
                    <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🍕</div>
                )}
            </div>

            {/* Product Info */}
            <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                {item.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                )}
            </div>

            {/* Quantity & Price */}
            <div className="flex items-center gap-3">
                {/* Quantity Controller */}
                <div className="flex items-center border rounded-md">
                    <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-100"
                    >
                        <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-100"
                    >
                        <Plus size={16} />
                    </button>
                </div>

                {/* Price */}
                <div className="text-right">
                    <p className="font-semibold text-gray-900 w-20">
                        {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                    </p>
                    <p className="text-xs text-gray-500">
                        {item.price.toLocaleString('vi-VN')} đ/cái
                    </p>
                </div>

                {/* Delete Button */}
                <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}
