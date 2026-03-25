'use client';

import { useEffect, useMemo, useState } from "react";
import { Product, PizzaVariant } from "@/type";
import { X, Minus, Plus } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import toast from "react-hot-toast";

type ProductModalProps = {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  editItem?: { size?: string; crust?: string; quantity: number };
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);

export default function ProductModal({ product, open, onClose, editItem }: ProductModalProps) {
  const { addToCart, removeFromCart } = useCart();

  const sizes = product?.pizzaDetails?.sizes || [];
  const crusts = product?.pizzaDetails?.crusts || [];

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedCrust, setSelectedCrust] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setSelectedSize(editItem?.size || product.pizzaDetails?.sizes?.[0] || "");
      setSelectedCrust(editItem?.crust || product.pizzaDetails?.crusts?.[0] || "");
      setQuantity(editItem?.quantity || 1);
    }
  }, [product, editItem]);

  const selectedVariant: PizzaVariant | undefined = useMemo(() => {
    if (!product?.pizzaDetails?.variants) return undefined;

    return product.pizzaDetails.variants.find(
      (v) => v.size === selectedSize && v.crust === selectedCrust && v.isAvailable
    );
  }, [product, selectedSize, selectedCrust]);

  const finalPrice = selectedVariant?.price || product?.price || 0;
  const totalPrice = finalPrice * quantity;

  if (!open || !product) return null;

  const handleAddToCart = () => {
    // Nếu đang edit thì xóa item cũ trước
    if (editItem) {
      removeFromCart(product!.id);
    }

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product!.id,
        name: product!.name,
        price: finalPrice,
        image: product!.img || "🍕",
        description: product!.desc,
        size: selectedSize || undefined,
        crust: selectedCrust || undefined,
      });
    }

    toast.success(`${product!.name} đã được cập nhật!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
  <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-xl">
    <button
      type="button"
      onClick={onClose}
      className="absolute right-3 top-3 rounded-full p-2 text-gray-500 hover:bg-gray-100"
    >
      <X className="h-4 w-4" />
    </button>

    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
      {/* IMAGE */}
      <div className="overflow-hidden rounded-xl bg-gray-100">
        {product.img ? (
          <div
            className="min-h-[220px] w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${product.img})` }}
          />
        ) : (
          <div className="flex min-h-[220px] items-center justify-center text-4xl">
            🍕
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex flex-col">
        <h2 className="text-xl font-bold text-gray-800">{product.name}</h2>
        <p className="mt-1 text-xs text-gray-600">{product.desc}</p>

        {/* SIZE */}
        {sizes.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 text-xs font-semibold text-gray-700">Kích thước</h3>
            <div className="grid grid-cols-3 gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-lg border px-3 py-1 text-xs ${
                    selectedSize === size
                      ? "bg-red-600 text-white"
                      : "border-gray-300"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CRUST */}
        {crusts.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 text-xs font-semibold text-gray-700">Đế bánh</h3>
            <div className="space-y-2">
              {crusts.map((crust) => {
                const variantAvailable = product.pizzaDetails?.variants?.some(
                  (v) => v.size === selectedSize && v.crust === crust && v.isAvailable
                );

                const variantPrice =
                  product.pizzaDetails?.variants?.find(
                    (v) => v.size === selectedSize && v.crust === crust && v.isAvailable
                  )?.price || product.price;

                return (
                  <button
                    key={crust}
                    onClick={() => setSelectedCrust(crust)}
                    disabled={!variantAvailable}
                    className={`flex w-full justify-between rounded-lg border px-3 py-2 text-xs ${
                      selectedCrust === crust ? "border-red-500 bg-red-50" : ""
                    } ${!variantAvailable ? "opacity-50" : ""}`}
                  >
                    <span>{crust}</span>
                    <span>{variantAvailable ? formatPrice(variantPrice) : "Hết"}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* QUANTITY */}
        <div className="mt-4 flex items-center gap-2">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
          <span className="text-sm">{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)}>+</button>
        </div>

        {/* BUTTON */}
        <div className="mt-4">
          <button
            onClick={handleAddToCart}
            className="w-full rounded-lg bg-red-600 py-3 text-sm font-semibold text-white"
          >
            Thêm - {formatPrice(totalPrice)}
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
  );
}