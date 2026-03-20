"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import Address from "./address";
import Tools from "./tools";

const PAGE_NAME_MAP: Record<string, string> = {
    "/auth/sign-in": "ĐĂNG NHẬP",
    "/auth/sign-up": "ĐĂNG KÝ",
    "/cart": "GIỎ HÀNG",
    "/order": "THEO DÕI ĐƠN HÀNG",
    "/profile": "HỒ SƠ CỦA TÔI",
    "/profile/change-password": "ĐỔI MẬT KHẨU",
    "/checkout": "THANH TOÁN",
};

const Header = () => {
    const pathname = usePathname();
    const isHome = pathname === "/";

    const currentPageName = useMemo(() => {
        if (isHome) {
            return "";
        }

        if (PAGE_NAME_MAP[pathname]) {
            return PAGE_NAME_MAP[pathname];
        }

        const segments = pathname.split("/").filter(Boolean);
        const fallbackSegment = segments[segments.length - 1] || "";

        return fallbackSegment
            .replace(/-/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    }, [isHome, pathname]);

    return (
        <div className="p-3 px-12">
            <div className="grid grid-cols-3">
                <div className="flex items-center gap-3">
                    <Address data="12, Nguyen Van Bao, ..." />
                </div>

                <div className="flex flex-col items-center justify-center">
                    <Link href="/" className="font-bold text-xl">
                        <p className="font-bold text-2xl">PizzaPalace</p>
                    </Link>
                </div>

                <div className="flex items-center justify-end">
                    <Tools />
                </div>
            </div>
            <div>
                {!isHome && (
                    <div className="mt-4 grid grid-cols-3">
                        <Link
                            href="/"
                            aria-label="Ve trang truoc"
                            className="flex items-center h-10 w-10 justify-center rounded-full border border-gray-200 bg-white text-slate-700 transition-colors hover:bg-gray-50"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <p className="flex flex-col items-center justify-center justify-items-center text-center text-xl font-bold">{currentPageName}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Header;