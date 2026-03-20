"use client";

import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useChangePassword } from "@/hooks/use-change-password";

const ChangePasswordPage = () => {
    const router = useRouter();
    const { logout } = useAuth();
    const { isSubmitting, errorMessage, clearError, changePassword } = useChangePassword();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        clearError();

        const form = event.currentTarget;
        const formData = new FormData(form);
        const currentPassword = String(formData.get("currentPassword") || "");
        const newPassword = String(formData.get("newPassword") || "");
        const confirmPassword = String(formData.get("confirmPassword") || "");

        const isChanged = await changePassword({
            currentPassword,
            newPassword,
            confirmPassword,
        });

        if (!isChanged) {
            return;
        }

        toast.success("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
        form.reset();

        await logout({
            redirectTo: "/auth/sign-in",
            showToast: false,
        });
    };

    return (
        <div className="px-4 py-10">
            <section className="mx-auto w-full max-w-xl rounded-2xl border bg-white p-6 shadow-xl">
                <h1 className="text-3xl font-bold text-yellow-500">Đổi mật khẩu</h1>
                <p className="mt-2 text-sm text-slate-600">Cập nhật mật khẩu để bảo mật tài khoản của bạn.</p>

                <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="currentPassword">Mật khẩu hiện tại</FieldLabel>
                            <FieldContent>
                                <Input
                                    id="currentPassword"
                                    name="currentPassword"
                                    type="password"
                                    autoComplete="current-password"
                                    disabled={isSubmitting}
                                    className="h-11 rounded-xl border-yellow-200 focus-visible:border-yellow-500 focus-visible:ring-yellow-500/30"
                                    required
                                />
                            </FieldContent>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="newPassword">Mật khẩu mới</FieldLabel>
                            <FieldContent>
                                <Input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    minLength={8}
                                    disabled={isSubmitting}
                                    className="h-11 rounded-xl border-yellow-200 focus-visible:border-yellow-500 focus-visible:ring-yellow-500/30"
                                    required
                                />
                            </FieldContent>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="confirmPassword">Xác nhận mật khẩu mới</FieldLabel>
                            <FieldContent>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    minLength={8}
                                    disabled={isSubmitting}
                                    className="h-11 rounded-xl border-yellow-200 focus-visible:border-yellow-500 focus-visible:ring-yellow-500/30"
                                    required
                                />
                            </FieldContent>
                        </Field>
                    </FieldGroup>

                    <FieldError>{errorMessage}</FieldError>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-11 flex-1 rounded-xl bg-yellow-500 text-sm font-semibold text-white transition hover:bg-yellow-600"
                        >
                            {isSubmitting ? "Đang xử lý..." : "Xác nhận đổi mật khẩu"}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push("/profile")}
                            disabled={isSubmitting}
                            className="h-11 flex-1 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-gray-50"
                        >
                            Quay lại hồ sơ
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
};

export default ChangePasswordPage;
