import Link from 'next/link';

type OrderSuccessPageProps = {
    params: Promise<{ orderId: string }>;
};

export default async function OrderSuccessPage({
    params,
}: OrderSuccessPageProps) {
    const { orderId } = await params;

    return (
        <main className="max-w-292.5 mx-auto p-4 md:p-6 min-h-screen font-sans text-gray-800 bg-gray-50 md:bg-white">
            <div className="bg-white border-0 md:border md:border-gray-200 rounded-2xl p-6 md:p-12 shadow-sm md:shadow-none text-center">
                <div className="mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">Đặt hàng thành công!</h1>
                    <p className="text-gray-600">Cảm ơn bạn đã đặt hàng tại PizzaPalace</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-600 mb-1">Mã đơn hàng</p>
                    <p className="text-lg font-semibold text-black">{orderId}</p>
                </div>

                <div className="space-y-3 text-sm text-gray-600 mb-8">
                    <p>• Bạn sẽ nhận được email xác nhận đơn hàng trong vài phút</p>
                    <p>• Email sẽ có mã đơn hàng và số điện thoại để tra cứu lại bất cứ lúc nào</p>
                    <p>• Thời gian giao hàng dự kiến: 30-45 phút</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                    >
                        Tiếp tục mua sắm
                    </Link>
                    <Link
                        href="/order"
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Xem đơn hàng
                    </Link>
                </div>
            </div>
        </main>
    );
}
