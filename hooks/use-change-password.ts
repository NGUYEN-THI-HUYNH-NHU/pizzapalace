"use client";

import { useCallback, useState } from "react";

type ChangePasswordInput = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

export const useChangePassword = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const clearError = useCallback(() => {
        setErrorMessage("");
    }, []);

    const changePassword = useCallback(
        async ({ currentPassword, newPassword, confirmPassword }: ChangePasswordInput) => {
            clearError();

            if (!currentPassword || !newPassword || !confirmPassword) {
                setErrorMessage("Vui lòng nhập đầy đủ thông tin mật khẩu.");
                return false;
            }

            if (newPassword.length < 8) {
                setErrorMessage("Mật khẩu mới phải có ít nhất 8 ký tự.");
                return false;
            }

            if (newPassword !== confirmPassword) {
                setErrorMessage("Mật khẩu xác nhận không khớp.");
                return false;
            }

            setIsSubmitting(true);
            try {
                const response = await fetch("/api/profile/password", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
                });

                const payload = await response.json().catch(() => ({}));

                if (!response.ok) {
                    setErrorMessage(payload?.message || "Đổi mật khẩu thất bại.");
                    return false;
                }

                return true;
            } catch (error) {
                const detail = error instanceof Error ? error.message : "unknown";
                setErrorMessage(`Lỗi kết nối. Vui lòng thử lại. (${detail})`);
                return false;
            } finally {
                setIsSubmitting(false);
            }
        },
        [clearError]
    );

    return {
        isSubmitting,
        errorMessage,
        clearError,
        changePassword,
    };
};
