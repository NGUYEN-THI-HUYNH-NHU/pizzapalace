import { NextRequest, NextResponse } from "next/server";

import { buildSessionCookie, getSessionUserFromCookie } from "@/lib/auth-session";

export async function GET() {
    const sessionUser = await getSessionUserFromCookie();

    if (!sessionUser?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const usersEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/users/${sessionUser.id}`;

    try {
        const upstreamResponse = await fetch(usersEndpoint, {
            method: "GET",
            cache: "no-store",
        });

        const payload = await upstreamResponse.json().catch(() => ({}));

        if (!upstreamResponse.ok) {
            return NextResponse.json(
                {
                    message:
                        payload?.message ||
                        `Không thể lấy hồ sơ (upstream ${upstreamResponse.status}).`,
                },
                { status: upstreamResponse.status }
            );
        }

        const hydratedUser = {
            id: sessionUser.id,
            name: payload?.name ?? sessionUser.name ?? null,
            phone: payload?.phone ?? sessionUser.phone ?? null,
            address: payload?.address ?? sessionUser.address ?? null,
        };

        const response = NextResponse.json(hydratedUser, { status: 200 });
        response.cookies.set(await buildSessionCookie(hydratedUser));
        return response;
    } catch {
        return NextResponse.json(
            { message: "Không thể kết nối máy chủ lấy hồ sơ." },
            { status: 502 }
        );
    }
}

export async function PUT(request: NextRequest) {
    const sessionUser = await getSessionUserFromCookie();

    if (!sessionUser?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as {
        name?: string;
        phone?: string;
        address?: string;
    } | null;
    const name = String(body?.name || "").trim();
    const phone = String(body?.phone || "").trim();
    const address = typeof body?.address === "string" ? body.address.trim() : undefined;

    if (!name) {
        return NextResponse.json({ message: "Họ tên không được để trống." }, { status: 400 });
    }

    if (!/^(0|\+84)\d{9,10}$/.test(phone)) {
        return NextResponse.json({ message: "Số điện thoại không hợp lệ." }, { status: 400 });
    }

    const usersEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/users/${sessionUser.id}`;

    try {
        const upstreamResponse = await fetch(usersEndpoint, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, phone, address }),
            cache: "no-store",
        });

        const payload = await upstreamResponse.json().catch(() => ({}));

        if (!upstreamResponse.ok) {
            return NextResponse.json(
                {
                    message:
                        payload?.message ||
                        `Cập nhật thất bại (upstream ${upstreamResponse.status}).`,
                },
                { status: upstreamResponse.status }
            );
        }

        const updatedSessionUser = {
            ...sessionUser,
            name: payload?.name ?? name,
            phone: payload?.phone ?? phone,
            address: payload?.address ?? address ?? sessionUser.address,
        };

        const response = NextResponse.json(payload, { status: 200 });
        response.cookies.set(await buildSessionCookie(updatedSessionUser));
        return response;
    } catch {
        return NextResponse.json(
            { message: "Không thể kết nối máy chủ cập nhật hồ sơ." },
            { status: 502 }
        );
    }
}
