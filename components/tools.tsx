"use client";

import { useEffect, useState } from "react";
import { Bell, Menu, ShoppingCart } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const Tools = () => {
    const [isSignedIn, setIsSignedIn] = useState(false);

    useEffect(() => {
        const syncAuthState = () => {
            setIsSignedIn(Boolean(localStorage.getItem("user")));
        };

        syncAuthState();
        window.addEventListener("storage", syncAuthState);

        return () => {
            window.removeEventListener("storage", syncAuthState);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        setIsSignedIn(false);
        toast.success("Bạn đã đăng xuất!");
        window.location.href = "/";
    };

    return (
        <div className="flex items-center gap-3">
            <button
                type="button"
                aria-label="Thong bao"
                className="inline-flex items-center px-4 py-2 text-slate-700"
            >
                <Bell className="h-6 w-6" strokeWidth={1.9} />
            </button>

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
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-slate-700 transition-colors hover:bg-gray-50"
                >
                    <Menu className="h-6 w-6" strokeWidth={2.2} />
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