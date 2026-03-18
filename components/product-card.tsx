import { Product } from "@/type";
import { PlusCircle } from "lucide-react";
import Tag from "./ui/tag";

type ProductCardProps = {
    product: Product;
};

const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(price);

export default function ProductCard({ product }: ProductCardProps) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-xl transition-shadow">
            <div className="flex gap-4 p-4">
                <div className="h-48 w-48 shrink overflow-hidden rounded-xl bg-gray-100">
                    {product.img ? (
                        <div
                            className="h-full w-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${product.img})` }}
                        />
                    ) : null}
                </div>

                <div className="flex flex-1 flex-col justify-between py-2">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-700">{product.name}</h2>
                        <p className="line-clamp-2 text-sm text-gray-600 mt-1">{product.desc}</p>

                        {product.tags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {product.tags.map((tag) => (
                                    <Tag key={tag.code} name={tag.name} color={tag.color} />
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <span className="text-xs text-gray-500 font-medium">Chỉ từ</span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-2xl font-bold text-gray-700">{formatPrice(product.price)}</span>
                            <button type="button" className="hover:scale-110 transition-transform">
                                <PlusCircle
                                    className="w-12 h-12 fill-red-700 text-white"
                                    strokeWidth={1.0}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
