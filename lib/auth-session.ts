import { cookies } from "next/headers";

type SessionUser = {
    id?: string;
    name?: string | null;
    phone?: string | null;
    address?: string | null;
};

export const AUTH_SESSION_COOKIE = "pp_session";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export const parseSessionUser = (value: string | undefined): SessionUser | null => {
    if (!value) {
        return null;
    }

    try {
        return JSON.parse(value) as SessionUser;
    } catch {
        return null;
    }
};

export const getSessionUserFromCookie = async (): Promise<SessionUser | null> => {
    const cookieStore = await cookies();
    const rawSession = cookieStore.get(AUTH_SESSION_COOKIE)?.value;
    return parseSessionUser(rawSession);
};

export const buildSessionCookie = (user: SessionUser) => ({
    name: AUTH_SESSION_COOKIE,
    value: JSON.stringify(user),
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
});

export const buildExpiredSessionCookie = () => ({
    name: AUTH_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
});

export type { SessionUser };
