import { NextRequest, NextResponse } from "next/server";

import { buildExpiredSessionCookie, getSessionUserFromCookie } from "@/lib/auth-session";

type ChangePasswordBody = {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
};

export async function PUT(request: NextRequest) {
    const sessionUser = await getSessionUserFromCookie();

    if (!sessionUser?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as ChangePasswordBody | null;

    const currentPassword = String(body?.currentPassword || "");
    const newPassword = String(body?.newPassword || "");
    const confirmPassword = String(body?.confirmPassword || "");

    if (!currentPassword || !newPassword || !confirmPassword) {
        return NextResponse.json({ message: "Vui lòng nhập đầy đủ thông tin mật khẩu." }, { status: 400 });
    }

    if (newPassword.length < 8) {
        return NextResponse.json({ message: "Mật khẩu mới phải có ít nhất 8 ký tự." }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
        return NextResponse.json({ message: "Mật khẩu xác nhận không khớp." }, { status: 400 });
    }

    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/users/${sessionUser.id}/password`;

    try {
        const upstreamResponse = await fetch(endpoint, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
            cache: "no-store",
        });

        const payload = await upstreamResponse.json().catch(() => ({}));

        if (!upstreamResponse.ok) {
            return NextResponse.json(
                {
                    message:
                        payload?.message ||
                        `Đổi mật khẩu thất bại (upstream ${upstreamResponse.status}).`,
                },
                { status: upstreamResponse.status }
            );
        }

        const response = NextResponse.json({ message: payload?.message || "Đổi mật khẩu thành công." }, { status: 200 });
        response.cookies.set(buildExpiredSessionCookie());
        return response;
    } catch {
        return NextResponse.json(
            { message: "Không thể kết nối máy chủ đổi mật khẩu." },
            { status: 502 }
        );
    }
}
