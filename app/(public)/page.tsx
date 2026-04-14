import getBeverages from "@/actions/get-beverages";
import getCategories from "@/actions/get-categories";
import getCombos from "@/actions/get-combos";
import getPizzas from "@/actions/get-pizzas";
import getChickens from "@/actions/get-chickens";
import getAppetizers from "@/actions/get-appetizers";

import MenuSections from "@/components/menu-sections";
import AddressModal from "@/components/address-modal";

import { Category, Product } from "@/type";

const categoryLabelMap: Record<Category, string> = {
    [Category.PIZZA]: "Pizza",
    [Category.COMBO]: "Combo",
    [Category.CHICKEN]: "Gà",
    [Category.APPETIZER]: "Món khai vị",
    [Category.DRINK]: "Nước uống",
};

const categoryDisplayOrder: Category[] = [
    Category.PIZZA,
    Category.CHICKEN,
    Category.APPETIZER,
    Category.DRINK,
    Category.COMBO,
];

export default async function HomePage() {
    const [categories, pizzas, chickens, appetizers, combos, beverages] = await Promise.all([
        getCategories().catch(() => [] as Category[]),
        getPizzas().catch(() => [] as Product[]),
        getChickens().catch(() => [] as Product[]),
        getAppetizers().catch(() => [] as Product[]),
        getCombos().catch(() => [] as Product[]),
        getBeverages().catch(() => [] as Product[]),
    ]);

    const productsByCategory: Record<Category, Product[]> = {
        [Category.PIZZA]: pizzas,
        [Category.CHICKEN]: chickens,
        [Category.APPETIZER]: appetizers,
        [Category.COMBO]: combos,
        [Category.DRINK]: beverages,
    };

    const getCategoryOrder = (category: Category) => {
        const index = categoryDisplayOrder.indexOf(category);
        return index === -1 ? Number.MAX_SAFE_INTEGER : index;
    };

    const orderedCategories = [...categories].sort(
        (a, b) => getCategoryOrder(a) - getCategoryOrder(b)
    );

    const menuSections = orderedCategories
        .map((category) => ({
            title: categoryLabelMap[category],
            items: productsByCategory[category] ?? [],
        }))
        .filter((section) => section.items.length > 0);

    return (
        <>
            <AddressModal />
            <MenuSections sections={menuSections} />
        </>
    );
}
