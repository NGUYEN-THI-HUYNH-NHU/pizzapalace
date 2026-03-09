import { Category, Product } from "@/type";

const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const URL = apiBase.endsWith("/api")
    ? `${apiBase}/pizzas`
    : `${apiBase}/api/pizzas`;

const getPizzas = async (category?: Category): Promise<Product[]> => {
    if (!apiBase) {
        return [];
    }

    const requestUrl = category ? `${URL}?category=${category}` : URL;
    const res = await fetch(requestUrl, { cache: "no-store" });

    if (!res.ok) {
        throw new Error(`Failed to fetch products: ${res.status}`);
    }

    return res.json();
};

export default getPizzas;
