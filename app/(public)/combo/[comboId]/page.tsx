import { notFound } from "next/navigation";

import getComboById from "@/actions/get-combo-by-id";
import getProductCatalog from "@/actions/get-product-catalog";
import ComboBuilder from "./components/combo-builder";

type ComboPageProps = {
    params: Promise<{ comboId: string }>;
    searchParams: Promise<{ quantity?: string; editItemId?: string }>;
};

const parseQuantity = (value?: string) => {
    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed < 1) {
        return 1;
    }

    return Math.floor(parsed);
};

export default async function ComboPage({ params, searchParams }: ComboPageProps) {
    const [{ comboId }, query] = await Promise.all([params, searchParams]);

    const [combo, catalog] = await Promise.all([
        getComboById(comboId),
        getProductCatalog(),
    ]);

    if (!combo?.comboDetails?.slots?.length) {
        notFound();
    }

    return (
        <ComboBuilder
            combo={combo}
            catalog={catalog}
            initialQuantity={parseQuantity(query.quantity)}
            editComboId={comboId}
            editItemId={query.editItemId}
        />
    );
}