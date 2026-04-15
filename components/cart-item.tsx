'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CartItem } from '@/contexts/cart-context';
import { useCart } from '@/contexts/cart-context';
import { Trash2 } from 'lucide-react';
import ProductModal from './product-modal';
import { Product, Category } from '@/type';

interface CartItemProps {
    item: CartItem;
    checked: boolean;
    onCheckedChange: (itemId: string, checked: boolean) => void;
    product?: Product;
}

export function CartItemComponent({ item, checked, onCheckedChange, product }: CartItemProps) {
    const router = useRouter();
    const { removeFromCart, updateQuantity } = useCart();
    const [editOpen, setEditOpen] = useState(false);

    const handleEditClick = () => {
        if (product?.category === Category.COMBO) {
            if (item.selectedOptions) {
                localStorage.setItem(`combo-edit-${item.productId}`, JSON.stringify(item.selectedOptions));
            }
            router.push(`/combo/${item.productId}?quantity=${item.quantity}`);
        } else {
            setEditOpen(true);
        }
    };

    return (
        <div className={`flex flex-col gap-4 rounded-2xl border p-4 transition ${checked ? 'border-yellow-500 bg-yellow-50/40' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-start gap-3">
                <label htmlFor="" className='py-1'>
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => onCheckedChange(item.id, event.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                    />
                </label>

                <div className="h-21 w-21 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-center text-xs text-gray-500">Pizza image unavailable</div>
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    {item.size && <p className="text-sm text-gray-500">Cỡ: {item.size}</p>}
                    {(item.crustName || item.crust) && (
                        <p className="text-sm text-gray-500">Đế: {item.crustName || item.crust}</p>
                    )}
                    {product && (
                        <button
                            onClick={handleEditClick}
                            className="text-sm text-yellow-500 font-medium mt-1 hover:underline"
                        >
                            Chỉnh sửa
                        </button>
                    )}
                </div>

                <div className="text-right">
                    <p className="font-semibold text-gray-900">
                        {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                    </p>
                    <p className="text-xs text-gray-500">
                        {item.price.toLocaleString('vi-VN')} đ/cái
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center mt-2 rounded-xl border border-gray-200 bg-white">
                            <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="h-9 w-9 rounded-l-xl text-lg font-semibold text-gray-700 hover:bg-gray-100"
                                aria-label="Giảm số lượng"
                            >
                                -
                            </button>
                            <span className="min-w-8 px-2 text-center text-sm font-semibold text-gray-900">
                                {item.quantity}
                            </span>
                            <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="h-9 w-9 rounded-r-xl text-lg font-semibold text-gray-700 hover:bg-gray-100"
                                aria-label="Tăng số lượng"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="inline-flex items-center gap-2 rounded-xl text-yellow-600 hover:bg-yellow-100 px-1 py-1"
                >
                    <Trash2 className='w-4 h-4' />
                </button>
            </div>

            {product && product.category !== Category.COMBO && (
                <ProductModal
                    product={product}
                    open={editOpen}
                    onClose={() => setEditOpen(false)}
                    editItem={{ size: item.size, crust: item.crust, quantity: item.quantity }}
                    isEditing={true}
                />
            )}
        </div>
    );
}