import { NextResponse } from "next/server";

export async function GET() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pizzas`, { cache: "no-store" });
    const data = await res.json();
    const availablePizzas = Array.isArray(data)
        ? data.filter((product) => product?.isAvailable === true)
        : [];

    return NextResponse.json(availablePizzas);
}