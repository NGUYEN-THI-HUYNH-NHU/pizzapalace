'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { Product } from "@/type";
import { currencyFormatter } from "@/lib/utils";

type ComboModalProps = {
    combo: Product | null;
    open: boolean;
    onClose: () => void;
};

export default function ComboModal({ combo, open, onClose }: ComboModalProps) {
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);

    if (!open || !combo) {
        return null;
    }

    const handleCreateCombo = () => {
        router.push(`/combo/${combo.id}?quantity=${quantity}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-3 top-3 z-10 rounded-full p-2 text-gray-500 hover:bg-gray-100"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="max-h-[88vh] overflow-y-auto">
                    <div className="h-72 w-full overflow-hidden bg-slate-100">
                        {combo.img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={combo.img} alt={combo.name} className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-slate-500">Image unavailable</div>
                        )}
                    </div>

                    <div className="space-y-4 p-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{combo.name}</h2>
                            <p className="mt-2 whitespace-pre-line text-sm text-gray-600">{combo.desc}</p>
                        </div>

                        <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-4">
                            <p className="text-sm text-yellow-700">Giá combo gốc</p>
                            <p className="text-xl font-semibold text-yellow-800">{currencyFormatter.format(combo.price)}</p>
                        </div>

                        <div className="flex items-center gap-3 border-t pt-2">
                            <button
                                type="button"
                                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                                className="h-11 w-11 rounded-lg border border-gray-300 text-lg font-semibold text-yellow-500"
                            >
                                -
                            </button>
                            <span className="w-8 text-center text-base font-medium">{quantity}</span>
                            <button
                                type="button"
                                onClick={() => setQuantity((prev) => prev + 1)}
                                className="h-11 w-11 rounded-lg border border-gray-300 text-lg font-semibold text-yellow-500"
                            >
                                +
                            </button>

                            <button
                                type="button"
                                onClick={handleCreateCombo}
                                className="ml-auto w-full max-w-sm rounded-lg bg-yellow-500 py-3 text-sm font-semibold text-white"
                            >
                                Tạo combo - {currencyFormatter.format(combo.price * quantity)}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
