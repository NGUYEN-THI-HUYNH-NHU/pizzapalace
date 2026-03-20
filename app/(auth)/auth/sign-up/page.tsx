"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { z } from "zod";

import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

const signUpSchema = z
    .object({
        fullName: z.string().trim().min(1, "Họ tên không được để trống."),
        phone: z
            .string()
            .trim()
            .regex(/^(0|\+84)\d{9,10}$/, "Số điện thoại không hợp lệ."),
        password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự."),
        confirmPassword: z.string().min(8, "Mật khẩu xác nhận phải có ít nhất 8 ký tự."),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Mật khẩu xác nhận không khớp.",
        path: ["confirmPassword"],
    });

export default function SignUpPage() {
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage("");

        const form = e.currentTarget;

        const formData = new FormData(form);
        const parsed = signUpSchema.safeParse({
            fullName: String(formData.get("fullName") || ""),
            phone: String(formData.get("phone") || ""),
            password: String(formData.get("password") || ""),
            confirmPassword: String(formData.get("confirmPassword") || ""),
        });

        if (!parsed.success) {
            setErrorMessage(parsed.error.issues[0]?.message || "Thông tin không hợp lệ.");
            return;
        }


        const usersUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/users`;

        const { fullName, phone, password } = parsed.data;

        try {
            setIsSubmitting(true);

            const response = await fetch(usersUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: fullName,
                    phone,
                    password,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setErrorMessage(data?.message || "Đăng ký thất bại.");
                return;
            }

            form.reset();
            toast.success("Tạo tài khoản thành công! Bạn có thể đăng nhập ngay.");
        } catch {
            setErrorMessage("Không thể kết nối máy chủ. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="px-4 py-10">
            <section className="mx-auto w-full max-w-md rounded-2xl border bg-white shadow-xl p-6">
                <h1 className="text-3xl font-bold text-yellow-500 flex justify-center">Tạo tài khoản</h1>
                <p className="mt-2 text-sm text-slate-600">
                    Điền thông tin bên dưới để đăng ký và theo dõi đơn hàng nhanh hơn.
                </p>

                <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="fullName">Họ tên</FieldLabel>
                            <FieldContent>
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    autoComplete="name"
                                    placeholder="Nhập họ và tên"
                                    className="h-11 rounded-xl border-yellow-200 bg-white px-3 text-slate-800 focus-visible:border-yellow-500 focus-visible:ring-yellow-500/30"
                                />
                            </FieldContent>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="phone">Số điện thoại</FieldLabel>
                            <FieldContent>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    autoComplete="tel"
                                    inputMode="numeric"
                                    placeholder="Ví dụ: 0987654321"
                                    className="h-11 rounded-xl border-yellow-200 bg-white px-3 text-slate-800 focus-visible:border-yellow-500 focus-visible:ring-yellow-500/30"
                                />
                            </FieldContent>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                            <FieldContent>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Nhập mật khẩu"
                                    className="h-11 rounded-xl border-yellow-200 bg-white px-3 text-slate-800 focus-visible:border-yellow-500 focus-visible:ring-yellow-500/30"
                                    minLength={8}
                                />
                            </FieldContent>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="confirmPassword">Xác nhận mật khẩu</FieldLabel>
                            <FieldContent>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Nhập lại mật khẩu"
                                    className="h-11 rounded-xl border-yellow-200 bg-white px-3 text-slate-800 focus-visible:border-yellow-500 focus-visible:ring-yellow-500/30"
                                    minLength={8}
                                />
                            </FieldContent>
                        </Field>
                    </FieldGroup>

                    <FieldError>{errorMessage}</FieldError>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-4 h-11 w-full rounded-xl bg-yellow-500 text-sm font-semibold text-white transition hover:bg-yellow-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/40 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSubmitting ? "Đang tạo tài khoản..." : "Đăng ký"}
                    </button>
                </form>

                <p className="mt-5 text-center text-sm text-slate-600">
                    Bạn đã có tài khoản?{" "}
                    <Link href="/auth/sign-in" className="font-semibold text-yellow-500 hover:text-yellow-600">
                        Đăng nhập
                    </Link>
                </p>
            </section>
        </div>
    );
}
