"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, Menu, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";
import { useCart } from "@/contexts/cart-context";
import { useOrderNotifications } from "@/hooks/use-order-notifications";
import { cn, formatDateTime } from "@/lib/utils";
import { OrderStatus } from "@/type";
import { STATUS_COLOR_MAP } from "@/lib/order-utils";
import { Badge } from "./ui/badge";

const Tools = () => {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const { logout } = useAuth();
    const { cartItems } = useCart();
    const { notifications, unreadCount, markAllAsRead, clearNotifications } = useOrderNotifications();

    useEffect(() => {
        const syncAuthState = async () => {
            try {
                const response = await fetch("/api/auth/session", {
                    method: "GET",
                    cache: "no-store",
                });

                setIsSignedIn(response.ok);
            } catch {
                setIsSignedIn(false);
            }
        };

        void syncAuthState();

        const handleAuthChanged = () => {
            void syncAuthState();
        };

        window.addEventListener("auth-state-changed", handleAuthChanged);

        return () => {
            window.removeEventListener("auth-state-changed", handleAuthChanged);
        };
    }, []);

    const handleLogout = () => {
        void logout({ onLoggedOut: () => setIsSignedIn(false) });
    };

    const renderStatusBadge = (status: OrderStatus) => {
        const colorMap = STATUS_COLOR_MAP[status];
        return <Badge variant="outline" className={cn(colorMap.className)}>{colorMap.label}</Badge>;
    };

    return (
        <div className="flex items-center gap-3">
            <div className="group relative">
                <button
                    type="button"
                    aria-label="Thong bao"
                    className="inline-flex items-center px-4 py-2 text-slate-700"
                >
                    <Bell className="h-6 w-6 cursor-pointer" strokeWidth={1.9} />
                    {unreadCount > 0 ? (
                        <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-semibold text-white">
                            {unreadCount}
                        </span>
                    ) : null}
                </button>
                <div className="invisible absolute right-0 top-full z-40 mt-2 w-80 translate-y-1 rounded-xl border border-gray-200 bg-white p-2 opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    <div className="mb-2 flex items-center justify-between px-1">
                        <span className="text-sm font-semibold text-slate-700">Thông báo đơn hàng</span>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={markAllAsRead}
                                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                            >
                                <CheckCheck className="h-3.5 w-3.5" />
                                Đánh dấu đã đọc
                            </button>
                            <button
                                type="button"
                                onClick={clearNotifications}
                                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Xóa hết
                            </button>
                        </div>
                    </div>

                    <div className="max-h-80 space-y-2 overflow-auto pr-1">
                        {notifications.length === 0 ? (
                            <div className="rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-600">
                                Bạn không có thông báo nào.
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`rounded-lg border p-3 ${notification.read ? "border-slate-200 bg-white" : "border-yellow-200 bg-yellow-50"}`}
                                >
                                    {renderStatusBadge(notification.status)}
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">{notification.title}</p>
                                        <p className="mt-1 text-xs text-slate-600">{notification.message}</p>
                                    </div>
                                    <p className="mt-2 text-[11px] text-slate-500">
                                        {formatDateTime(notification.createdAt)}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <Link
                href="/cart"
                aria-label="Gio hang"
                className={cartItems.length > 0
                    ? "inline-flex items-center gap-2 rounded-full border border-gray-200 bg-yellow-500 px-4 py-2 text-white transition-colors hover:bg-yellow-600"
                    : "inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-slate-700 transition-colors hover:bg-gray-50"}
            >
                <span className="text-xl font-semibold leading-none">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
                <ShoppingCart className="h-6 w-6" strokeWidth={2} />
            </Link>

            <div className="group relative">
                <button
                    type="button"
                    aria-label="Mo menu"
                    className="inline-flex gap-1 items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-slate-700 transition-colors cursor-pointer hover:bg-gray-50"
                >
                    <Menu className="h-6 w-6" strokeWidth={2.2} />
                    {isSignedIn &&
                        <Image
                            src="/account.png"
                            alt="account"
                            width={12}
                            height={12}
                            priority
                            className="h-5 w-auto" />}
                </button>

                <div className="invisible absolute right-0 top-full z-40 mt-2 w-56 translate-y-1 rounded-xl border border-gray-200 bg-white p-1 opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    <Link
                        href="/order"
                        className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-gray-100"
                    >
                        Theo dõi đơn hàng
                    </Link>

                    {isSignedIn ? (
                        <>
                            <Link
                                href="/profile"
                                className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-gray-100"
                            >
                                Hồ sơ của tôi
                            </Link>
                            <hr />
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-yellow-600 transition-colors hover:bg-red-50"
                            >
                                Đăng xuất
                            </button>
                        </>
                    ) : (
                        <>
                            <hr />
                            <Link
                                href="/auth/sign-in"
                                className="block rounded-lg px-3 py-2 text-sm font-medium text-yellow-600 transition-colors hover:bg-gray-100"
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                href="/auth/sign-up"
                                className="block rounded-lg px-3 py-2 text-sm font-medium text-yellow-600 transition-colors hover:bg-gray-100"
                            >
                                Đăng ký
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div >
    );
};

export default Tools;