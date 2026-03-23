"use client";

import { FormEvent, KeyboardEvent, useRef, useState } from "react";
import Link from "next/link";
import { z } from "zod";

import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

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
    const [values, setValues] = useState({
        fullName: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [fieldErrors, setFieldErrors] = useState<Record<keyof typeof values, string>>({
        fullName: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const router = useRouter();

    const fullNameRef = useRef<HTMLInputElement>(null);
    const phoneRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const confirmPasswordRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const validateField = (
        field: keyof typeof values,
        currentValues: typeof values
    ) => {
        switch (field) {
            case "fullName":
                return currentValues.fullName.trim().length > 0 ? "" : "Họ tên không được để trống.";
            case "phone":
                return /^(0|\+84)\d{9,10}$/.test(currentValues.phone.trim())
                    ? ""
                    : "Số điện thoại không hợp lệ.";
            case "password":
                return currentValues.password.length >= 8
                    ? ""
                    : "Mật khẩu phải có ít nhất 8 ký tự.";
            case "confirmPassword":
                if (currentValues.confirmPassword.length < 8) {
                    return "Mật khẩu xác nhận phải có ít nhất 8 ký tự.";
                }
                if (currentValues.password !== currentValues.confirmPassword) {
                    return "Mật khẩu xác nhận không khớp.";
                }
                return "";
            default:
                return "";
        }
    };

    const updateValue = (field: keyof typeof values, value: string) => {
        setValues((prev) => {
            const nextValues = {
                ...prev,
                [field]: value,
            };

            setFieldErrors((prevErrors) => ({
                ...prevErrors,
                [field]: validateField(field, nextValues),
                ...(field === "password"
                    ? {
                        confirmPassword:
                            nextValues.confirmPassword.length > 0
                                ? validateField("confirmPassword", nextValues)
                                : "",
                    }
                    : {}),
            }));

            return nextValues;
        });
    };

    const handleEnterKey = (
        e: KeyboardEvent<HTMLInputElement>,
        field: keyof typeof values,
        nextFieldRef?: React.RefObject<HTMLInputElement | null>
    ) => {
        if (e.key !== "Enter") {
            return;
        }

        e.preventDefault();

        const fieldError = validateField(field, values);

        setFieldErrors((prev) => ({
            ...prev,
            [field]: fieldError,
        }));

        if (fieldError) {
            return;
        }

        if (nextFieldRef?.current) {
            nextFieldRef.current.focus();
            return;
        }

        formRef.current?.requestSubmit();
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage("");

        const parsed = signUpSchema.safeParse(values);

        if (!parsed.success) {
            const nextFieldErrors: Record<keyof typeof values, string> = {
                fullName: "",
                phone: "",
                password: "",
                confirmPassword: "",
            };

            for (const issue of parsed.error.issues) {
                const key = issue.path[0] as keyof typeof values | undefined;
                if (key && !nextFieldErrors[key]) {
                    nextFieldErrors[key] = issue.message;
                }
            }

            setFieldErrors(nextFieldErrors);
            setErrorMessage(parsed.error.issues[0]?.message || "Thông tin không hợp lệ.");
            return;
        }

        const usersUrl = "/api/auth/sign-up";

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

            setValues({
                fullName: "",
                phone: "",
                password: "",
                confirmPassword: "",
            });
            setFieldErrors({
                fullName: "",
                phone: "",
                password: "",
                confirmPassword: "",
            });
            toast.success("Tạo tài khoản thành công! Bạn có thể đăng nhập ngay.");
            router.push('/auth/sign-in');
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

                <form ref={formRef} className="mt-6 space-y-5" onSubmit={handleSubmit}>
                    <FieldGroup>
                        <Field data-invalid={!!fieldErrors.fullName}>
                            <FieldLabel htmlFor="fullName">Họ tên</FieldLabel>
                            <FieldContent>
                                <Input
                                    ref={fullNameRef}
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    autoComplete="name"
                                    placeholder="Nhập họ và tên"
                                    value={values.fullName}
                                    onChange={(e) => updateValue("fullName", e.target.value)}
                                    onKeyDown={(e) => handleEnterKey(e, "fullName", phoneRef)}
                                    aria-invalid={!!fieldErrors.fullName}
                                    className="h-11 rounded-xl border-yellow-200 bg-white px-3 text-slate-800 focus-visible:border-yellow-500 focus-visible:ring-yellow-500/30"
                                />
                                <FieldError>{fieldErrors.fullName}</FieldError>
                            </FieldContent>
                        </Field>

                        <Field data-invalid={!!fieldErrors.phone}>
                            <FieldLabel htmlFor="phone">Số điện thoại</FieldLabel>
                            <FieldContent>
                                <Input
                                    ref={phoneRef}
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    autoComplete="tel"
                                    inputMode="numeric"
                                    placeholder="Ví dụ: 0987654321"
                                    value={values.phone}
                                    onChange={(e) => updateValue("phone", e.target.value)}
                                    onKeyDown={(e) => handleEnterKey(e, "phone", passwordRef)}
                                    aria-invalid={!!fieldErrors.phone}
                                    className="h-11 rounded-xl border-yellow-200 bg-white px-3 text-slate-800 focus-visible:border-yellow-500 focus-visible:ring-yellow-500/30"
                                />
                                <FieldError>{fieldErrors.phone}</FieldError>
                            </FieldContent>
                        </Field>

                        <Field data-invalid={!!fieldErrors.password}>
                            <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                            <FieldContent>
                                <Input
                                    ref={passwordRef}
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Nhập mật khẩu"
                                    value={values.password}
                                    onChange={(e) => updateValue("password", e.target.value)}
                                    onKeyDown={(e) => handleEnterKey(e, "password", confirmPasswordRef)}
                                    aria-invalid={!!fieldErrors.password}
                                    className="h-11 rounded-xl border-yellow-200 bg-white px-3 text-slate-800 focus-visible:border-yellow-500 focus-visible:ring-yellow-500/30"
                                    minLength={8}
                                />
                                <FieldError>{fieldErrors.password}</FieldError>
                            </FieldContent>
                        </Field>

                        <Field data-invalid={!!fieldErrors.confirmPassword}>
                            <FieldLabel htmlFor="confirmPassword">Xác nhận mật khẩu</FieldLabel>
                            <FieldContent>
                                <Input
                                    ref={confirmPasswordRef}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Nhập lại mật khẩu"
                                    value={values.confirmPassword}
                                    onChange={(e) => updateValue("confirmPassword", e.target.value)}
                                    onKeyDown={(e) => handleEnterKey(e, "confirmPassword")}
                                    aria-invalid={!!fieldErrors.confirmPassword}
                                    className="h-11 rounded-xl border-yellow-200 bg-white px-3 text-slate-800 focus-visible:border-yellow-500 focus-visible:ring-yellow-500/30"
                                    minLength={8}
                                />
                                <FieldError>{fieldErrors.confirmPassword}</FieldError>
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
