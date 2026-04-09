'use client';

import { useEffect, useMemo, useState } from "react";
import { Product, PizzaVariant } from "@/type";
import { X } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import toast from "react-hot-toast";
<<<<<<< HEAD
import getCrusts from "@/actions/get-crusts";
=======
import Tag from "./ui/tag";
import { currencyFormatter } from "@/lib/utils";
>>>>>>> 93a5921e025f85ab8c30f1b281851981f4fa88cb

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
<<<<<<< HEAD
  const [crustsMap, setCrustsMap] = useState<Record<string, string>>({});
=======
  const variants = useMemo(() => product?.pizzaDetails?.variants || [], [product]);

>>>>>>> 93a5921e025f85ab8c30f1b281851981f4fa88cb
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedCrust, setSelectedCrust] = useState("");
  const [quantity, setQuantity] = useState(1);

<<<<<<< HEAD
  // Lấy crust từ API tách riêng
  useEffect(() => {
    const fetchCrusts = async () => {
      try {
        const data = await getCrusts(); // trả về PizzaCrust[]
        const map: Record<string, string> = {};
        data.forEach(c => (map[c.code] = c.name));
        setCrustsMap(map);
      } catch (error) {
        console.error("Fetch crusts failed:", error);
      }
    };
    fetchCrusts();
  }, []);

  // Reset khi product thay đổi
  useEffect(() => {
    if (product) {
      const firstSize = product.pizzaDetails?.sizes?.[0] || "";
      setSelectedSize(firstSize);

      const firstCrust = product.pizzaDetails?.variants?.find(
        v => v.size === firstSize && v.isAvailable
      )?.crust;
      setSelectedCrust(firstCrust || "");
      setQuantity(1);
=======
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
>>>>>>> 93a5921e025f85ab8c30f1b281851981f4fa88cb
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

  // Variant đang chọn
  const selectedVariant: PizzaVariant | undefined = useMemo(() => {
<<<<<<< HEAD
    if (!product?.pizzaDetails?.variants) return undefined;
    return product.pizzaDetails.variants.find(
      v => v.size === selectedSize && v.crust === selectedCrust && v.isAvailable
=======
    if (!variants.length) return undefined;

    return variants.find(
      (v) =>
        v.size === selectedSize &&
        v.crust === selectedCrust &&
        v.isAvailable
>>>>>>> 93a5921e025f85ab8c30f1b281851981f4fa88cb
    );
  }, [variants, selectedSize, selectedCrust]);

  const finalPrice = selectedVariant?.price || product?.price || 0;
  const totalPrice = finalPrice * quantity;

  if (!open || !product) return null;

<<<<<<< HEAD
  // Lọc crust hợp lệ cho size hiện tại
  const crustsForSize = product.pizzaDetails?.variants
    ?.filter(v => v.size === selectedSize && v.isAvailable)
    .map(v => v.crust) || [];

  const handleAddToCart = () => {
    const cartItemId = `${product.id}-${selectedSize}-${selectedCrust}`;
    addToCart({
      id: cartItemId,
      productId: product.id,
      variantId: selectedVariant?.sku || `${selectedSize}-${selectedCrust}`,
      name: product.name,
      price: finalPrice,
      image: product.img || '🍕',
      description: product.desc,
      quantity,
      size: selectedSize,
      crust: selectedCrust,
      sku: selectedVariant?.sku,
      pizzaDetails: product.pizzaDetails || null,
    });
    toast.success(`${product.name} đã được thêm vào giỏ hàng!`);
=======
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
        image: product!.img,
        description: product!.desc,
        size: selectedSize || undefined,
        crust: selectedCrust || undefined,
        crustName: selectedVariant?.crustName || selectedCrust || undefined,
      });
    }

    toast.success(`${product!.name} đã được thêm vào giỏ hàng!`);
>>>>>>> 93a5921e025f85ab8c30f1b281851981f4fa88cb
    onClose();
  };

  return (
<<<<<<< HEAD
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="relative w-full max-w-xl h-[600px] rounded-2xl bg-white shadow-xl overflow-hidden">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-2 text-gray-500 hover:bg-gray-100"
=======
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative h-[80vh] w-[70vw] max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full p-2 text-gray-500 hover:bg-gray-100"
>>>>>>> 93a5921e025f85ab8c30f1b281851981f4fa88cb
        >
          <X className="h-4 w-4" />
        </button>

<<<<<<< HEAD
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full p-4">
          {/* IMAGE */}
          <div className="overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center">
            {product.img ? (
              <img
                src={product.img}
                alt={product.name}
                className="h-[250px] w-full object-cover rounded-xl"
              />
            ) : (
              <div className="text-4xl">🍕</div>
=======
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
>>>>>>> 93a5921e025f85ab8c30f1b281851981f4fa88cb
            )}
          </div>

          {/* CONTENT */}
<<<<<<< HEAD
          <div className="flex flex-col h-full">
            <h2 className="text-xl font-bold text-gray-800">{product.name}</h2>
            <p className="mt-1 text-xs text-gray-600">{product.desc}</p>

            {/* SIZE */}
            {sizes.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-2 text-xs font-semibold text-gray-700">Kích thước</h3>
                <div className="grid grid-cols-3 gap-2">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-lg border px-3 py-1 text-xs ${
                        selectedSize === size ? "bg-red-600 text-white" : "border-gray-300"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CRUST */}
            {crustsForSize.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-2 text-xs font-semibold text-gray-700">Đế bánh</h3>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                  <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
                    {crustsForSize.map(crust => {
                      const variantPrice =
                        product.pizzaDetails?.variants?.find(
                          v => v.size === selectedSize && v.crust === crust && v.isAvailable
                        )?.price || product.price;

                      return (
                        <button
                          key={crust}
                          onClick={() => setSelectedCrust(crust)}
                          className={`flex w-full justify-between rounded-lg border px-3 py-2 text-xs ${
                            selectedCrust === crust ? "border-red-500 bg-red-50" : ""
                          }`}
                        >
                          <span>{crustsMap[crust] || crust}</span>
                          <span>{formatPrice(variantPrice)}</span>
=======
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
>>>>>>> 93a5921e025f85ab8c30f1b281851981f4fa88cb
                        </button>
                      );
                    })}
                  </div>
                </div>
<<<<<<< HEAD
              </div>
            )}

            {/* QUANTITY */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
                aria-label="Giảm số lượng"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[2rem] text-center text-sm font-semibold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
                aria-label="Tăng số lượng"
              >
                <Plus className="h-4 w-4" />
              </button>
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
=======
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

>>>>>>> 93a5921e025f85ab8c30f1b281851981f4fa88cb
        </div>
      </div>
    </div>
  );
}