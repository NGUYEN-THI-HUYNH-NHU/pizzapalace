import getAppetizers from "@/actions/get-appetizers";
import getBeverages from "@/actions/get-beverages";
import getChickens from "@/actions/get-chickens";
import getPizzas from "@/actions/get-pizzas";
import { Product } from "@/type";

const getProductCatalog = async (): Promise<Product[]> => {
    const [pizzas, chickens, appetizers, beverages] = await Promise.all([
        getPizzas().catch(() => [] as Product[]),
        getChickens().catch(() => [] as Product[]),
        getAppetizers().catch(() => [] as Product[]),
        getBeverages().catch(() => [] as Product[]),
    ]);

    return [...pizzas, ...chickens, ...appetizers, ...beverages];
};

export default getProductCatalog;
