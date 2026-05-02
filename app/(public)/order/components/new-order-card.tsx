"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, currencyFormatter, formatDateTime } from "@/lib/utils";
import { Order, OrderItem, OrderStatus, Product } from "@/type";
import { CopyIcon, Eye, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  PAYMENT_LABELS,
  STATUS_COLOR_MAP,
  STATUS_LABELS,
} from "@/lib/order-utils";

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

const getStepIndex = (status: StatusStep) => STATUS_STEPS.indexOf(status);

const getProgressPercent = (status: OrderStatus) => {
  const stepIndex = getStepIndex(status as StatusStep);
  const maxStep = STATUS_STEPS.length - 1;
  return Math.round((stepIndex / maxStep) * 100);
};

const getStepLeftPercent = (stepStatus: StatusStep) => {
  const stepIndex = getStepIndex(stepStatus);
  return (
    TRACK_LEFT_PERCENT +
    (stepIndex / (STATUS_STEPS.length - 1)) * TRACK_WIDTH_PERCENT
  );
};

const isStepDone = (currentStepIndex: number, stepStatus: StatusStep) =>
  getStepIndex(stepStatus) <= currentStepIndex;

const renderStatusBadge = (status: OrderStatus) => {
  const colorMap = STATUS_COLOR_MAP[status];
  return (
    <Badge variant="outline" className={cn(colorMap.className)}>
      {colorMap.label}
    </Badge>
  );
};

interface NewOrderCardProps {
  order: Order;
  productCatalog: Record<string, Product | undefined>;
  onOrderUpdated?: (order: Order) => void;
}

const getItemImage = (
  item: OrderItem,
  productCatalog: Record<string, Product | undefined>,
) => {
  return (
    productCatalog[item.productId]?.img || "https://via.placeholder.com/128"
  );
};

const getSelectedOptionLabel = (
  option: OrderItem["selectedOptions"][number],
  productCatalog: Record<string, Product | undefined>,
) => {
  let label = "";

  if (option.productId) {
    const productName = productCatalog[option.productId]?.name;
    if (productName) {
      label = productName;
    }
  }

  if (!label) {
    label = option.v;
  }

  if (option.crustSize) {
    label += ` - Cỡ ${option.crustSize}`;
  }

  if (option.crustName) {
    label += ` - Đế ${option.crustName}`;
  }

  return label;
};

