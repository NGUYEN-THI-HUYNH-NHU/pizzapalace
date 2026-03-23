import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const signUpSchema = z.object({
    name: z.string().trim().min(1, "Họ tên không được để trống."),
    phone: z
        .string()
        .trim()
        .regex(/^(0|\+84)\d{9,10}$/, "Số điện thoại không hợp lệ."),
    password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự."),
});

export async function POST(request: NextRequest) {
    const body = (await request.json().catch(() => null)) as
        | { name?: string; phone?: string; password?: string }
        | null;

    const parsed = signUpSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { message: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ." },
            { status: 400 }
        );
    }

    try {
        const usersUrl = `${process.env.NEXT_PUBLIC_API_URL}/users`;

        const upstreamResponse = await fetch(usersUrl, {
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
                        `Đăng ký thất bại (upstream ${upstreamResponse.status}).`,
                },
                { status: upstreamResponse.status }
            );
        }

        return NextResponse.json(payload, { status: 201 });
    } catch {
        return NextResponse.json(
            { message: "Thiếu cấu hình URL API. Vui lòng kiểm tra biến môi trường." },
            { status: 502 }
        );
    }
}
