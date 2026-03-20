"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type SignInInput = {
    phone: string;
    password: string;
};

type LogoutOptions = {
    redirectTo?: string;
    showToast?: boolean;
    onLoggedOut?: () => void;
};

const buildSignInUrl = () => {
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

    if (!apiBase) {
        return null;
    }

    return apiBase.endsWith("/api") ? `${apiBase}/auth/sign-in` : `${apiBase}/api/auth/sign-in`;
};

export const useAuth = () => {
    const router = useRouter();
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [authError, setAuthError] = useState("");

    const clearAuthError = useCallback(() => {
        setAuthError("");
    }, []);

    const signIn = useCallback(
        async ({ phone, password }: SignInInput) => {
            clearAuthError();

            const signInUrl = buildSignInUrl();

            if (!signInUrl) {
                setAuthError("Thiếu cấu hình NEXT_PUBLIC_API_URL.");
                return false;
            }

            setIsSigningIn(true);
            try {
                const response = await fetch(signInUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone, password }),
                });

                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    setAuthError(data?.message || "Đăng nhập thất bại.");
                    return false;
                }

                const sessionUser = {
                    id: String(data?.id ?? data?.user?.id ?? "").trim(),
                    name: data?.name ?? data?.user?.name ?? null,
                    phone: data?.phone ?? data?.user?.phone ?? null,
                    address: data?.address ?? data?.user?.address ?? null,
                };

                if (!sessionUser.id) {
                    setAuthError("Dữ liệu đăng nhập không hợp lệ.");
                    return false;
                }

                const sessionResponse = await fetch("/api/auth/session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(sessionUser),
                });

                if (!sessionResponse.ok) {
                    setAuthError("Không thể tạo phiên đăng nhập.");
                    return false;
                }

                return true;
            } catch (error) {
                const detail = error instanceof Error ? `${error.message} (${signInUrl})` : signInUrl;
                setAuthError(`Không thể kết nối máy chủ. Vui lòng thử lại. ${detail}`);
                return false;
            } finally {
                setIsSigningIn(false);
            }
        },
        [clearAuthError]
    );

    const logout = useCallback(
        async (options?: LogoutOptions) => {
            const { redirectTo = "/", showToast = true, onLoggedOut } = options || {};
            setIsLoggingOut(true);

            try {
                await fetch("/api/auth/session", { method: "DELETE" });
            } catch {
                // Continue local logout flow when request fails.
            } finally {
                setIsLoggingOut(false);
            }

            window.dispatchEvent(new Event("auth-state-changed"));
            onLoggedOut?.();

            if (showToast) {
                toast.success("Bạn đã đăng xuất!");
            }

            router.push(redirectTo);
            router.refresh();
        },
        [router]
    );

    return {
        isSigningIn,
        isLoggingOut,
        authError,
        setAuthError,
        clearAuthError,
        signIn,
        logout,
    };
};
