import { Bell, Menu, ShoppingCart } from "lucide-react";
import Link from "next/link";

const Tools = () => {
    return (
        <div className="flex items-center gap-3">
            <button
                type="button"
                aria-label="Thong bao"
                className="inline-flex items-center px-4 py-3 text-slate-700"
            >
                <Bell className="h-5 w-5" strokeWidth={1.9} />
            </button>

            <Link
                href="/cart"
                aria-label="Gio hang"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-3 text-slate-700 transition-colors hover:bg-gray-50"
            >
                <span className="text-xl font-semibold leading-none">0</span>
                <ShoppingCart className="h-5 w-5" strokeWidth={2} />
            </Link>

            <button
                type="button"
                aria-label="Mo menu"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-3 text-slate-700 transition-colors hover:bg-gray-50"
            >
                <Menu className="h-5 w-5" strokeWidth={2.2} />
            </button>
        </div>
    );
};

export default Tools;