export function NewOrderCard({
  order,
  productCatalog,
  onOrderUpdated,
}: NewOrderCardProps) {
  const progress = getProgressPercent(order.status);
  const currentStepIndex = getStepIndex(order.status as StatusStep);
  const itemCount = order.orderItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const canCancel = order.status === OrderStatus.PENDING;

  const onCopy = async () => {
    await navigator.clipboard.writeText(order.id);
    toast.success("Mã đơn đã được sao chép vào clipboard.");
  };

  const onCancelOrder = async () => {
    try {
      setIsCancelling(true);

      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: OrderStatus.CANCELLED,
          cancelReason: cancelReason.trim() || undefined,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Không thể hủy đơn hàng.");
      }

      if (payload?.order) {
        onOrderUpdated?.(payload.order as Order);
      }

      toast.success("Đã gửi yêu cầu hủy đơn hàng.");
      setIsCancelOpen(false);
      setCancelReason("");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Không thể hủy đơn hàng.";
      toast.error(errorMessage);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <article className="rounded-2xl border border-yellow-100 bg-linear-to-r from-yellow-50 to-white p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm text-slate-500">Mã đơn</p>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold text-slate-800">
                {order.id}
              </p>
              <Button variant="outline" size="sm" onClick={onCopy}>
                <CopyIcon className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-slate-500">{itemCount} sản phẩm</p>
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
            <div className="relative flex justify-center">
              <div className="h-2 w-[75%] overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-yellow-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
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

            <div className="grid grid-cols-4 gap-2">
              {STATUS_STEPS.map((stepStatus) => {
                const isDone = isStepDone(currentStepIndex, stepStatus);

                return (
                  <span
                    key={stepStatus}
                    className={`py-2 text-center text-xs ${isDone ? "font-semibold text-slate-700" : "text-slate-400"}`}
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

        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          <Button variant="outline" onClick={() => setIsDetailOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Xem chi tiết
          </Button>
          {canCancel ? (
            <Button variant="destructive" onClick={() => setIsCancelOpen(true)}>
              Hủy đơn hàng
            </Button>
          ) : null}
        </div>
      </article>

      {isDetailOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="overflow-y-auto p-4">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Chi tiết đơn hàng
                  </h3>
                  <p className="text-sm text-slate-500">{order.id}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDetailOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Khách hàng</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {order.customerName}
                  </p>
                  <p className="text-sm text-slate-600">
                    {order.customerPhone}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Địa chỉ giao hàng</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {order.customerAddress}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Thanh toán</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {PAYMENT_LABELS[order.paymentMethod]}
                  </p>
                  <p className="text-sm text-slate-600">
                    {order.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-100 bg-white p-3">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-800">
                    Danh sách sản phẩm
                  </h4>
                  <p className="text-xs text-slate-500">
                    {order.orderItems.length} dòng sản phẩm
                  </p>
                </div>

                <div className="space-y-3">
                  {order.orderItems.map((item, itemIndex) => {
                    const itemImage = getItemImage(item, productCatalog);
                    const lineTotal = item.price * item.quantity;

                    return (
                      <div
                        key={`${order.id}-${item.productId}-${item.sku}-${itemIndex}`}
                        className="flex gap-3 rounded-xl border border-gray-100 p-3"
                      >
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={itemImage}
                            alt={item.productName}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="overflow-hidden text-ellipsis font-medium text-slate-800">
                                {item.productName}
                              </p>
                              {item.crustSize ? (
                                <p className="text-xs text-slate-500">
                                  Cỡ: {item.crustSize}
                                </p>
                              ) : null}
                              {item.crustName ? (
                                <p className="text-xs text-slate-500">
                                  Đế: {item.crustName}
                                </p>
                              ) : null}
                            </div>
                            <div className="shrink-0 text-end">
                              <p className="text-sm font-semibold text-slate-800">
                                {currencyFormatter.format(lineTotal)}
                              </p>
                              <p className="text-sm text-slate-500">
                                {item.quantity} x{" "}
                                {currencyFormatter.format(item.price)}
                              </p>
                            </div>
                          </div>

                          {item.selectedOptions.length > 0 ? (
                            <div className="mt-2 flex flex-col gap-2">
                              {item.selectedOptions.map(
                                (option, optionIndex) => (
                                  <div
                                    key={`${item.productId}-${option.k}-${option.v}-${optionIndex}`}
                                    className="flex flex-col gap-2 rounded-sm bg-slate-100 px-2 py-1"
                                  >
                                    <span className="text-sm text-slate-500">
                                      {option.k}
                                    </span>
                                    <span className="text-sm text-slate-900">
                                      {getSelectedOptionLabel(
                                        option,
                                        productCatalog,
                                      )}
                                    </span>
                                  </div>
                                ),
                              )}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  <span className="font-medium text-slate-700">Tổng tiền:</span>{" "}
                  {currencyFormatter.format(order.totalAmount)}
                </p>
                <Button onClick={() => setIsDetailOpen(false)}>Đóng</Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isCancelOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              Hủy đơn hàng
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Chỉ có thể hủy đơn khi đơn đang ở trạng thái đã tiếp nhận.
            </p>

            <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
              <p>
                <span className="font-medium">Mã đơn:</span> {order.id}
              </p>
              <p>
                <span className="font-medium">Khách hàng:</span>{" "}
                {order.customerName}
              </p>
              <p>
                <span className="font-medium">SĐT:</span> {order.customerPhone}
              </p>
              <p>
                <span className="font-medium">Tổng tiền:</span>{" "}
                {currencyFormatter.format(order.totalAmount)}
              </p>
            </div>

            <div className="mt-4 space-y-2">
              <label
                htmlFor={`cancel-reason-${order.id}`}
                className="text-sm font-medium text-slate-700"
              >
                Lý do hủy đơn
              </label>
              <textarea
                id={`cancel-reason-${order.id}`}
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                placeholder="Nhập lý do hủy (không bắt buộc)"
                rows={4}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCancelOpen(false);
                  setCancelReason("");
                }}
              >
                Đóng
              </Button>
              <Button
                variant="destructive"
                disabled={isCancelling}
                onClick={onCancelOrder}
              >
                {isCancelling ? "Đang hủy..." : "Xác nhận hủy"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
