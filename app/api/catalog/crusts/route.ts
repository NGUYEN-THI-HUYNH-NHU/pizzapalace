import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const includeUnavailable =
        request.nextUrl.searchParams.get("includeUnavailable") === "true";

    const upstreamUrl = new URL(`${process.env.NEXT_PUBLIC_API_URL}/crusts`);

    if (includeUnavailable) {
        upstreamUrl.searchParams.set("includeUnavailable", "true");
    }

    try {
        const upstreamResponse = await fetch(upstreamUrl.toString(), {
            method: "GET",
            cache: "no-store",
        });

        const payload = await upstreamResponse.json().catch(() => []);

        if (!upstreamResponse.ok) {
            return NextResponse.json(
                {
                    message:
                        payload?.message ||
                        `Không thể lấy danh sách đế bánh (upstream ${upstreamResponse.status}).`,
                },
                { status: upstreamResponse.status }
            );
        }

        return NextResponse.json(payload, { status: 200 });
    } catch {
        return NextResponse.json(
            { message: "Không thể kết nối máy chủ lấy danh sách đế bánh." },
            { status: 502 }
        );
    }
}
