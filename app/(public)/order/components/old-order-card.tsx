'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, CopyIcon, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

import { useCart, type CartItem } from '@/contexts/cart-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, currencyFormatter, formatDateTime } from '@/lib/utils';
import { PAYMENT_LABELS, STATUS_COLOR_MAP, STATUS_LABELS } from '@/lib/order-utils';
import { Order, OrderItem, OrderStatus, Product } from '@/type';

interface OldOrderCardProps {
    order: Order;
    productCatalog: Record<string, Product | undefined>;
}

const SELECTED_CART_ITEMS_KEY = 'pizzapalace-selected-cart-item-ids';

const buildCartItemId = (item: OrderItem) => {
    const optionKey = item.selectedOptions
        .map((option) => `${option.k}:${option.v}:${option.sku}`)
        .join('|');

    return [item.productId, item.sku, item.crustName ?? '', item.crustSize ?? '', optionKey].join('|');
};

const getItemImage = (item: OrderItem, productCatalog: Record<string, Product | undefined>) => {
    return productCatalog[item.productId]?.img || 'https://via.placeholder.com/128';
};

const renderStatusBadge = (status: OrderStatus) => {
    const colorMap = STATUS_COLOR_MAP[status];
    return <Badge variant="outline" className={cn(colorMap.className)}>{colorMap.label}</Badge>;
};

const getSelectedOptionLabel = (option: OrderItem['selectedOptions'][number], productCatalog: Record<string, Product | undefined>) => {
    let label = '';

    if (option.productId) {
        const productName = productCatalog[option.productId]?.name;
        if (productName) label = productName;
    }

    if (!label) label = option.v;

    if (option.crustSize) label += ` - Cỡ ${option.crustSize}`;

    if (option.crustName) label += ` - ${option.crustName}`;

    return label;
};

const buildRebuyCartItems = (order: Order, productCatalog: Record<string, Product | undefined>) => {
    const merged = new Map<string, CartItem>();

    order.orderItems.forEach((item) => {
        const id = buildCartItemId(item);
        const existing = merged.get(id);
        const catalogProduct = productCatalog[item.productId];

        const nextItem: CartItem = {
            id,
            productId: item.productId,
            variantId: item.sku || undefined,
            name: item.productName,
            price: item.price,
            image: catalogProduct?.img || 'https://via.placeholder.com/128',
            quantity: item.quantity,
            description: catalogProduct?.desc,
            size: item.crustSize || undefined,
            crust: item.crustName || undefined,
            crustName: item.crustName || undefined,
            selectedOptions: item.selectedOptions.map((option) => ({
                k: option.k,
                v: option.v,
                sku: option.sku,
                productId: option.productId || undefined,
                crustName: option.crustName || undefined,
                crustSize: option.crustSize || undefined,
            })),
        };

        if (existing) {
            merged.set(id, { ...existing, quantity: existing.quantity + item.quantity });
            return;
        }

        merged.set(id, nextItem);
    });

    return Array.from(merged.values());
};

const getSelectedItemCount = (order: Order) => order.orderItems.reduce((sum, item) => sum + item.quantity, 0);

