'use client';

import { useEffect, useMemo, useState } from "react";
import { Product, PizzaVariant } from "@/type";
import { X } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import toast from "react-hot-toast";
import Tag from "./ui/tag";
import { currencyFormatter } from "@/lib/utils";

type ComboSelection = {
  productId: string;
  productName: string;
  image: string;
  size?: string;
  crust?: string;
  crustName?: string;
  sku?: string;
  extraPrice: number;
};

type ComboConfig = {
  requiredSize?: string;
  hasExistingSelection?: boolean;
  onConfirm: (selection: ComboSelection) => void;
};

type ProductModalProps = {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  editItem?: { size?: string; crust?: string; quantity: number };
  isEditing: boolean;
  comboConfig?: ComboConfig;
};

export default function ProductModal({ product, open, onClose, editItem, isEditing, comboConfig }: ProductModalProps) {
  const { addToCart, removeFromCart } = useCart();
  const isComboMode = Boolean(comboConfig);

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

    const requiredSize = comboConfig?.requiredSize;
    const defaultSize = requiredSize || editItem?.size || product.pizzaDetails?.sizes?.[0] || variants[0]?.size || "";
    const defaultCrust = editItem?.crust
      || variants.find((variant) => variant.size === defaultSize && variant.isAvailable)?.crust
      || variants.find((variant) => variant.size === defaultSize)?.crust
      || "";

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedSize(defaultSize);
    setSelectedCrust(defaultCrust);
    setQuantity(isComboMode ? 1 : editItem?.quantity || 1);
  }, [product, editItem, variants, comboConfig?.requiredSize, isComboMode]);

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

  const lowestCrustPrice = useMemo(() => {
    if (!isComboMode || !selectedSize) {
      return 0;
    }

    const prices = variants
      .filter((variant) => variant.size === selectedSize && variant.isAvailable)
      .map((variant) => variant.price);

    if (prices.length === 0) {
      return 0;
    }

    return Math.min(...prices);
  }, [isComboMode, selectedSize, variants]);

  const finalPrice = isComboMode
    ? Math.max(0, (selectedVariant?.price || 0) - lowestCrustPrice)
    : selectedVariant?.price || product?.price || 0;
  const totalPrice = finalPrice * quantity;

  if (!open || !product) return null;

  const handleAddToCart = () => {
    if (comboConfig) {
      comboConfig.onConfirm({
        productId: product.id,
        productName: product.name,
        image: product.img,
        size: selectedSize || undefined,
        crust: selectedCrust || undefined,
        crustName: selectedVariant?.crustName || selectedCrust || undefined,
        sku: selectedVariant?.sku,
        extraPrice: finalPrice,
      });
      onClose();
      return;
    }

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
          <div className="order-2 flex h-full min-h-0 flex-1 flex-col px-5 md:px-8">
            <div className="flex-1 overflow-y-auto">
              <h2 className="text-2xl py-2 font-bold text-gray-800 md:text-3xl">{product.name}</h2>
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
                  {comboConfig?.requiredSize ? (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      <button
                        className="rounded-lg border px-3 py-2 text-sm bg-yellow-500 text-white"
                        disabled={true}
                      >
                        {comboConfig.requiredSize}
                      </button>
                    </div>
                  ) : (
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
                  )}
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
                          <span>
                            {!option.isAvailable
                              ? "Hết"
                              : isComboMode
                                ? currencyFormatter.format(Math.max(0, option.price - lowestCrustPrice))
                                : currencyFormatter.format(option.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="border rounded-2xl my-2 bg-white p-4 md:p-3">
              {isComboMode ? (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full rounded-lg bg-yellow-500 py-3 text-sm font-semibold text-white"
                >
                  {comboConfig
                    ? `${comboConfig.hasExistingSelection ? "Cập nhật lựa chọn" : "Chọn sản phẩm"} - ${currencyFormatter.format(finalPrice)}`
                    : `Thêm vào giỏ hàng - ${currencyFormatter.format(totalPrice)}`}
                </button>
              ) : (
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
                    className="flex-1 w-full max-w-md rounded-lg bg-yellow-500 py-3 text-sm font-semibold text-white"
                  >
                    {isEditing
                      ? `Cập nhật giỏ hàng - ${currencyFormatter.format(totalPrice)}`
                      : `Thêm vào giỏ hàng - ${currencyFormatter.format(totalPrice)}`}
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div >
    </div >
  );
}