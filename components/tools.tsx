"use client";

import { useEffect, useState } from "react";
import { Bell, Menu, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";

const Tools = () => {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const { logout } = useAuth();

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

    return (
        <div className="flex items-center gap-3">
            <div className="group relative">
                <button
                    type="button"
                    aria-label="Thong bao"
                    className="inline-flex items-center px-4 py-2 text-slate-700"
                >
                    <Bell className="h-6 w-6 cursor-pointer" strokeWidth={1.9} />
                </button>
                <div className="invisible absolute right-0 top-full z-40 mt-2 w-56 translate-y-1 rounded-xl border border-gray-200 bg-white p-1 opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    <span className="text-sm font-medium text-slate-700">Bạn không có thông báo nào</span>
                </div>
            </div>

            <Link
                href="/cart"
                aria-label="Gio hang"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-slate-700 transition-colors hover:bg-gray-50"
            >
                <span className="text-xl font-semibold leading-none">0</span>
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
                            className="h-4 w-auto"
                        />
                    }
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Tools;