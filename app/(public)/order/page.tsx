"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { currencyFormatter, formatDateTime } from "@/lib/utils";
import { Order, OrderStatus, PaymentMethod } from "@/type";

const STATUS_STEPS = [
    OrderStatus.PENDING,
    OrderStatus.PREPARING,
    OrderStatus.DELIVERING,
    OrderStatus.COMPLETED,
] as const;

type StatusStep = (typeof STATUS_STEPS)[number];
const TRACK_LEFT_PERCENT = 12.5;
const TRACK_WIDTH_PERCENT = 75;

const STATUS_LABEL: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: "Đã tiếp nhận",
    [OrderStatus.PREPARING]: "Đang chuẩn bị",
    [OrderStatus.DELIVERING]: "Đang giao",
    [OrderStatus.COMPLETED]: "Hoàn tất",
    [OrderStatus.CANCELLED]: "Đã hủy",
};

const STATUS_ICON_MAP: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: "/pending.svg",
    [OrderStatus.PREPARING]: "/preparing.svg",
    [OrderStatus.DELIVERING]: "/delivering.svg",
    [OrderStatus.COMPLETED]: "/completed.svg",
    [OrderStatus.CANCELLED]: "/canceled.svg",
};

const STATUS_COLOR_MAP: Record<OrderStatus, { light: string; dark: string }> = {
    [OrderStatus.PENDING]: { light: "rgb(219 234 254)", dark: "rgb(30 58 138)" }, // xanh dương light/dark
    [OrderStatus.PREPARING]: { light: "rgb(254 243 199)", dark: "rgb(161 98 7)" }, // vàng light/dark
    [OrderStatus.DELIVERING]: { light: "rgb(254 237 215)", dark: "rgb(154 52 18)" }, // cam light/dark
    [OrderStatus.COMPLETED]: { light: "rgb(220 252 231)", dark: "rgb(22 101 52)" }, // xanh lá light/dark
    [OrderStatus.CANCELLED]: { light: "rgb(254 226 226)", dark: "rgb(127 29 29)" }, // đỏ light/dark
};

type OrderListResponse = {
    orders: Order[];
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
    if (status === OrderStatus.COMPLETED)
        return <Badge className="bg-emerald-100 text-emerald-700">{STATUS_LABEL[status]}</Badge>;

    if (status === OrderStatus.CANCELLED)
        return <Badge className="bg-rose-100 text-rose-700">{STATUS_LABEL[status]}</Badge>;

    return <Badge className="bg-yellow-100 text-yellow-700">{STATUS_LABEL[status]}</Badge>;
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
                setLoadError("Khong the tai danh sach don hang. Vui long thu lai.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const activeOrders = orders.filter(
        (order) => order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED
    );
    const historyOrders = orders.filter(
        (order) => order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED
    );

    if (isLoading) {
        return (
            <div className="mx-auto w-full max-w-5xl py-6">
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Dang tai don hang...</p>
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
                                            <p className="text-base font-semibold text-slate-800">{order.id}</p>
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
                                                        const colors = STATUS_COLOR_MAP[stepStatus];
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
                                                                            ? colors.light
                                                                            : "rgb(226 232 240)",
                                                                    }}
                                                                >
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img
                                                                        src={STATUS_ICON_MAP[stepStatus]}
                                                                        alt={STATUS_LABEL[stepStatus]}
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
                                                            {STATUS_LABEL[stepStatus]}
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
                                            {order.paymentMethod === PaymentMethod.CASH ? "Tiền mặt" : "Trực tuyến"}
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
                                        <p className="text-sm text-slate-500">{order.id}</p>
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
                                        <p key={`${order.id}-${item.sku}`}>
                                            {item.quantity} x {item.productName}
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
