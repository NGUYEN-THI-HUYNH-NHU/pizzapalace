import getAppetizers from "@/actions/get-appetizers";
import getBeverages from "@/actions/get-beverages";
import getChickens from "@/actions/get-chickens";
import getCombos from "@/actions/get-combos";
import getPizzas from "@/actions/get-pizzas";
import { Product } from "@/type";

const getProductCatalog = async (): Promise<Product[]> => {
    const [pizzas, chickens, appetizers, beverages, combos] = await Promise.all([
        getPizzas().catch(() => [] as Product[]),
        getChickens().catch(() => [] as Product[]),
        getAppetizers().catch(() => [] as Product[]),
        getBeverages().catch(() => [] as Product[]),
        getCombos().catch(() => [] as Product[]),
    ]);

    return [...pizzas, ...chickens, ...appetizers, ...beverages, ...combos];
};

export default getProductCatalog;
