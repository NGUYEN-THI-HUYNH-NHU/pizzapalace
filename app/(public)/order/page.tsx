"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn, currencyFormatter, formatDateTime } from "@/lib/utils";
import { Order, OrderStatus } from "@/type";
import { io, type Socket } from "socket.io-client";
import { PAYMENT_LABELS, STATUS_COLOR_MAP, STATUS_LABELS } from "@/lib/order-utils";
import toast from "react-hot-toast";
import { CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_STEPS = [
    OrderStatus.PENDING,
    OrderStatus.PREPARING,
    OrderStatus.DELIVERING,
    OrderStatus.COMPLETED,
] as const;

type StatusStep = (typeof STATUS_STEPS)[number];
const TRACK_LEFT_PERCENT = 12.5;
const TRACK_WIDTH_PERCENT = 75;

const STATUS_ICON_MAP: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: "/pending.svg",
    [OrderStatus.PREPARING]: "/preparing.svg",
    [OrderStatus.DELIVERING]: "/delivering.svg",
    [OrderStatus.COMPLETED]: "/completed.svg",
    [OrderStatus.CANCELLED]: "/canceled.svg",
};

type OrderListResponse = {
    orders: Order[];
};

type SessionResponse = {
    id?: string;
};

type RealtimeOrderPayload = {
    order?: Order;
};

const upsertOrder = (current: Order[], incomingOrder: Order) => {
    const existingIndex = current.findIndex((order) => order.id === incomingOrder.id);
    if (existingIndex === -1) {
        return [incomingOrder, ...current];
    }

    const next = [...current];
    next[existingIndex] = incomingOrder;
    return next;
};

const getStepIndex = (status: StatusStep) => STATUS_STEPS.indexOf(status);

const getProgressPercent = (status: OrderStatus) => {
    const stepIndex = getStepIndex(status as StatusStep);
    const maxStep = STATUS_STEPS.length - 1;
    return Math.round((stepIndex / maxStep) * 100);
};

const getStepLeftPercent = (stepStatus: StatusStep) => {
    const stepIndex = getStepIndex(stepStatus);
    return TRACK_LEFT_PERCENT + (stepIndex / (STATUS_STEPS.length - 1)) * TRACK_WIDTH_PERCENT;
};

const isStepDone = (currentStepIndex: number, stepStatus: StatusStep) =>
    getStepIndex(stepStatus) <= currentStepIndex;

const renderStatusBadge = (status: OrderStatus) => {
    const colorMap = STATUS_COLOR_MAP[status];
    return <Badge variant="outline" className={cn(colorMap.className)}>{colorMap.label}</Badge>;
};

const OrderPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch("/api/orders", { cache: "no-store" });
                if (!res.ok) {
                    throw new Error(`Failed to fetch orders: ${res.status}`);
                }

                const data = (await res.json()) as OrderListResponse;
                setOrders(Array.isArray(data.orders) ? data.orders : []);
            } catch (error) {
                console.error("Loi fetch orders:", error);
                setLoadError("Không thể tải danh sách đơn hàng. Vui lòng thử lại.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, []);

    useEffect(() => {
        const realtimeUrl = process.env.NEXT_PUBLIC_REALTIME_URL;

        let socket: Socket | null = null;

        const initRealtime = async () => {
            const sessionResponse = await fetch("/api/auth/session", { cache: "no-store" });
            if (!sessionResponse.ok) {
                return;
            }

            const sessionPayload = (await sessionResponse.json()) as SessionResponse;
            if (!sessionPayload?.id) {
                return;
            }

            socket = io(realtimeUrl, {
                transports: ["websocket"],
            });

            socket.on("connect", () => {
                socket?.emit("join:user", { userId: sessionPayload.id });
            });

            socket.on("order:updated", (payload: RealtimeOrderPayload) => {
                const incomingOrder = payload?.order;
                if (!incomingOrder) {
                    return;
                }

                setOrders((current) => upsertOrder(current, incomingOrder));
            });
        };

        initRealtime().catch((error) => {
            console.error("Lỗi khởi tạo order realtime.", error);
        });

        return () => {
            socket?.disconnect();
        };
    }, []);

    const activeOrders = orders.filter(
        (order) => order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED
    );
    const historyOrders = orders.filter(
        (order) => order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED
    );

    const onCopy = (orderId: string) => {
        navigator.clipboard.writeText(orderId);
        toast.success("Mã đơn đã được sao chép vào clipboard.");
    };

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
                        {activeOrders.map((order) => {
                            const progress = getProgressPercent(order.status);
                            const currentStepIndex = getStepIndex(order.status as StatusStep);

                            return (
                                <article
                                    key={order.id}
                                    className="rounded-2xl border border-yellow-100 bg-linear-to-r from-yellow-50 to-white p-4"
                                >
                                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm text-slate-500">Mã đơn</p>
                                            <div className="flex flex-row items-center gap-2">
                                                <p className="text-base font-semibold text-slate-800">{order.id}</p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onCopy(order.id)}
                                                >
                                                    <CopyIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {renderStatusBadge(order.status)}
                                            <p className="text-sm font-semibold text-slate-700">
                                                {currencyFormatter.format(order.totalAmount)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <div className="space-y-3">
                                            {/* Progress bar */}
                                            <div className="relative flex justify-center">
                                                <div className="h-2 w-[75%] overflow-hidden rounded-full bg-slate-200">
                                                    <div
                                                        className="h-full rounded-full bg-yellow-500 transition-all duration-300"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>

                                                {/* Icons overlay on progress bar */}
                                                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
                                                    {STATUS_STEPS.map((stepStatus) => {
                                                        const isDone = isStepDone(currentStepIndex, stepStatus);
                                                        const leftPercent = getStepLeftPercent(stepStatus);

                                                        return (
                                                            <div
                                                                key={stepStatus}
                                                                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                                                                style={{ left: `${leftPercent}%` }}
                                                            >
                                                                <div
                                                                    className="flex items-center justify-center rounded-full p-1 transition-all duration-300"
                                                                    style={{
                                                                        backgroundColor: isDone
                                                                            ? "rgb(250 250 250)"
                                                                            : "rgb(226 232 240)",
                                                                    }}
                                                                >
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img
                                                                        src={STATUS_ICON_MAP[stepStatus]}
                                                                        alt={STATUS_LABELS[stepStatus]}
                                                                        width={28}
                                                                        height={28}
                                                                        style={{
                                                                            filter: isDone
                                                                                ? "none"
                                                                                : "grayscale(1) opacity(0.5)",
                                                                            transition: "filter 0.3s ease",
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Labels */}
                                            <div className="grid grid-cols-4 gap-2">
                                                {STATUS_STEPS.map((stepStatus) => {
                                                    const isDone = isStepDone(currentStepIndex, stepStatus);

                                                    return (
                                                        <span
                                                            key={stepStatus}
                                                            className={`text-center text-xs py-2 ${isDone ? "font-semibold text-slate-700" : "text-slate-400"
                                                                }`}
                                                        >
                                                            {STATUS_LABELS[stepStatus]}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1 text-sm text-slate-600">
                                        <p>
                                            <span className="font-medium text-slate-700">Đặt lúc:</span>{" "}
                                            {formatDateTime(order.createdAt)}
                                        </p>
                                        <p>
                                            <span className="font-medium text-slate-700">Thanh toán:</span>{" "}
                                            {PAYMENT_LABELS[order.paymentMethod]}
                                            {order.isPaid ? " (đã thanh toán)" : " (chưa thanh toán)"}
                                        </p>
                                    </div>
                                </article>
                            );
                        })}
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
                            <article
                                key={order.id}
                                className="rounded-xl border border-gray-100 bg-white p-4 hover:bg-slate-50"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="flex flex-row items-center gap-2">
                                            <p className="text-sm text-slate-500">{order.id}</p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onCopy(order.id)}
                                            >
                                                <CopyIcon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <p className="text-sm text-slate-700">{formatDateTime(order.createdAt)}</p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {renderStatusBadge(order.status)}
                                        <p className="text-sm font-semibold text-slate-700">
                                            {currencyFormatter.format(order.totalAmount)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-3 border-t border-dashed border-gray-200 pt-3 text-sm text-slate-600">
                                    {order.orderItems.map((item) => (
                                        <p key={`${order.id}-${item.productId}`}>
                                            {item.quantity} x {item.productName} {(item.crustName && item.crustSize) ? `(${item.crustName} - ${item.crustSize})` : ''}
                                        </p>
                                    ))}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default OrderPage;
