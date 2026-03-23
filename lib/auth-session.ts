import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

type SessionUser = {
    id?: string;
    name?: string | null;
    phone?: string | null;
    address?: string | null;
};

export const AUTH_SESSION_COOKIE = "pp_session";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

const isStringOrNullOrUndefined = (value: unknown): value is string | null | undefined =>
    typeof value === "string" || value === null || typeof value === "undefined";

const normalizeSessionUser = (value: unknown): SessionUser | null => {
    if (!value || typeof value !== "object") {
        return null;
    }

    const payload = value as Record<string, unknown>;

    if (!(typeof payload.id === "string" || typeof payload.id === "undefined")) {
        return null;
    }

    if (!isStringOrNullOrUndefined(payload.name)) {
        return null;
    }

    if (!isStringOrNullOrUndefined(payload.phone)) {
        return null;
    }

    if (!isStringOrNullOrUndefined(payload.address)) {
        return null;
    }

    return {
        id: payload.id,
        name: payload.name,
        phone: payload.phone,
        address: payload.address,
    };
};

const getSessionSecret = () => {
    const rawSecret = process.env.AUTH_SESSION_SECRET;

    if (rawSecret) {
        return new TextEncoder().encode(rawSecret);
    }

    if (process.env.NODE_ENV !== "production") {
        return new TextEncoder().encode("pizzapalace-dev-session-secret");
    }

    throw new Error("Missing AUTH_SESSION_SECRET in production environment.");
};

export const parseSessionUser = (value: string | undefined): SessionUser | null => {
    if (!value) {
        return null;
    }

    try {
        return normalizeSessionUser(JSON.parse(value));
    } catch {
        return null;
    }
};

const verifySessionToken = async (value: string): Promise<SessionUser | null> => {
    try {
        const { payload } = await jwtVerify(value, getSessionSecret(), {
            algorithms: ["HS256"],
        });

        return normalizeSessionUser(payload);
    } catch {
        return null;
    }
};

export const getSessionUserFromCookie = async (): Promise<SessionUser | null> => {
    const cookieStore = await cookies();
    const rawSession = cookieStore.get(AUTH_SESSION_COOKIE)?.value;

    if (!rawSession) {
        return null;
    }

    const jwtUser = await verifySessionToken(rawSession);

    if (jwtUser) {
        return jwtUser;
    }

    // Backward compatibility for old plain JSON cookies.
    return parseSessionUser(rawSession);
};

export const buildSessionCookie = async (user: SessionUser) => {
    const normalizedUser = normalizeSessionUser(user);

    if (!normalizedUser?.id) {
        throw new Error("Invalid session payload.");
    }

    const token = await new SignJWT({
        id: normalizedUser.id,
        name: normalizedUser.name ?? null,
        phone: normalizedUser.phone ?? null,
        address: normalizedUser.address ?? null,
    })
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .setIssuedAt()
        .setExpirationTime(`${SESSION_MAX_AGE}s`)
        .sign(getSessionSecret());

    return {
        name: AUTH_SESSION_COOKIE,
        value: token,
        httpOnly: true,
        sameSite: "lax" as const,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: SESSION_MAX_AGE,
    };
};

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
