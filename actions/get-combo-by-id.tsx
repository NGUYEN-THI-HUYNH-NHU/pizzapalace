import { Product } from "@/type";

const URL = `${process.env.NEXT_PUBLIC_API_URL}/combos`;

const getComboById = async (comboId: string): Promise<Product | null> => {
  try {
    const detailRes = await fetch(`${URL}/${encodeURIComponent(comboId)}`, {
      cache: "no-store",
    });

    if (detailRes.ok) {
      const combo = (await detailRes.json()) as Product;
      if (combo?.id && combo.isAvailable) {
        return combo;
      }
    }
  } catch {
    // Fallback to list endpoint below.
  }

  const res = await fetch(URL, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to fetch combos: ${res.status}`);
  }

  const combos = (await res.json()) as Product[];
  const combo = combos.find((item) => item.id === comboId && item.isAvailable);

  return combo ?? null;
};

export default getComboById;