export function OldOrderCard({ order, productCatalog }: OldOrderCardProps) {
    const router = useRouter();
    const { cartItems, replaceCart } = useCart();
    const [open, setOpen] = useState(false);
    const totalQuantity = useMemo(() => getSelectedItemCount(order), [order]);

    const onCopy = async () => {
        await navigator.clipboard.writeText(order.id);
        toast.success('Mã đơn đã được sao chép vào clipboard.');
    };

    const onRebuy = () => {
        const rebuyItems = buildRebuyCartItems(order, productCatalog);

        const nextCartItems = [...cartItems];
        const selectedRebuyIds: string[] = [];

        rebuyItems.forEach((rebuyItem) => {
            const existingIndex = nextCartItems.findIndex(
                (currentItem) =>
                    currentItem.productId === rebuyItem.productId
                    && currentItem.variantId === rebuyItem.variantId
            );

            if (existingIndex >= 0) {
                const existing = nextCartItems[existingIndex];
                nextCartItems[existingIndex] = {
                    ...existing,
                    quantity: existing.quantity + rebuyItem.quantity,
                };
                selectedRebuyIds.push(existing.id);
                return;
            }

            nextCartItems.push(rebuyItem);
            selectedRebuyIds.push(rebuyItem.id);
        });

        replaceCart(nextCartItems);
        localStorage.setItem(SELECTED_CART_ITEMS_KEY, JSON.stringify(Array.from(new Set(selectedRebuyIds))));
        router.push('/cart');
    };

    return (
        <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
            <div className="flex flex-col gap-4 p-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm text-slate-500">Mã đơn</p>
                        <p className="text-base font-semibold text-slate-800">{order.id}</p>
                        <Button variant="outline" size="sm" onClick={onCopy}>
                            <CopyIcon className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {renderStatusBadge(order.status)}
                    <p className="text-sm font-semibold text-slate-700">{currencyFormatter.format(order.totalAmount)}</p>
                </div>
            </div>

            <div className="flex flex-col gap-4 p-4 md:flex-row md:items-start md:justify-between">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
                    <span>{formatDateTime(order.createdAt)}</span>
                    <span>[{totalQuantity} sản phẩm]</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => setOpen((current) => !current)} aria-expanded={open}>
                    {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
            </div>

            {open && (
                <div className="border-t border-gray-100 bg-slate-100/80 px-4 py-4">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-xl bg-white p-3">
                            <p className="text-xs text-slate-500">Khách hàng</p>
                            <p className="mt-1 text-sm font-medium text-slate-800">{order.customerName}</p>
                            <p className="text-sm text-slate-600">{order.customerPhone}</p>
                        </div>
                        <div className="rounded-xl bg-white p-3 md:col-span-1 xl:col-span-2">
                            <p className="text-xs text-slate-500">Địa chỉ giao hàng</p>
                            <p className="mt-1 text-sm font-medium text-slate-800">{order.customerAddress}</p>
                        </div>
                        <div className="rounded-xl bg-white p-3">
                            <p className="text-xs text-slate-500">Thanh toán</p>
                            <p className="mt-1 text-sm font-medium text-slate-800">{PAYMENT_LABELS[order.paymentMethod]}</p>
                            <p className="text-sm text-slate-600">{order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
                        </div>
                    </div>

                    <div className="mt-4 rounded-xl bg-white p-3">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-800">Danh sách sản phẩm</h3>
                            <p className="text-xs text-slate-500">{order.orderItems.length} dòng sản phẩm</p>
                        </div>

                        <div className="space-y-3">
                            {order.orderItems.map((item) => {
                                const itemImage = getItemImage(item, productCatalog);
                                const lineTotal = item.price * item.quantity;

                                return (
                                    <div key={`${order.id}-${item.productId}-${item.sku}`} className="flex gap-3 rounded-xl border border-gray-100 p-3">
                                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={itemImage} alt={item.productName} className="h-full w-full object-cover" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-medium text-slate-800">{item.productName}</p>
                                                    {item.crustSize && <p className="text-xs text-slate-500">Cỡ: {item.crustSize}</p>}
                                                    {item.crustName && <p className="text-xs text-slate-500">Đế: {item.crustName}</p>}
                                                </div>
                                                <div>
                                                    <p className="text-sm text-end font-semibold text-slate-800">{currencyFormatter.format(lineTotal)}</p>
                                                    <p className="text-sm text-end text-slate-500">{item.quantity} x {currencyFormatter.format(item.price)}</p>
                                                </div>
                                            </div>

                                            {item.selectedOptions.length > 0 && (
                                                <div className="mt-2 flex flex-col gap-2">
                                                    {item.selectedOptions.map((option) => (
                                                        <div key={`${item.productId}-${option.v}-${option.k}`} className="flex flex-col rounded-sm gap-2 bg-slate-100 px-2 py-1">
                                                            <span className="text-sm text-slate-500">
                                                                {option.k}
                                                            </span>
                                                            <span className=" text-sm text-slate-900">
                                                                {getSelectedOptionLabel(option, productCatalog)}
                                                            </span>
                                                        </div>

                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 rounded-xl bg-white p-3 md:flex-row md:items-center md:justify-between">
                        <div className="text-sm text-slate-600">
                            <p>
                                <span className="font-medium text-slate-700">Trạng thái:</span> {STATUS_LABELS[order.status]}
                            </p>
                            <p>
                                <span className="font-medium text-slate-700">Tổng tiền:</span> {currencyFormatter.format(order.totalAmount)}
                            </p>
                        </div>

                        <Button onClick={onRebuy} className="bg-yellow-500 text-white hover:bg-yellow-600">
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Mua lại
                        </Button>
                    </div>
                </div>
            )
            }
        </article >
    );
}
