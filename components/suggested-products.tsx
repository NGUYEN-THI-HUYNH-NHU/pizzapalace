'use client';

import { useCart } from '@/contexts/cart-context';
import { CartItem } from '@/contexts/cart-context';
import { Plus } from 'lucide-react';

interface SuggestedProductsProps {
  products: Omit<CartItem, 'quantity'>[];
  title?: string;
}

export function SuggestedProducts({
  products,
  title = 'Bạn sẽ thích',
}: SuggestedProductsProps) {
  const { addToCart } = useCart();

  if (products.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="shrink-0 w-48 border rounded-lg p-4 hover:shadow-md transition"
          >
            {/* Product Image */}
            <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center text-4xl mb-3">
              {product.image}
            </div>

            {/* Product Info */}
            <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2">
              {product.name}
            </h4>
            <p className="text-xs text-gray-500 line-clamp-2 mb-3">
              {product.description}
            </p>

            {/* Footer: Price & Button */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <span className="font-semibold text-sm">
                {product.price.toLocaleString('vi-VN')} đ
              </span>
              <button
                onClick={() => addToCart(product)}
                className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
