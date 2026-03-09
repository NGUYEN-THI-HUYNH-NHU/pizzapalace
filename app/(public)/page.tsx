import getBeverages from "@/actions/get-beverages";
import getCategories from "@/actions/get-categories";
import getCombos from "@/actions/get-combos";
import getPizzas from "@/actions/get-pizzas";
import MenuSections from "@/components/menu-sections";
import { Category, Product } from "@/type";

const categoryLabelMap: Record<Category, string> = {
    [Category.PIZZA]: "Pizza",
    [Category.DRINK]: "Nước uống",
    [Category.CHICKEN]: "Gà",
    [Category.APPETIZER]: "Món khai vị",
    [Category.COMBO]: "Combo",
};

export default async function HomePage() {
    const [categories, pizzas, beverages, combos] = await Promise.all([
        getCategories().catch(() => [] as Category[]),
        getPizzas().catch(() => [] as Product[]),
        getBeverages().catch(() => [] as Product[]),
        getCombos().catch(() => [] as Product[])
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
        <main className="mx-auto max-w-7xl px-4 pb-12">
            <MenuSections sections={menuSections} />
        </main>
    );
}
