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

const MOCK_ORDERS: Order[] = [
    {
        id: "PP-20260323-0184",
        customerName: "Nguyen Van A",
        customerPhone: "0901234567",
        customerAddress: "12 Nguyen Hue, Quan 1, TP.HCM",
        userId: "u_1",
        user: null,
        totalAmount: 329000,
        status: OrderStatus.PREPARING,
        paymentMethod: PaymentMethod.CASH,
        isPaid: false,
        createdAt: "2026-03-23T11:20:00.000Z",
        updatedAt: "2026-03-23T11:28:00.000Z",
        orderItems: [
            {
                productId: "p_1",
                productName: "Combo Family",
                sku: "COMBO-FAM-01",
                price: 259000,
                quantity: 1,
                selectedOptions: [],
            },
            {
                productId: "p_2",
                productName: "Coca Cola",
                sku: "DRINK-COKE-390",
                price: 35000,
                quantity: 2,
                selectedOptions: [],
            },
        ],
    },
    {
        id: "PP-20260323-0181",
        customerName: "Nguyen Van A",
        customerPhone: "0901234567",
        customerAddress: "12 Nguyen Hue, Quan 1, TP.HCM",
        userId: "u_1",
        user: null,
        totalAmount: 245000,
        status: OrderStatus.DELIVERING,
        paymentMethod: PaymentMethod.ONLINE,
        isPaid: true,
        createdAt: "2026-03-23T10:40:00.000Z",
        updatedAt: "2026-03-23T11:10:00.000Z",
        orderItems: [
            {
                productId: "p_3",
                productName: "Pizza Hai San",
                sku: "PIZZA-HS-L",
                price: 245000,
                quantity: 1,
                selectedOptions: [],
            },
        ],
    },
    {
        id: "PP-20260322-0175",
        customerName: "Nguyen Van A",
        customerPhone: "0901234567",
        customerAddress: "12 Nguyen Hue, Quan 1, TP.HCM",
        userId: "u_1",
        user: null,
        totalAmount: 189000,
        status: OrderStatus.COMPLETED,
        paymentMethod: PaymentMethod.CASH,
        isPaid: true,
        createdAt: "2026-03-22T17:22:00.000Z",
        updatedAt: "2026-03-22T18:01:00.000Z",
        orderItems: [
            {
                productId: "p_4",
                productName: "Pizza Pepperoni",
                sku: "PIZZA-PEP-M",
                price: 189000,
                quantity: 1,
                selectedOptions: [],
            },
        ],
    },
    {
        id: "PP-20260321-0169",
        customerName: "Nguyen Van A",
        customerPhone: "0901234567",
        customerAddress: "12 Nguyen Hue, Quan 1, TP.HCM",
        userId: "u_1",
        user: null,
        totalAmount: 119000,
        status: OrderStatus.CANCELLED,
        paymentMethod: PaymentMethod.ONLINE,
        isPaid: false,
        createdAt: "2026-03-21T19:10:00.000Z",
        updatedAt: "2026-03-21T19:18:00.000Z",
        orderItems: [
            {
                productId: "p_5",
                productName: "Mì Ý Bò Bằm",
                sku: "APP-SPA-BO",
                price: 119000,
                quantity: 1,
                selectedOptions: [],
            },
        ],
    },
];

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
    const activeOrders = MOCK_ORDERS.filter(
        (order) => order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED
    );
    const historyOrders = MOCK_ORDERS.filter(
        (order) => order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED
    );

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
