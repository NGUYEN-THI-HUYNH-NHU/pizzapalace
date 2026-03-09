type OrderSuccessPageProps = {
    params: Promise<{
        orderId: string;
    }>;
};

export default async function OrderSuccessPage({
    params,
}: OrderSuccessPageProps) {
    const { orderId } = await params;

    return (
        <main>
            <h1 className="text-2xl font-semibold">Đặt hàng thành công</h1>
            <p className="mt-2 text-muted-foreground">Mã đơn hàng: {orderId}</p>
        </main>
    );
}
