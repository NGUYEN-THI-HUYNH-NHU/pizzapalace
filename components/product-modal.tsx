'use client';

import { useEffect, useMemo, useState } from "react";
import { Product, PizzaVariant } from "@/type";
import { X } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import toast from "react-hot-toast";
import Tag from "./ui/tag";
import { currencyFormatter } from "@/lib/utils";

type ProductModalProps = {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  editItem?: { size?: string; crust?: string; quantity: number };
  isEditing: boolean;
};

export default function ProductModal({ product, open, onClose, editItem, isEditing }: ProductModalProps) {
  const { addToCart, removeFromCart } = useCart();

  const sizes = product?.pizzaDetails?.sizes || [];
  const variants = useMemo(() => product?.pizzaDetails?.variants || [], [product]);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedCrust, setSelectedCrust] = useState("");
  const [quantity, setQuantity] = useState(1);

  const crustOptions = useMemo(() => {
    const map = new Map<string, { code: string; name: string; price: number; isAvailable: boolean }>();

    variants
      .filter((variant) => variant.size === selectedSize)
      .forEach((variant) => {
        map.set(variant.crust, {
          code: variant.crust,
          name: variant.crustName || variant.crust,
          price: variant.price,
          isAvailable: variant.isAvailable,
        });
      });

    return Array.from(map.values());
  }, [variants, selectedSize]);

  useEffect(() => {
    if (!product) {
      return;
    }

    const defaultSize = editItem?.size || product.pizzaDetails?.sizes?.[0] || variants[0]?.size || "";
    const defaultCrust = editItem?.crust
      || variants.find((variant) => variant.size === defaultSize && variant.isAvailable)?.crust
      || variants.find((variant) => variant.size === defaultSize)?.crust
      || "";

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedSize(defaultSize);
    setSelectedCrust(defaultCrust);
    setQuantity(editItem?.quantity || 1);
  }, [product, editItem, variants]);

  useEffect(() => {
    if (crustOptions.length === 0) {
      return;
    }

    const stillValid = crustOptions.some((option) => option.code === selectedCrust);
    if (stillValid) {
      return;
    }

    const fallbackCrust = crustOptions.find((option) => option.isAvailable)?.code || crustOptions[0]?.code || "";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedCrust(fallbackCrust);
  }, [crustOptions, selectedCrust]);

  const selectedVariant: PizzaVariant | undefined = useMemo(() => {
    if (!variants.length) return undefined;

    return variants.find(
      (v) =>
        v.size === selectedSize &&
        v.crust === selectedCrust &&
        v.isAvailable
    );
  }, [variants, selectedSize, selectedCrust]);

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
        productId: product!.id,
        name: product!.name,
        price: finalPrice,
        image: product!.img,
        description: product!.desc,
        size: selectedSize || undefined,
        crust: selectedCrust || undefined,
        crustName: selectedVariant?.crustName || selectedCrust || undefined,
      });
    }

    toast.success(`${product!.name} đã được thêm vào giỏ hàng!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative h-[80vh] w-[70vw] max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full p-2 text-gray-500 hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex h-full flex-col md:flex-row">
          {/* IMAGE */}
          <div className="order-1 h-72 overflow-hidden bg-white md:h-full md:basis-[38%] md:shrink-0">
            {product.img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.img}
                alt={product.name}
                className="h-full w-[220%] max-w-none -translate-x-1/2 object-cover object-right"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-5xl">Image unavailable</div>
            )}
          </div>

          {/* CONTENT */}
          <div className="order-2 flex h-full min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto p-5 md:p-8">
              <h2 className="text-2xl font-bold text-gray-800 md:text-3xl">{product.name}</h2>
              <p className="mt-2 text-sm text-gray-600">{product.desc}</p>

              {product.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Tag key={tag.code} name={tag.name} color={tag.color} />
                  ))}
                </div>
              )}

              {/* SIZE */}
              {sizes.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-2 text-base font-semibold text-gray-700">Kích thước</h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`rounded-lg border px-3 py-2 text-sm ${selectedSize === size
                          ? "bg-yellow-500 text-white"
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
              {crustOptions.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-2 text-base font-semibold text-gray-700">Đế bánh</h3>
                  <div className="space-y-2">
                    {crustOptions.map((option) => {
                      return (
                        <button
                          key={option.code}
                          onClick={() => setSelectedCrust(option.code)}
                          disabled={!option.isAvailable}
                          className={`flex w-full justify-between rounded-lg border px-3 py-2 text-sm ${selectedCrust === option.code ? "border-yellow-500 bg-yellow-50" : ""
                            } ${!option.isAvailable ? "opacity-50" : ""}`}
                        >
                          <span>{option.name} ({selectedSize})</span>
                          <span>{option.isAvailable ? currencyFormatter.format(option.price) : "Hết"}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="border rounded-2xl mx-2 mb-2 bg-white p-4 md:p-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-11 w-11 rounded-lg border border-gray-300 text-lg font-semibold text-yellow-500"
                >
                  -
                </button>
                <span className="w-8 text-center text-base font-medium">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-11 w-11 rounded-lg border border-gray-300 text-lg font-semibold text-yellow-500"
                >
                  +
                </button>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="ml-auto w-full max-w-md rounded-lg bg-yellow-500 py-3 text-sm font-semibold text-white"
                >
                  {isEditing ? `Cập nhật giỏ hàng - ${currencyFormatter.format(totalPrice)}` : `Thêm vào giỏ hàng - ${currencyFormatter.format(totalPrice)}`}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}