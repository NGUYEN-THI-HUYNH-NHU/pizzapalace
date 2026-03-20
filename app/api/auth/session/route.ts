import { NextRequest, NextResponse } from "next/server";

import {
    buildExpiredSessionCookie,
    buildSessionCookie,
    getSessionUserFromCookie,
    type SessionUser,
} from "@/lib/auth-session";

export async function GET() {
    const user = await getSessionUserFromCookie();

    if (!user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(user, { status: 200 });
}

export async function POST(request: NextRequest) {
    const body = (await request.json().catch(() => null)) as SessionUser | null;

    if (!body?.id) {
        return NextResponse.json({ message: "Invalid session payload" }, { status: 400 });
    }

    const response = NextResponse.json(body, { status: 200 });
    response.cookies.set(buildSessionCookie(body));

    return response;
}

export async function PATCH(request: NextRequest) {
    const existingUser = await getSessionUserFromCookie();
    const body = (await request.json().catch(() => null)) as Partial<SessionUser> | null;

    if (!existingUser?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!body) {
        return NextResponse.json({ message: "Invalid session payload" }, { status: 400 });
    }

    const mergedUser: SessionUser = {
        ...existingUser,
        ...body,
        id: existingUser.id,
    };

    const response = NextResponse.json(mergedUser, { status: 200 });
    response.cookies.set(buildSessionCookie(mergedUser));

    return response;
}

export async function DELETE() {
    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.set(buildExpiredSessionCookie());

    return response;
}
