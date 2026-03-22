import { User } from "@/type";

const URL = `${process.env.NEXT_PUBLIC_API_URL}/users`;

const getUsers = async (): Promise<Pick<User, "id" | "name" | "phone" | "role" | "createdAt">[]> => {
    const res = await fetch(URL, { cache: "no-store" });

    if (!res.ok) {
        throw new Error(`Failed to fetch users: ${res.status}`);
    }

    return res.json();
};

export default getUsers;
