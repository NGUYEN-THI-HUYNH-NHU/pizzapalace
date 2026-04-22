"use client";

import { FormEvent } from "react";
import Link from "next/link";
import { z } from "zod";

import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const phonePattern = /^(0|\+84)\d{9,10}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signInSchema = z
    .object({
        identifier: z
            .string()
            .trim()
            .refine(
                (value) => phonePattern.test(value) || emailPattern.test(value),
                "Email hoặc số điện thoại không hợp lệ."
            ),
        password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự.")
    });

export default function SignInPage() {
    const { signIn, isSigningIn, authError, clearAuthError, setAuthError } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        clearAuthError();

        const form = e.currentTarget;

        const formData = new FormData(form);
        const parsed = signInSchema.safeParse({
            identifier: String(formData.get("identifier") || ""),
            password: String(formData.get("password") || ""),
        });

        if (!parsed.success) {
            setAuthError(parsed.error.issues[0]?.message || "Thông tin không hợp lệ.");
            return;
        }

        const { identifier, password } = parsed.data;

        const isSignedIn = await signIn({ identifier, password });

        if (!isSignedIn) {
            return;
        }

        form.reset();
        toast.success("Đăng nhập thành công!");

        router.push('/');
        router.refresh();
    };

    return (
        <div className="px-4 py-10">
            <section className="mx-auto w-full max-w-md rounded-2xl border bg-white shadow-xl p-6">
                <h1 className="text-3xl font-bold text-yellow-500 flex justify-center">Đăng nhập tài khoản</h1>
                <p className="mt-2 text-sm text-slate-600">
                    Điền thông tin bên dưới để đăng nhập vào tài khoản PizzaPalace của bạn.
                </p>

                <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="identifier">Email hoặc số điện thoại</FieldLabel>
                            <FieldContent>
                                <Input
                                    id="identifier"
                                    name="identifier"
                                    required
                                    type="text"
                                    autoComplete="username"
                                    placeholder="Ví dụ: 0987654321 hoặc user@example.com"
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
                                    autoComplete="current-password"
                                    placeholder="Nhập mật khẩu"
                                    required
                                    className="h-11 rounded-xl border-yellow-200 bg-white px-3 text-slate-800 focus-visible:border-yellow-500 focus-visible:ring-yellow-500/30"
                                    minLength={8}
                                />
                            </FieldContent>
                        </Field>
                    </FieldGroup>

                    <FieldError>{authError}</FieldError>

                    <button
                        type="submit"
                        disabled={isSigningIn}
                        className="mt-4 h-11 w-full rounded-xl bg-yellow-500 text-sm font-semibold text-white transition hover:bg-yellow-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/40 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSigningIn ? "Đang đăng nhập..." : "Đăng nhập"}
                    </button>
                </form>

                <div className="mt-4 text-right">
                    <Link href="/auth/forgot-password" className="text-sm font-semibold text-yellow-500 hover:text-yellow-600">
                        Quên mật khẩu?
                    </Link>
                </div>

                <p className="mt-5 text-center text-sm text-slate-600">
                    Bạn chưa có tài khoản?{" "}
                    <Link href="/auth/sign-up" className="font-semibold text-yellow-500 hover:text-yellow-600">
                        Đăng ký
                    </Link>
                </p>
            </section>
        </div>
    );
}

