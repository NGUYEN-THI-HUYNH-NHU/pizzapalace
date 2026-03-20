import { User } from "@/type";

const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const URL = apiBase.endsWith("/api") ? `${apiBase}/users` : `${apiBase}/api/users`;

const getUsers = async (): Promise<Pick<User, "id" | "name" | "phone" | "role" | "createdAt">[]> => {
    if (!apiBase) {
        return [];
    }

    const res = await fetch(URL, { cache: "no-store" });

    if (!res.ok) {
        throw new Error(`Failed to fetch users: ${res.status}`);
    }

    return res.json();
};

export default getUsers;
