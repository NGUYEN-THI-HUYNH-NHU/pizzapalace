import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const sendCodeSchema = z.object({
    email: z.string().trim().email("Email không hợp lệ."),
});

export async function POST(request: NextRequest) {
    const body = (await request.json().catch(() => null)) as { email?: string } | null;

    const parsed = sendCodeSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { message: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ." },
            { status: 400 }
        );
    }

    try {
        const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password/send-code`;

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
                        `Không thể gửi mã xác nhận (upstream ${upstreamResponse.status}).`,
                },
                { status: upstreamResponse.status }
            );
        }

        return NextResponse.json(payload, { status: 200 });
    } catch {
        return NextResponse.json(
            { message: "Không thể kết nối máy chủ gửi mã xác nhận." },
            { status: 502 }
        );
    }
}
