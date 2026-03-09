export default function CheckoutLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <section className="container mx-auto py-8">{children}
        </section>
    );
}
