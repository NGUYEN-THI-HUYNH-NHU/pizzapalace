'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/cart-context';
import { CartItemComponent } from '@/components/cart-item';
import { OrderSummary } from '@/components/order-summary';
import { ArrowLeft } from 'lucide-react';
import { Product } from '@/type';

export default function CartPage() {
  const router = useRouter();
  const { cartItems } = useCart();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/pizzas').then(r => r.json()).catch(() => []),
      fetch('/api/beverages').then(r => r.json()).catch(() => []),
      fetch('/api/combos').then(r => r.json()).catch(() => []),
    ]).then(([pizzas, beverages, combos]) => {
      setProducts([...pizzas, ...beverages, ...combos]);
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Giỏ hàng của tôi</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 mt-10">
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
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Có {cartItems.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm trong giỏ hàng của bạn
                  </h2>
                </div>

                <div className="space-y-4 mb-8">
                  {cartItems.map((item) => (
                    <CartItemComponent
                      key={item.id}
                      item={item}
                      product={products.find((p) => p.id === item.productId)}
                    />
                  ))}
                </div>
              </div>
              <div className="lg:col-span-1">
                <OrderSummary discountPercentage={0} shippingFee={0} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}