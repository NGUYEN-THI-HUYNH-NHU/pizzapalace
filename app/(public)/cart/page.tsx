'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/cart-context';
import { CartItemComponent } from '@/components/cart-item';
import { OrderSummary } from '@/components/order-summary';
import { Product } from '@/type';

const SELECTED_CART_ITEMS_KEY = 'pizzapalace-selected-cart-item-ids';

export default function CartPage() {
  const { cartItems } = useCart();
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const hasInitializedSelection = useRef(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/pizzas').then(r => r.json()).catch(() => []),
      fetch('/api/beverages').then(r => r.json()).catch(() => []),
      fetch('/api/combos').then(r => r.json()).catch(() => []),
    ]).then(([pizzas, beverages, combos]) => {
      setProducts([...pizzas, ...beverages, ...combos]);
    });
  }, []);

  useEffect(() => {
    if (cartItems.length === 0) {
      if (hasInitializedSelection.current) {
        localStorage.removeItem(SELECTED_CART_ITEMS_KEY);
      }
      return;
    }

    const savedSelection = localStorage.getItem(SELECTED_CART_ITEMS_KEY);
    if (savedSelection) {
      try {
        const parsedSelection = JSON.parse(savedSelection);
        if (Array.isArray(parsedSelection)) {
          const nextSelection = parsedSelection
            .map((itemId) => String(itemId))
            .filter((itemId) => cartItems.some((item) => item.id === itemId));

          queueMicrotask(() => {
            if (!hasInitializedSelection.current) {
              hasInitializedSelection.current = true;
            }

            setSelectedItemIds(nextSelection);
          });
          return;
        }
      } catch {
        // Fall through to selecting everything.
      }
    }

    const defaultSelection = cartItems.map((item) => item.id);
    queueMicrotask(() => {
      if (!hasInitializedSelection.current) {
        hasInitializedSelection.current = true;
      }

      setSelectedItemIds(defaultSelection);
    });
  }, [cartItems]);

  useEffect(() => {
    if (!hasInitializedSelection.current) {
      return;
    }

    localStorage.setItem(SELECTED_CART_ITEMS_KEY, JSON.stringify(selectedItemIds));
  }, [selectedItemIds]);

  const selectedItems = useMemo(
    () => cartItems.filter((item) => selectedItemIds.includes(item.id)),
    [cartItems, selectedItemIds]
  );

  const selectedSubtotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.quantity * item.price, 0),
    [selectedItems]
  );

  const allSelected = cartItems.length > 0 && selectedItemIds.length === cartItems.length;

  const toggleItem = (itemId: string, checked: boolean) => {
    setSelectedItemIds((current) => {
      if (checked) {
        return current.includes(itemId) ? current : [...current, itemId];
      }

      return current.filter((selectedId) => selectedId !== itemId);
    });
  };

  const toggleAll = (checked: boolean) => {
    setSelectedItemIds(checked ? cartItems.map((item) => item.id) : []);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Giỏ hàng trống</h2>
            <p className="text-gray-500 mb-8">Hãy thêm một số sản phẩm vào giỏ hàng của bạn</p>
            <Link href="/" className="inline-block bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition">
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="mb-6 space-y-4">
                  <div className="flex items-center justify-between gap-3 rounded-2xl py-3">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Có {cartItems.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm trong giỏ hàng
                      </h2>
                      <p className="text-sm text-gray-500">
                        Đã chọn {selectedItems.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm để thanh toán
                      </p>
                    </div>

                    <label className="inline-flex items-center gap-2 rounded-xl bg-white py-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(event) => toggleAll(event.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                      />
                      Chọn tất cả
                    </label>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {cartItems.map((item) => (
                    <CartItemComponent
                      key={item.id}
                      item={item}
                      product={products.find((p) => p.id === item.productId)}
                      checked={selectedItemIds.includes(item.id)}
                      onCheckedChange={toggleItem}
                    />
                  ))}
                </div>
              </div>
              <div className="lg:col-span-1">
                <OrderSummary
                  discountPercentage={0}
                  shippingFee={0}
                  subtotal={selectedSubtotal}
                  itemCount={selectedItems.length}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}