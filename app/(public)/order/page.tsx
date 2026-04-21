'use client';

import { useEffect, useMemo, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

import { Order, Product } from '@/type';
import { OrderStatus } from '@/type';

import { NewOrderCard } from './components/new-order-card';
import { OldOrderCard } from './components/old-order-card';

type OrderListResponse = {
    orders: Order[];
};

type SessionResponse = {
    id?: string;
};

type RealtimeOrderPayload = {
    order?: Order;
};

const ACTIVE_STATUSES = new Set([OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.DELIVERING]);

const upsertOrder = (current: Order[], incomingOrder: Order) => {
    const existingIndex = current.findIndex((order) => order.id === incomingOrder.id);
    if (existingIndex === -1) {
        return [incomingOrder, ...current];
    }

    const next = [...current];
    next[existingIndex] = incomingOrder;
    return next;
};

export default function OrderPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/orders', { cache: 'no-store' });
                if (!res.ok) {
                    throw new Error(`Failed to fetch orders: ${res.status}`);
                }

                const data = (await res.json()) as OrderListResponse;
                setOrders(Array.isArray(data.orders) ? data.orders : []);
            } catch (error) {
                console.error('Loi fetch orders:', error);
                setLoadError('Không thể tải danh sách đơn hàng. Vui lòng thử lại.');
            } finally {
                setIsLoading(false);
            }
        };

        const fetchProducts = async () => {
            try {
                const catalog = await fetch('/api/product-catalog')
                    .then((response) => response.json())
                    .catch(() => []);

                setProducts(Array.isArray(catalog) ? catalog : []);
            } catch (error) {
                console.error('Không thể tải catalog sản phẩm:', error);
            }
        };

        fetchOrders();
        fetchProducts();
    }, []);

    useEffect(() => {
        const realtimeUrl = process.env.NEXT_PUBLIC_REALTIME_URL;

        let socket: Socket | null = null;

        const initRealtime = async () => {
            const sessionResponse = await fetch('/api/auth/session', { cache: 'no-store' });
            if (!sessionResponse.ok) {
                return;
            }

            const sessionPayload = (await sessionResponse.json()) as SessionResponse;
            if (!sessionPayload?.id) {
                return;
            }

            socket = io(realtimeUrl, {
                transports: ['websocket'],
            });

            socket.on('connect', () => {
                socket?.emit('join:user', { userId: sessionPayload.id });
            });

            socket.on('order:updated', (payload: RealtimeOrderPayload) => {
                const incomingOrder = payload?.order;
                if (!incomingOrder) {
                    return;
                }

                setOrders((current) => upsertOrder(current, incomingOrder));
            });
        };

        initRealtime().catch((error) => {
            console.error('Lỗi khởi tạo order realtime.', error);
        });

        return () => {
            socket?.disconnect();
        };
    }, []);

    const productCatalog = useMemo(
        () => Object.fromEntries(products.map((product) => [product.id, product])) as Record<string, Product | undefined>,
        [products]
    );

    const activeOrders = orders.filter((order) => ACTIVE_STATUSES.has(order.status));
    const historyOrders = orders.filter((order) => !ACTIVE_STATUSES.has(order.status));

    if (isLoading) {
        return (
            <div className="mx-auto w-full max-w-5xl py-6">
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Đang tải đơn hàng...</p>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="mx-auto w-full max-w-5xl py-6">
                <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{loadError}</p>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-5xl space-y-8 py-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800">Đơn hàng đang thực hiện</h2>
                    <span className="text-sm text-slate-500">{activeOrders.length} đơn</span>
                </div>

                {activeOrders.length === 0 ? (
                    <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                        Hiện tại bạn không có đơn nào đang xử lý.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {activeOrders.map((order) => (
                            <NewOrderCard key={order.id} order={order} />
                        ))}
                    </div>
                )}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800">Lịch sử đặt hàng</h2>
                    <span className="text-sm text-slate-500">{historyOrders.length} đơn</span>
                </div>

                {historyOrders.length === 0 ? (
                    <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                        Bạn chưa có lịch sử đặt hàng.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {historyOrders.map((order) => (
                            <OldOrderCard key={order.id} order={order} productCatalog={productCatalog} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
