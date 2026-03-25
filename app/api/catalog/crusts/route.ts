import { NextResponse } from "next/server";

export async function GET() {
    const upstreamUrl = new URL(`${process.env.NEXT_PUBLIC_API_URL}/crusts`);

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

        console.log(payload);

        return NextResponse.json(payload, { status: 200 });
    } catch {
        return NextResponse.json(
            { message: "Không thể kết nối máy chủ lấy danh sách đế bánh." },
            { status: 502 }
        );
    }
}
