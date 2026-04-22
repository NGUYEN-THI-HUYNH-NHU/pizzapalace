'use client';

import { useMemo, useState, useEffect, useRef } from "react";
import { CheckCircle2, Circle, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";

import ProductModal from "@/components/product-modal";
import { useCart } from "@/contexts/cart-context";
import { currencyFormatter } from "@/lib/utils";
import { ComboOption, Product } from "@/type";
import { useRouter } from "next/navigation";
import Tag from "@/components/ui/tag";

type SlotSelection = {
    slotName: string;
    option: ComboOption;
    product: Product;
    size?: string;
    crust?: string;
    crustName?: string;
    sku?: string;
    extraPrice: number;
};

type SavedSelectedOption = {
    k: string;
    v: string;
    productId: string;
    sku: string;
    crustName?: string;
    crustSize?: string;
};

type ComboBuilderProps = {
    combo: Product;
    catalog: Product[];
    initialQuantity: number;
    editComboId?: string;
};

const normalizeQuantity = (value: number) => {
    if (!Number.isFinite(value)) {
        return 1;
    }

    return Math.max(1, Math.floor(value));
};

export default function ComboBuilder({ combo, catalog, initialQuantity, editComboId }: ComboBuilderProps) {
    const router = useRouter();
    const { addToCart } = useCart();
    const leftPanelRef = useRef<HTMLElement | null>(null);
    const [activeSlotIndex, setActiveSlotIndex] = useState(0);
    const [quantity] = useState(normalizeQuantity(initialQuantity));
    const [leftPanelHeight, setLeftPanelHeight] = useState(0);
    const [selections, setSelections] = useState<Record<number, SlotSelection>>({});
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const productMap = useMemo(() => {
        return new Map(catalog.map((item) => [item.id, item]));
    }, [catalog]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const slots = combo.comboDetails?.slots ?? [];

    // Restore saved selections from localStorage when editing
    useEffect(() => {
        if (!editComboId) {
            return;
        }

        const storageKey = `combo-edit-${editComboId}`;
        const savedData = localStorage.getItem(storageKey);

        if (!savedData) {
            return;
        }

        try {
            const savedOptions: SavedSelectedOption[] = JSON.parse(savedData);
            const restoredSelections: Record<number, SlotSelection> = {};

            savedOptions.forEach((savedOption) => {
                const slotIndex = slots.findIndex((slot) => slot.name === savedOption.k);

                if (slotIndex === -1) {
                    return;
                }

                const slot = slots[slotIndex];
                const option = slot.options.find((opt) => opt.productId === savedOption.productId);
                const product = productMap.get(savedOption.productId);

                if (!option || !product) {
                    return;
                }

                restoredSelections[slotIndex] = {
                    slotName: slot.name,
                    option,
                    product,
                    size: savedOption.crustSize,
                    crust: savedOption.crustName,
                    crustName: savedOption.crustName,
                    sku: savedOption.sku,
                    extraPrice: 0, // Will recalculate based on variant
                };
            });

            setSelections(restoredSelections);
            localStorage.removeItem(storageKey);
        } catch (error) {
            console.error("Failed to restore combo selections:", error);
        }
    }, [editComboId, slots, productMap]);

    useEffect(() => {
        const el = leftPanelRef.current;
        if (!el) {
            return;
        }

        const updateHeight = () => {
            setLeftPanelHeight(el.offsetHeight);
        };

        updateHeight();

        const observer = new ResizeObserver(() => {
            updateHeight();
        });

        observer.observe(el);
        window.addEventListener("resize", updateHeight);

        return () => {
            observer.disconnect();
            window.removeEventListener("resize", updateHeight);
        };
    }, [slots.length, selections]);

    const activeSlot = slots[activeSlotIndex];

    const activeSlotProducts = useMemo(() => {
        if (!activeSlot) {
            return [] as Array<{ option: ComboOption; product: Product }>;
        }

        return activeSlot.options
            .map((option) => {
                const product = productMap.get(option.productId);
                if (!product) {
                    return null;
                }

                return { option, product };
            })
            .filter((item): item is { option: ComboOption; product: Product } => Boolean(item));
    }, [activeSlot, productMap]);

    const activeOptionByProductId = useMemo(() => {
        const map = new Map<string, ComboOption>();

        if (!activeSlot) {
            return map;
        }

        activeSlot.options.forEach((option) => {
            map.set(option.productId, option);
        });

        return map;
    }, [activeSlot]);

    const selectedCount = Object.keys(selections).length;
    const allSlotsSelected = slots.length > 0 && selectedCount === slots.length;
    const extraPrice = Object.values(selections).reduce((sum, selection) => sum + selection.extraPrice, 0);
    const finalUnitPrice = combo.price + extraPrice;

    const handleSelectProduct = (product: Product) => {
        const option = activeOptionByProductId.get(product.id);

        if (!option) {
            return;
        }

        setSelectedProduct(product);
    };

    const handleConfirmSlotSelection = (selectionPayload: {
        productId: string;
        productName: string;
        image: string;
        size?: string;
        crust?: string;
        crustName?: string;
        sku?: string;
        extraPrice: number;
    }) => {
        if (!activeSlot) {
            return;
        }

        const option = activeSlot.options.find((item) => item.productId === selectionPayload.productId);
        if (!option) {
            return;
        }

        const product = productMap.get(selectionPayload.productId);
        if (!product) {
            return;
        }

        setSelections((prev) => ({
            ...prev,
            [activeSlotIndex]: {
                slotName: activeSlot.name,
                option,
                product,
                size: selectionPayload.size,
                crust: selectionPayload.crust,
                crustName: selectionPayload.crustName,
                sku: selectionPayload.sku,
                extraPrice: selectionPayload.extraPrice,
            },
        }));

        if (activeSlotIndex < slots.length - 1) {
            setActiveSlotIndex((current) => current + 1);
        }

        toast.success(`Đã chọn ${selectionPayload.productName} cho slot.`);
    };

    const handleAddComboToCart = () => {
        if (!allSlotsSelected) {
            toast.error("Vui lòng chọn đủ sản phẩm cho tất cả slot của combo.");
            return;
        }

        const selectedOptions = slots.map((slot, index) => {
            const selection = selections[index];

            return {
                k: slot.name,
                v: selection.product.name,
                productId: selection.product.id,
                sku: selection.sku || selection.product.id,
                crustName: selection.crustName,
                crustSize: selection.size,
            };
        });

        const variantSignature = selectedOptions
            .map((item) => `${item.productId}:${item.crustName ?? ""}:${item.crustSize ?? ""}`)
            .join("|");

        addToCart({
            id: `${combo.id}-${variantSignature}`,
            productId: combo.id,
            variantId: variantSignature,
            name: combo.name,
            price: finalUnitPrice,
            image: combo.img,
            quantity,
            description: combo.desc,
            selectedOptions,
        });

        toast.success("Combo đã được thêm vào giỏ hàng.");
        router.push(`/`);
    };

    return (
        <div className="mx-auto w-full max-w-7xl space-y-5 py-6">
            <div className="grid items-start gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
                <section ref={leftPanelRef} className="flex h-fit self-start flex-col rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="rounded-xl">
                        <h1 className="text-xl font-bold text-slate-800">{combo.name}</h1>
                        <p className="mt-2 text-sm font-semibold text-yellow-600">
                            Giá combo: {currencyFormatter.format(combo.price)}
                        </p>
                    </div>

                    <div className="mt-4 flex-1 min-h-0 space-y-3 overflow-y-auto pr-1">
                        {slots.map((slot, index) => {
                            const slotSelection = selections[index];
                            const isActive = activeSlotIndex === index;

                            return (
                                <button
                                    type="button"
                                    key={`${slot.name}-${index}`}
                                    onClick={() => setActiveSlotIndex(index)}
                                    className={`w-full rounded-xl border p-3 text-left transition ${isActive ? "border-yellow-400 bg-yellow-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5">
                                            {slotSelection ? (
                                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                            ) : (
                                                <Circle className="h-5 w-5 text-slate-300" />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-slate-800">Slot {index + 1}</p>
                                            <p className="mt-1 text-xs text-slate-600">{slot.name}</p>

                                            <div className="mt-2 flex items-center gap-2">
                                                <div className="h-12 w-12 overflow-hidden rounded-md bg-slate-100">
                                                    {slotSelection?.product.img ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={slotSelection.product.img} alt={slotSelection.product.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center text-[10px] text-slate-400">Trống</div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-xs font-medium text-slate-700">
                                                        {slotSelection ? slotSelection.product.name : "Chưa chọn sản phẩm"}
                                                    </p>
                                                    {slotSelection && (
                                                        <p className="text-[11px] text-slate-500">
                                                            {slotSelection.size ? `Cỡ ${slotSelection.size} ` : ""}
                                                            &bull; {slotSelection.crustName ? ` Đế ${slotSelection.crustName}` : ""}
                                                            {slotSelection.extraPrice > 0 ? ` +${currencyFormatter.format(slotSelection.extraPrice)}` : ""}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section
                    className="flex min-h-0 self-start flex-col space-y-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4"
                    style={{ maxHeight: leftPanelHeight > 0 ? `${leftPanelHeight}px` : undefined }}
                >
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                        <div>
                            <p className="text-base font-semibold text-slate-800">
                                {activeSlot ? `Slot ${activeSlotIndex + 1}: ${activeSlot.name}` : "Không có slot"}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500">
                                Giá thêm từ lựa chọn:
                                <span className="text-sm font-semibold text-slate-700"> {currencyFormatter.format(extraPrice)}</span>
                            </p>
                        </div>
                    </div>

                    <div className="grid auto-rows-max content-start gap-4 overflow-y-auto pr-1 2xl:grid-cols-2">
                        {activeSlotProducts.map(({ product }) => {
                            const currentSelection = selections[activeSlotIndex];
                            const isSelected = currentSelection?.product.id === product.id;

                            return (
                                <div
                                    key={`${activeSlotIndex}-${product.id}`}
                                    className={`rounded-xl border bg-white overflow-hidden transition cursor-pointer ${isSelected ? "border-yellow-400 shadow-sm" : "border-slate-200 hover:shadow-xl"}`}
                                    onClick={() => handleSelectProduct(product)}
                                >
                                    <div className="flex gap-4 p-4">
                                        <div className="h-32 w-32 shrink-0 overflow-hidden rounded-xl bg-gray-100 inline-flex justify-center">
                                            {product.img ? (
                                                <div
                                                    className="h-full w-full bg-cover bg-center hover:scale-110 transition-transform duration-300"
                                                    style={{ backgroundImage: `url(${product.img})` }}
                                                />
                                            ) : null}
                                        </div>

                                        <div className="flex min-w-0 flex-1 flex-col justify-between">
                                            <div>
                                                <h3 className="line-clamp-2 text-lg font-semibold text-gray-700">{product.name}</h3>
                                                <p className="mt-1 line-clamp-2 text-xs text-gray-600">{product.desc}</p>

                                                {product.tags.length > 0 && (
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {product.tags.map((tag) => (
                                                            <Tag key={tag.code} name={tag.name} color={tag.color} />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-3 flex items-end justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-medium text-gray-500">Chỉ từ</span>
                                                    <span className="text-lg font-bold text-yellow-600">{currencyFormatter.format(0)}</span>
                                                </div>

                                                <button
                                                    type="button"
                                                    className="hover:scale-110 transition-transform"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleSelectProduct(product);
                                                    }}
                                                >
                                                    <PlusCircle className="h-10 w-10 fill-yellow-500 text-white" strokeWidth={1} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="sticky rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="min-w-55 flex-1">
                                <p className="text-sm text-slate-500">
                                    Đã chọn {selectedCount}/{slots.length} slot
                                </p>
                                <p className="text-lg font-semibold text-slate-800">
                                    Tổng tạm tính: {currencyFormatter.format(finalUnitPrice * quantity)}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddComboToCart}
                                disabled={!allSlotsSelected}
                                className="rounded-lg bg-yellow-500 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Thêm combo vào giỏ hàng
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            <ProductModal
                product={selectedProduct}
                open={Boolean(selectedProduct)}
                onClose={() => setSelectedProduct(null)}
                isEditing={false}
                comboConfig={{
                    requiredSize: activeOptionByProductId.get(selectedProduct?.id || "")?.sizeRequirement || undefined,
                    hasExistingSelection: Boolean(selections[activeSlotIndex]),
                    onConfirm: handleConfirmSlotSelection,
                }}
            />
        </div>
    );
}
