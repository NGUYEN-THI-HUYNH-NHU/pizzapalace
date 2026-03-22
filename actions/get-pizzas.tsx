import { Category, Product } from "@/type";

const URL = `${process.env.NEXT_PUBLIC_API_URL}/pizzas`;

const getPizzas = async (category?: Category): Promise<Product[]> => {
    const requestUrl = category ? `${URL}?category=${category}` : URL;
    const res = await fetch(requestUrl, { cache: "no-store" });

    if (!res.ok) {
        throw new Error(`Failed to fetch products: ${res.status}`);
    }

    return res.json();
};

export default getPizzas;
