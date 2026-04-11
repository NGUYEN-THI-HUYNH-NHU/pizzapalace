'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, currencyFormatter, formatDateTime } from '@/lib/utils';
import { Order, OrderStatus } from '@/type';
import { CopyIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { PAYMENT_LABELS, STATUS_COLOR_MAP, STATUS_LABELS } from '@/lib/order-utils';

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
    [OrderStatus.PENDING]: '/pending.svg',
    [OrderStatus.PREPARING]: '/preparing.svg',
    [OrderStatus.DELIVERING]: '/delivering.svg',
    [OrderStatus.COMPLETED]: '/completed.svg',
    [OrderStatus.CANCELLED]: '/canceled.svg',
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

interface NewOrderCardProps {
    order: Order;
}

export function NewOrderCard({ order }: NewOrderCardProps) {
    const progress = getProgressPercent(order.status);
    const currentStepIndex = getStepIndex(order.status as StatusStep);
    const itemCount = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);

    const onCopy = async () => {
        await navigator.clipboard.writeText(order.id);
        toast.success('Mã đơn đã được sao chép vào clipboard.');
    };

    return (
        <article className="rounded-2xl border border-yellow-100 bg-linear-to-r from-yellow-50 to-white p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                    <p className="text-sm text-slate-500">Mã đơn</p>
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-slate-800">{order.id}</p>
                        <Button variant="outline" size="sm" onClick={onCopy}>
                            <CopyIcon className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="text-sm text-slate-500">{itemCount} sản phẩm</p>
                </div>

                <div className="flex items-center gap-3">
                    {renderStatusBadge(order.status)}
                    <p className="text-sm font-semibold text-slate-700">{currencyFormatter.format(order.totalAmount)}</p>
                </div>
            </div>

            <div className="mb-4">
                <div className="space-y-3">
                    <div className="relative flex justify-center">
                        <div className="h-2 w-[75%] overflow-hidden rounded-full bg-slate-200">
                            <div className="h-full rounded-full bg-yellow-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                        </div>

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
                                                backgroundColor: isDone ? 'rgb(250 250 250)' : 'rgb(226 232 240)',
                                            }}
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={STATUS_ICON_MAP[stepStatus]}
                                                alt={STATUS_LABELS[stepStatus]}
                                                width={28}
                                                height={28}
                                                style={{
                                                    filter: isDone ? 'none' : 'grayscale(1) opacity(0.5)',
                                                    transition: 'filter 0.3s ease',
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        {STATUS_STEPS.map((stepStatus) => {
                            const isDone = isStepDone(currentStepIndex, stepStatus);

                            return (
                                <span
                                    key={stepStatus}
                                    className={`py-2 text-center text-xs ${isDone ? 'font-semibold text-slate-700' : 'text-slate-400'}`}
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
                    <span className="font-medium text-slate-700">Đặt lúc:</span> {formatDateTime(order.createdAt)}
                </p>
                <p>
                    <span className="font-medium text-slate-700">Thanh toán:</span> {PAYMENT_LABELS[order.paymentMethod]}
                    {order.isPaid ? ' (đã thanh toán)' : ' (chưa thanh toán)'}
                </p>
            </div>
        </article>
    );
}
