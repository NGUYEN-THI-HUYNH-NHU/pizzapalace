"use client";

import { useCallback, useState } from "react";

type LocalUser = {
    id?: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
};

type UpdateProfileInput = {
    name: string;
    email: string;
    phone: string;
    address?: string;
};

const phonePattern = /^(0|\+84)\d{9,10}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const useProfile = () => {
    const [user, setUser] = useState<LocalUser | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isHydrating, setIsHydrating] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const clearError = useCallback(() => {
        setErrorMessage("");
    }, []);

    const hydrateProfile = useCallback(async () => {
        setIsHydrating(true);
        try {
            const response = await fetch("/api/profile", {
                method: "GET",
                cache: "no-store",
            });

            if (!response.ok) {
                setUser(null);
                return false;
            }

            const sessionUser = (await response.json()) as LocalUser;
            setUser(sessionUser);
            return true;
        } catch {
            setUser(null);
            return false;
        } finally {
            setIsHydrating(false);
        }
    }, []);

    const updateProfile = useCallback(
        async ({ name, email, phone, address }: UpdateProfileInput) => {
            clearError();

            if (!user?.id) {
                setErrorMessage("Không tìm thấy mã người dùng.");
                return false;
            }

            if (!name) {
                setErrorMessage("Họ tên không được để trống.");
                return false;
            }

            if (!emailPattern.test(email.trim())) {
                setErrorMessage("Email không hợp lệ.");
                return false;
            }

            if (!phonePattern.test(phone)) {
                setErrorMessage("Số điện thoại không hợp lệ.");
                return false;
            }

            setIsLoading(true);
            try {
                const response = await fetch("/api/profile", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email: email.trim().toLowerCase(), phone, address }),
                });

                const payload = await response.json().catch(() => ({}));

                if (!response.ok) {
                    setErrorMessage(payload?.message || "Cập nhật thất bại.");
                    return false;
                }

                const updatedUser: LocalUser = {
                    ...user,
                    name: payload?.name ?? name,
                    email: payload?.email ?? email,
                    phone: payload?.phone ?? phone,
                    address: payload?.address ?? address ?? user.address,
                };

                setUser(updatedUser);
                return true;
            } catch (error) {
                const detail = error instanceof Error ? error.message : "unknown";
                setErrorMessage(`Lỗi kết nối. Vui lòng thử lại. (${detail})`);
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [clearError, user]
    );

    return {
        user,
        isLoading,
        isHydrating,
        errorMessage,
        clearError,
        hydrateProfile,
        updateProfile,
    };
};

export type { LocalUser };
