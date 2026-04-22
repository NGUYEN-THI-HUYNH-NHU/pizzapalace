import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const phonePattern = /^(0|\+84)\d{9,10}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signInSchema = z.object({
    identifier: z
        .string()
        .trim()
        .refine(
            (value) => phonePattern.test(value) || emailPattern.test(value),
            "Email hoặc số điện thoại không hợp lệ."
        ),
    password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự."),
});

export async function POST(request: NextRequest) {
    const body = (await request.json().catch(() => null)) as
        | { identifier?: string; password?: string }
        | null;

    const parsed = signInSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { message: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ." },
            { status: 400 }
        );
    }

    let signInUrl = "";

    try {
        signInUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/sign-in`;

        const upstreamResponse = await fetch(signInUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parsed.data),
            cache: "no-store",
        });

        const payload = await upstreamResponse.json().catch(() => ({}));

        if (!upstreamResponse.ok) {
            return NextResponse.json(
                {
                    message:
                        payload?.message ||
                        `Đăng nhập thất bại (upstream ${upstreamResponse.status}).`,
                },
                { status: upstreamResponse.status }
            );
        }

        return NextResponse.json(payload, { status: 200 });
    } catch {
        return NextResponse.json(
            {
                message: signInUrl
                    ? "Không thể kết nối máy chủ. Vui lòng thử lại."
                    : "Thiếu cấu hình URL API. Vui lòng kiểm tra biến môi trường.",
            },
            { status: 502 }
        );
    }
}
