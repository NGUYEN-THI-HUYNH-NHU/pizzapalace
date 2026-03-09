export default function AccountLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <section className="container mx-auto py-8">
            {children}
        </section>
    );
}
