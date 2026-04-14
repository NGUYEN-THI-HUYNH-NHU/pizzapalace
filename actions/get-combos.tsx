import { Category, Product } from "@/type";

const URL = `${process.env.NEXT_PUBLIC_API_URL}/combos`;

const getCombos = async (category?: Category): Promise<Product[]> => {
    const requestUrl = category ? `${URL}?category=${category}` : URL;
    const res = await fetch(requestUrl, { cache: "no-store" });

    if (!res.ok) {
        throw new Error(`Failed to fetch products: ${res.status}`);
    }

    const products = (await res.json()) as Product[];

    return products.filter((product) => product.isAvailable);
};

export default getCombos;
