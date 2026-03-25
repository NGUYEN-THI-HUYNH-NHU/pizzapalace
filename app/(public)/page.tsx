import getBeverages from "@/actions/get-beverages";
import getCategories from "@/actions/get-categories";
import getCombos from "@/actions/get-combos";
import getPizzas from "@/actions/get-pizzas";
import MenuSections from "@/components/menu-sections";
import { Category, Product } from "@/type";

const categoryLabelMap: Record<Category, string> = {
    [Category.PIZZA]: "Pizza",
    [Category.COMBO]: "Combo",
    [Category.CHICKEN]: "Gà",
    [Category.APPETIZER]: "Món khai vị",
    [Category.DRINK]: "Nước uống",
};

export default async function HomePage() {
    const [categories, pizzas, combos, beverages] = await Promise.all([
        getCategories().catch(() => [] as Category[]),
        getPizzas().catch(() => [] as Product[]),
        getCombos().catch(() => [] as Product[]),
        getBeverages().catch(() => [] as Product[]),
    ]);

    const productsByCategory: Record<Category, Product[]> = {
        [Category.PIZZA]: pizzas,
        [Category.DRINK]: beverages,
        [Category.COMBO]: combos,
        [Category.CHICKEN]: [],
        [Category.APPETIZER]: [],
    };

    const menuSections = categories
        .map((category) => ({
            title: categoryLabelMap[category],
            items: productsByCategory[category] ?? [],
        }))
        .filter((section) => section.items.length > 0);

    return (
        <MenuSections sections={menuSections} />
    );
}
