import Footer from "@/components/footer";
import Link from "next/link";

const CartPage = () => {
    return (
        <div className="min-h-screen bg-white">
            <div className="p-3 px-4">
                <div className="flex items-center justify-center">
                    <Link href="/" className="font-bold text-xl">
                        <p className="font-bold text-2xl">PizzaPalace</p>
                    </Link>
                </div>
                <div className="mt-3 flex items-center justify-center">
                    <h2>GIỎ HÀNG</h2>
                </div>
            </div>
            <main className="mx-auto max-w-7xl px-4 pt-28 pb-12">
                Cart Page
            </main>
            <Footer />
        </div >
    );
}

export default CartPage;