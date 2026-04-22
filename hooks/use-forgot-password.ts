"use client";

import { useCallback, useState } from "react";

type ResetPasswordInput = {
    email: string;
    code: string;
    newPassword: string;
    confirmPassword: string;
};

export const useForgotPassword = () => {
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const clearError = useCallback(() => {
        setErrorMessage("");
    }, []);

    const sendCode = useCallback(async (email: string) => {
        clearError();

        setIsSendingCode(true);
        try {
            const response = await fetch("/api/auth/forgot-password/send-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                setErrorMessage(payload?.message || "Không thể gửi mã xác nhận.");
                return false;
            }

            return true;
        } catch {
            setErrorMessage("Không thể kết nối máy chủ. Vui lòng thử lại.");
            return false;
        } finally {
            setIsSendingCode(false);
        }
    }, [clearError]);

    const resetPassword = useCallback(async (input: ResetPasswordInput) => {
        clearError();

        setIsResetting(true);
        try {
            const response = await fetch("/api/auth/forgot-password/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(input),
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                setErrorMessage(payload?.message || "Đặt lại mật khẩu thất bại.");
                return false;
            }

            return true;
        } catch {
            setErrorMessage("Không thể kết nối máy chủ. Vui lòng thử lại.");
            return false;
        } finally {
            setIsResetting(false);
        }
    }, [clearError]);

    return {
        isSendingCode,
        isResetting,
        errorMessage,
        clearError,
        sendCode,
        resetPassword,
    };
};
