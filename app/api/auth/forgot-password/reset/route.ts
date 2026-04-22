import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const resetSchema = z
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

export async function POST(request: NextRequest) {
    const body = (await request.json().catch(() => null)) as
        | {
            email?: string;
            code?: string;
            newPassword?: string;
            confirmPassword?: string;
        }
        | null;

    const parsed = resetSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { message: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ." },
            { status: 400 }
        );
    }

    try {
        const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password/reset`;

        const upstreamResponse = await fetch(endpoint, {
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
                        `Đặt lại mật khẩu thất bại (upstream ${upstreamResponse.status}).`,
                },
                { status: upstreamResponse.status }
            );
        }

        return NextResponse.json(payload, { status: 200 });
    } catch {
        return NextResponse.json(
            { message: "Không thể kết nối máy chủ đặt lại mật khẩu." },
            { status: 502 }
        );
    }
}
