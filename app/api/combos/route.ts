import { NextResponse } from "next/server";

export async function GET() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/combos`, { cache: "no-store" });
    const data = await res.json();
    const availableCombos = Array.isArray(data)
        ? data.filter((product) => product?.isAvailable === true)
        : [];

    return NextResponse.json(availableCombos);
}