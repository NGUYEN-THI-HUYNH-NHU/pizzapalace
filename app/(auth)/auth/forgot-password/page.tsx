"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { z } from "zod";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForgotPassword } from "@/hooks/use-forgot-password";

const sendCodeSchema = z.object({
    email: z.string().trim().email("Email không hợp lệ."),
});

const resetPasswordSchema = z
    .object({
        email: z.string().trim().email("Email không hợp lệ."),
        code: z.string().trim().regex(/^\d{6}$/, "Mã xác nhận gồm 6 chữ số."),
        newPassword: z.string().min(8, "Mật khẩu mới phải có ít nhất 8 ký tự."),
        confirmPassword: z.string().min(8, "Mật khẩu xác nhận phải có ít nhất 8 ký tự."),
    })
    .refine((value) => value.newPassword === value.confirmPassword, {
        message: "Mật khẩu xác nhận không khớp.",
        path: ["confirmPassword"],
    });

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [validationError, setValidationError] = useState("");
    const [isCodeSent, setIsCodeSent] = useState(false);
    const { isSendingCode, isResetting, errorMessage, clearError, sendCode, resetPassword } = useForgotPassword();

    const handleSendCode = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setValidationError("");
        clearError();

        const parsed = sendCodeSchema.safeParse({ email });

        if (!parsed.success) {
            setValidationError(parsed.error.issues[0]?.message || "Thông tin không hợp lệ.");
            return;
        }

        const sent = await sendCode(parsed.data.email.toLowerCase());

        if (!sent) {
            return;
        }

        setIsCodeSent(true);
        toast.success("Nếu email tồn tại, mã xác nhận đã được gửi.");
    };

    const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setValidationError("");
        clearError();

        const parsed = resetPasswordSchema.safeParse({
            email,
            code,
            newPassword,
            confirmPassword,
        });

        if (!parsed.success) {
            setValidationError(parsed.error.issues[0]?.message || "Thông tin không hợp lệ.");
            return;
        }

        const success = await resetPassword({
            ...parsed.data,
            email: parsed.data.email.toLowerCase(),
        });

        if (!success) {
            return;
        }

        toast.success("Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.");
        router.push("/auth/sign-in");
        router.refresh();
    };

    return (
        <div className="px-4 py-10">
            <section className="mx-auto w-full max-w-md rounded-2xl border bg-white p-6 shadow-xl">
                <h1 className="text-3xl font-bold text-yellow-500 flex justify-center">Quên mật khẩu</h1>
                <p className="mt-2 text-sm text-slate-600">
                    Nhập email để nhận mã xác nhận và đặt lại mật khẩu.
                </p>

                <form className="mt-6 space-y-5" onSubmit={handleSendCode}>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <FieldContent>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="Ví dụ: user@example.com"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    required
                                    className="h-11 rounded-xl border-yellow-200 bg-white px-3 text-slate-800 focus-visible:border-yellow-500 focus-visible:ring-yellow-500/30"
                                />
                            </FieldContent>
                        </Field>
                    </FieldGroup>

                    <button
                        type="submit"
                        disabled={isSendingCode}
                        className="h-11 w-full rounded-xl border border-yellow-500 bg-white text-sm font-semibold text-yellow-600 transition hover:bg-yellow-50 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSendingCode ? "Đang gửi mã..." : isCodeSent ? "Gửi lại mã" : "Gửi mã xác nhận"}
                    </button>
                </form>

                <form className="mt-6 space-y-5" onSubmit={handleResetPassword}>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="code">Mã xác nhận</FieldLabel>
                            <FieldContent>
                                <Input
                                    id="code"
                                    name="code"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]{6}"
                                    placeholder="Nhập mã 6 chữ số"
                                    value={code}
                                    onChange={(event) => setCode(event.target.value)}
                                    required
                                    className="h-11 rounded-xl border-yellow-200 bg-white px-3 text-slate-800 focus-visible:border-yellow-500 focus-visible:ring-yellow-500/30"
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
                                    placeholder="Nhập mật khẩu mới"
                                    value={newPassword}
                                    onChange={(event) => setNewPassword(event.target.value)}
                                    required
                                    className="h-11 rounded-xl border-yellow-200 bg-white px-3 text-slate-800 focus-visible:border-yellow-500 focus-visible:ring-yellow-500/30"
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
                                    placeholder="Nhập lại mật khẩu mới"
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    required
                                    className="h-11 rounded-xl border-yellow-200 bg-white px-3 text-slate-800 focus-visible:border-yellow-500 focus-visible:ring-yellow-500/30"
                                />
                            </FieldContent>
                        </Field>
                    </FieldGroup>

                    <FieldError>{validationError || errorMessage}</FieldError>

                    <button
                        type="submit"
                        disabled={isResetting}
                        className="h-11 w-full rounded-xl bg-yellow-500 text-sm font-semibold text-white transition hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isResetting ? "Đang đặt lại mật khẩu..." : "Đặt lại mật khẩu"}
                    </button>
                </form>

                <p className="mt-5 text-center text-sm text-slate-600">
                    Đã nhớ mật khẩu?{" "}
                    <Link href="/auth/sign-in" className="font-semibold text-yellow-500 hover:text-yellow-600">
                        Quay lại đăng nhập
                    </Link>
                </p>
            </section>
        </div>
    );
}
