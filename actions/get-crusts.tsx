import { PizzaCrust } from "@/type";

const URL = "/api/catalog/crusts";

const getCrusts = async (): Promise<PizzaCrust[]> => {
    const response = await fetch(URL, {
        method: "GET",
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch crusts: ${response.status}`);
    }

    return response.json();
};

export default getCrusts;
