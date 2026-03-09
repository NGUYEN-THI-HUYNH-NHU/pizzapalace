import { Product } from "@/type";

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
        <article className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="mb-3 h-28 overflow-hidden rounded-xl bg-gray-100">
                {product.img ? (
                    <div
                        className="h-full w-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${product.img})` }}
                    />
                ) : null}
            </div>
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">{product.desc}</p>
            <div className="mt-3 flex items-center justify-between">
                <span className="text-xl font-bold text-red-600">{formatPrice(product.price)}</span>
                <button
                    type="button"
                    className="rounded-full border border-red-600 px-3 py-1 text-red-600"
                >
                    +
                </button>
            </div>
        </article>
    );
}
