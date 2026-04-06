'use client';

<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { CartItem } from '@/contexts/cart-context';
import { useCart } from '@/contexts/cart-context';
import getCrusts from '@/actions/get-crusts';
import { Trash2, Plus, Minus, Edit3 } from 'lucide-react';

interface CartItemProps {
    item: CartItem;
    onEdit?: () => void;
}

export function CartItemComponent({ item, onEdit }: CartItemProps) {
    const { updateQuantity, removeFromCart } = useCart();
    const [crustsMap, setCrustsMap] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchCrustNames = async () => {
            try {
                const data = await getCrusts();
                const map: Record<string, string> = {};
                data.forEach((crust) => {
                    map[crust.code] = crust.name;
                });
                setCrustsMap(map);
            } catch (error) {
                console.error('Failed to load crust names', error);
            }
        };

        fetchCrustNames();
    }, []);

    const crustLabel = item.crust ? crustsMap[item.crust] || item.crust : '';

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
                {item.size && (
                    <p className="text-sm text-gray-500">
                        {item.size}{item.crust ? ` • ${crustLabel}` : ''}
                    </p>
                )}
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
=======
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
>>>>>>> 93a5921e025f85ab8c30f1b281851981f4fa88cb
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

<<<<<<< HEAD
                {/* Edit Button */}
                {onEdit && (
                    <button
                        onClick={onEdit}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                        aria-label="Chỉnh sửa sản phẩm"
                    >
                        <Edit3 size={18} />
                    </button>
                )}

                {/* Delete Button */}
                <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                >
                    <Trash2 size={18} />
                </button>
=======
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
>>>>>>> 93a5921e025f85ab8c30f1b281851981f4fa88cb
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