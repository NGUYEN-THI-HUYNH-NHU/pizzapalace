import { Category } from "@/type";

const URL = `${process.env.NEXT_PUBLIC_API_URL}/categories`;

const getCategories = async (): Promise<Category[]> => {
    const res = await fetch(URL, { cache: "no-store" });

    if (!res.ok) {
        throw new Error(`Failed to fetch categories: ${res.status}`);
    }

    return res.json();
};

export default getCategories;