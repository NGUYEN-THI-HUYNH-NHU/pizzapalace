import { Product } from "@/type";

const URL = `${process.env.NEXT_PUBLIC_API_URL}/chickens`;

const getChickens = async (): Promise<Product[]> => {
    const res = await fetch(URL, { cache: "no-store" });

    if (!res.ok) {
        throw new Error(`Failed to fetch products: ${res.status}`);
    }

    const products = (await res.json()) as Product[];

    return products.filter((product) => product.isAvailable);
};

export default getChickens;
