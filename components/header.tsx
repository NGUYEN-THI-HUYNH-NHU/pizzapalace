"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Address from "./address";
import Tools from "./tools";
import { useProfile } from "@/hooks/use-profile";
import AddressModal from "./address-modal";

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
  const { user, hydrateProfile } = useProfile();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressText, setAddressText] = useState<string | null>(null);

  useEffect(() => {
    void hydrateProfile();

    const handleAuthChanged = () => {
      void hydrateProfile();
    };

    window.addEventListener("auth-state-changed", handleAuthChanged);

    return () => {
      window.removeEventListener("auth-state-changed", handleAuthChanged);
    };
  }, [hydrateProfile]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pp_address");
      if (saved) {
        const parsed = JSON.parse(saved);
        const display = parsed.address
          ? parsed.address
          : parsed.city
            ? `${parsed.city.name} - ${parsed.district?.name ?? ""}`
            : null;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAddressText(display);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleAddressChanged = (ev: any) => {
        try {
          const payload =
            ev?.detail ??
            JSON.parse(localStorage.getItem("pp_address") || "null");
          if (!payload) return;
          const display = payload.address
            ? payload.address
            : payload.city
              ? `${payload.city.name} - ${payload.district?.name ?? ""}`
              : null;
          setAddressText(display);
        } catch (e) {
          // ignore
        }
      };

      window.addEventListener(
        "pp_address_changed",
        handleAddressChanged as EventListener
      );

      return () => {
        window.removeEventListener(
          "pp_address_changed",
          handleAddressChanged as EventListener
        );
      };
    } catch (e) {
      // ignore
    }
  }, []);

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
    <div className="py-3">
      <div className="grid grid-cols-3">
        <div className="flex items-center gap-3">
          <Address
            data={addressText ?? user?.address}
            onClick={() => setShowAddressModal(true)}
          />
          <AddressModal
            open={showAddressModal}
            onClose={() => setShowAddressModal(false)}
          />
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
            <p className="flex flex-col items-center justify-center justify-items-center text-center text-xl font-bold">
              {currentPageName}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
