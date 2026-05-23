"use client";

import { useState } from "react";
import { Category, Product } from "@/type";
import { PlusCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "@/contexts/cart-context";
import Tag from "./ui/tag";
import ProductModal from "./product-modal";
import ComboModal from "./combo-modal";
import { currencyFormatter } from "@/lib/utils";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const [open, setOpen] = useState(false);
  const { addToCart } = useCart();
  const isCombo = product.category === Category.COMBO;
  const isDrink = product.category === Category.DRINK;

  const drinkMeta = isDrink
    ? [product.drinkDetails?.brand, product.drinkDetails?.volume]
        .filter(Boolean)
        .join(" • ")
    : "";

  const handleOpenModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (isDrink) {
      addToCart({
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.img,
        description: product.desc,
      });

      toast.success(`${product.name} đã được thêm vào giỏ hàng!`);
      return;
    }

    setOpen(true);
  };

  return (
    <>
      <div
        className="rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <div className="flex gap-4 p-3">
          <div className="h-46 w-46 shrink overflow-hidden rounded-xl bg-gray-100">
            {product.img ? (
              <div
                className="h-full w-full bg-cover bg-center hover:scale-110 transition-transform duration-300"
                style={{ backgroundImage: `url(${product.img})` }}
              />
            ) : null}
          </div>

          <div className="flex flex-1 flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-700">
                {product.name}
              </h2>
              {isDrink ? (
                drinkMeta ? (
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600 wrap-break-word">
                    {drinkMeta}
                  </p>
                ) : null
              ) : (
                <p className="line-clamp-2 text-sm text-gray-600 mt-1 wrap-break-word">
                  {product.desc}
                </p>
              )}

              {product.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Tag key={tag.code} name={tag.name} color={tag.color} />
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-end justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-medium">
                    Chỉ từ
                  </span>
                  <span className="text-xl font-bold text-gray-700">
                    {currencyFormatter.format(product.price)}
                  </span>
                </div>

                <button
                  type="button"
                  className="hover:scale-110 transition-transform"
                  onClick={handleOpenModal}
                >
                  <PlusCircle
                    className="w-14 h-14 fill-yellow-500 text-white pointer-events-none"
                    strokeWidth={1.0}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProductModal
        product={product}
        open={open && !isCombo}
        onClose={() => setOpen(false)}
        isEditing={false}
      />

      <ComboModal
        combo={isCombo ? product : null}
        open={open && isCombo}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
