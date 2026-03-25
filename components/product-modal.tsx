'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { PizzaCrust, Product, PizzaVariant } from "@/type";
import { X } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import toast from "react-hot-toast";
import getCrusts from "@/actions/get-crusts";
import Tag from "./ui/tag";

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

const normalizeCrustKey = (value?: string) => (value || "").trim().toLowerCase();

export default function ProductModal({ product, open, onClose, editItem }: ProductModalProps) {
  const { addToCart, removeFromCart } = useCart();

  const sizes = product?.pizzaDetails?.sizes || [];
  const crusts = product?.pizzaDetails?.crusts || [];
  const [crustOptions, setCrustOptions] = useState<PizzaCrust[]>([]);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedCrust, setSelectedCrust] = useState("");
  const [quantity, setQuantity] = useState(1);

  const crustNameMap = useMemo(() => {
    return new Map(crustOptions.map((crust) => [normalizeCrustKey(crust.code), crust.name]));
  }, [crustOptions]);

  const crustCodeMap = useMemo(() => {
    const map = new Map<string, string>();

    crustOptions.forEach((crust) => {
      map.set(normalizeCrustKey(crust.code), crust.code);
      map.set(normalizeCrustKey(crust.name), crust.code);
    });

    return map;
  }, [crustOptions]);

  const resolveCrustCode = useCallback((value?: string) => {
    if (!value) return "";
    return crustCodeMap.get(normalizeCrustKey(value)) || value;
  }, [crustCodeMap]);

  useEffect(() => {
    let isMounted = true;

    const loadCrusts = async () => {
      try {
        const data = await getCrusts();
        if (isMounted) {
          setCrustOptions(data);
        }
      } catch {
        if (isMounted) {
          setCrustOptions([]);
        }
      }
    };

    if (open) {
      void loadCrusts();
    }

    return () => {
      isMounted = false;
    };
  }, [open]);

  useEffect(() => {
    if (product) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedSize(editItem?.size || product.pizzaDetails?.sizes?.[0] || "");
      setSelectedCrust(resolveCrustCode(editItem?.crust || product.pizzaDetails?.crusts?.[0] || ""));
      setQuantity(editItem?.quantity || 1);
    }
  }, [product, editItem, resolveCrustCode]);

  const selectedVariant: PizzaVariant | undefined = useMemo(() => {
    if (!product?.pizzaDetails?.variants) return undefined;

    const selectedCrustCode = resolveCrustCode(selectedCrust);

    return product.pizzaDetails.variants.find(
      (v) =>
        v.size === selectedSize &&
        normalizeCrustKey(v.crust) === normalizeCrustKey(selectedCrustCode) &&
        v.isAvailable
    );
  }, [product, selectedSize, selectedCrust, resolveCrustCode]);

  const finalPrice = selectedVariant?.price || product?.price || 0;
  const totalPrice = finalPrice * quantity;

  const getCrustLabel = (crustCode: string) => {
    const resolvedCode = resolveCrustCode(crustCode);
    return crustNameMap.get(normalizeCrustKey(resolvedCode)) || crustCode;
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative h-[85vh] w-[80vw] max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full p-2 text-gray-500 hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid h-full grid-cols-1 md:grid-cols-2">
          {/* IMAGE */}
          <div className="bg-white order-1 h-72 overflow-hidden md:order-1 md:h-full">
            {product.img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.img}
                alt={product.name}
                className="h-full w-full max-w-none object-contain"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-5xl">🍕</div>
            )}
          </div>

          {/* CONTENT */}
          <div className="order-2 flex h-full flex-col overflow-y-auto p-5 md:order-2 md:p-8">
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
                        ? "bg-yellow-600 text-white"
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
              <div className="mt-6">
                <h3 className="mb-2 text-base font-semibold text-gray-700">Đế bánh</h3>
                <div className="space-y-2">
                  {crusts.map((crust) => {
                    const crustCode = resolveCrustCode(crust);
                    const variantAvailable = product.pizzaDetails?.variants?.some(
                      (v) =>
                        v.size === selectedSize &&
                        normalizeCrustKey(v.crust) === normalizeCrustKey(crustCode) &&
                        v.isAvailable
                    );

                    const variantPrice =
                      product.pizzaDetails?.variants?.find(
                        (v) =>
                          v.size === selectedSize &&
                          normalizeCrustKey(v.crust) === normalizeCrustKey(crustCode) &&
                          v.isAvailable
                      )?.price || product.price;

                    return (
                      <button
                        key={crust}
                        onClick={() => setSelectedCrust(crustCode)}
                        disabled={!variantAvailable}
                        className={`flex w-full justify-between rounded-lg border px-3 py-2 text-sm ${normalizeCrustKey(selectedCrust) === normalizeCrustKey(crustCode) ? "border-yellow-500 bg-yellow-50" : ""
                          } ${!variantAvailable ? "opacity-50" : ""}`}
                      >
                        <span>{getCrustLabel(crustCode)}</span>
                        <span>{variantAvailable ? formatPrice(variantPrice) : "Hết"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* QUANTITY */}
            <div className="mt-6 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-10 w-10 rounded-lg border border-gray-300 text-lg font-semibold"
              >
                -
              </button>
              <span className="w-8 text-center text-base font-medium">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="h-10 w-10 rounded-lg border border-gray-300 text-lg font-semibold"
              >
                +
              </button>
            </div>

            {/* BUTTON */}
            <div className="mt-6 pb-1">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full rounded-lg bg-yellow-500 py-3 text-sm font-semibold text-white"
              >
                Thêm vào giỏ hàng - {formatPrice(totalPrice)}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}